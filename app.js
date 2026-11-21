(() => {
  "use strict";
  const STORE = "humanityos.v1";
  const blank = { help: [], earth: [] };
  let data = load();
  const $ = (id) => document.getElementById(id);
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE) || "null");
      return parsed && Array.isArray(parsed.help) && Array.isArray(parsed.earth) ? parsed : structuredClone(blank);
    } catch (_) { return { help: [], earth: [] }; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(data)); return true; }
    catch (_) { toast("Storage unavailable. Your browser may be out of space."); return false; }
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function dateLabel(value) {
    return new Date(value).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }
  let toastTimer;
  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function navigate(view) {
    document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
    window.scrollTo({ top:0, behavior:"smooth" });
  }
  document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => navigate(el.dataset.go)));
  $("todayLabel").textContent = new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" });

  function renderHelp() {
    $("helpTotal").textContent = data.help.length;
    $("helpCount").textContent = data.help.length;
    $("helpList").innerHTML = data.help.length ? '<div class="entry-list">' + data.help.slice().reverse().map(item =>
      '<article class="entry"><div class="entry-top"><span class="entry-title">' + esc(item.title) + '</span><span class="entry-tag">' + esc(item.type) + '</span></div><div class="entry-meta">' + esc(item.category) + (item.location ? " · " + esc(item.location) : "") + " · " + dateLabel(item.created) + '</div>' +
      (item.details ? '<p>' + esc(item.details) + '</p>' : '') + '<button class="delete-entry" data-delete-help="' + esc(item.id) + '" aria-label="Delete entry">Delete</button></article>'
    ).join("") + '</div>' : "No entries yet. Add a need or an offer to begin.";
    $("helpList").querySelectorAll("[data-delete-help]").forEach(btn => btn.addEventListener("click", () => {
      data.help = data.help.filter(x => x.id !== btn.dataset.deleteHelp); if (save()) { render(); toast("Entry deleted from this device."); }
    }));
  }
  $("helpForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("helpTitle").value.trim();
    if (!title) return toast("Please add a short title.");
    data.help.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type:$("helpType").value, category:$("helpCategory").value, title, location:$("helpLocation").value.trim(), details:$("helpDetails").value.trim(), created:new Date().toISOString() });
    if (save()) { event.target.reset(); render(); toast("Entry saved on this device."); }
  });

  function renderEarth() {
    $("earthTotal").textContent = data.earth.length;
    $("earthCount").textContent = data.earth.length;
    $("earthList").innerHTML = data.earth.length ? '<div class="entry-list">' + data.earth.slice().reverse().map(item =>
      '<article class="entry"><div class="entry-top"><span class="entry-title">' + esc(item.type) + '</span><span class="entry-tag">' + dateLabel(item.created) + '</span></div>' +
      (item.note ? '<p>' + esc(item.note) + '</p>' : '') + '<button class="delete-entry" data-delete-earth="' + esc(item.id) + '" aria-label="Delete action">Delete</button></article>'
    ).join("") + '</div>' : "Your positive actions will appear here.";
    $("earthList").querySelectorAll("[data-delete-earth]").forEach(btn => btn.addEventListener("click", () => {
      data.earth = data.earth.filter(x => x.id !== btn.dataset.deleteEarth); if (save()) { render(); toast("Action removed from this device."); }
    }));
  }
  $("earthForm").addEventListener("submit", event => {
    event.preventDefault();
    data.earth.push({ id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type:$("earthType").value, note:$("earthNote").value.trim(), created:new Date().toISOString() });
    if (save()) { event.target.reset(); render(); toast("Action added to your local log."); }
  });

  $("solveBtn").addEventListener("click", () => {
    const text = $("solverInput").value.trim();
    if (text.length < 8) return toast("Describe the situation in a little more detail.");
    const topic = $("solverTopic").value;
    const plans = {
      money:["Write down the exact amount, due date and essential expenses.","Separate needs from optional spending; pause non-essential purchases temporarily.","Contact the relevant provider or creditor through an official channel to ask about safe options.","Avoid instant-loan links, advance-fee offers and anyone asking for an OTP or PIN.","Choose one realistic action you can take today and review it tomorrow."],
      work:["Name the role, skill or outcome you want to reach.","Break the gap into one small skill you can practise for 20–30 minutes.","Use an established free learning resource and check its official details.","Create one small proof of work: a sample, project or practice task.","Ask a trusted person for specific feedback and decide the next step."],
      digital:["Stop interacting with the suspicious page, caller or message for now.","Do not share passwords, OTPs, PINs or remote-access permissions.","Open the official app or type the known website address yourself.","If money or an account may be at risk, contact your bank or service provider using official contact details.","Save relevant evidence safely and report through the official channel if needed."],
      daily:["Describe the outcome you need in one sentence.","List what is urgent, what can wait and what is within your control.","Identify one trusted person, service or official source that can help.","Take the smallest safe action first; avoid sharing sensitive details publicly.","Check what changed and adjust the next step."],
      community:["Define the need without exposing anyone's private information.","Identify a trusted local organisation, public service or community group.","Ask what support is actually available and what verification they require.","Get consent before sharing another person's story, photo or contact details.","Record only what happened; do not claim an outcome that is not confirmed."]
    };
    const names = {money:"Money & budgeting",work:"Work & learning",digital:"Digital safety",daily:"Daily life",community:"Community support"};
    $("solverResult").innerHTML = '<span class="eyebrow">' + names[topic] + '</span><ol class="plan-list">' + plans[topic].map(x => '<li>' + esc(x) + '</li>').join("") + '</ol><div class="result-note"><b>Your situation:</b> ' + esc(text.slice(0,220)) + (text.length > 220 ? "…" : "") + '<br>This is a general planning checklist, not a professional assessment. For immediate danger or emergencies, contact appropriate local emergency services.</div>';
  });

  const patterns = [
    { re:/\b(otp|one[- ]time password|pin|cvv|password)\b/i, label:"Requests for OTPs, PINs, CVV or passwords" },
    { re:/\b(urgent|immediately|right now|within \d+ minutes|account will be blocked|last warning)\b/i, label:"Urgency or threat-based pressure" },
    { re:/\b(prize|lottery|won|winner|free gift|claim reward)\b/i, label:"Unexpected prize or reward claims" },
    { re:/\b(pay first|processing fee|advance fee|registration fee|unlock payment)\b/i, label:"Requests for advance or release fees" },
    { re:/\b(remote access|screen share|install this app|anydesk|teamviewer)\b/i, label:"Requests for remote access or screen sharing" },
    { re:/https?:\/\/|www\./i, label:"Contains a web link — verify its exact domain independently" },
    { re:/\b(upi id|bank details|account number|send money|transfer now)\b/i, label:"Financial details or money-transfer language" }
  ];
  $("checkScam").addEventListener("click", () => {
    const message = $("scamText").value.trim();
    if (message.length < 8) return toast("Paste a message with enough text to review.");
    const found = patterns.filter(p => p.re.test(message));
    const intro = found.length ? "Potential warning signs found" : "No common warning pattern detected";
    const advice = found.length ? "Do not click, pay or reply yet. Verify through an independently obtained official contact channel." : "A message can still be fraudulent without these patterns. Verify the sender, exact domain and request independently before acting.";
    $("scamResult").innerHTML = '<span class="eyebrow">' + (found.length ? "REVIEW NEEDED" : "BASIC CHECK COMPLETE") + '</span><h3 style="font:700 16px Manrope;margin:9px 0">' + intro + '</h3>' +
      (found.length ? '<ul class="plan-list">' + found.map(p => '<li>' + esc(p.label) + '</li>').join("") + '</ul>' : '<p style="color:#71817d;font-size:11px;line-height:1.6">No matches from this limited checklist.</p>') +
      '<div class="result-note">' + advice + '<br><b>Important:</b> This is a basic text-pattern check, not a security scan or a fraud verdict.</div>';
  });

  function renderImpact() {
    const total = data.help.length + data.earth.length;
    $("totalCount").textContent = total;
    $("impactTotal").textContent = total;
    $("impactHelp").textContent = data.help.length;
    $("impactEarth").textContent = data.earth.length;
  }
  function render() { renderHelp(); renderEarth(); renderImpact(); }
  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ exportedAt:new Date().toISOString(), note:"Local user-entered records; not independently verified.", ...data }, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "humanityos-my-data.json"; a.click(); URL.revokeObjectURL(url); toast("Your local data export was prepared.");
  });
  $("clearBtn").addEventListener("click", () => {
    if (!confirm("Delete all Humanity OS entries stored in this browser? This cannot be undone.")) return;
    data = { help:[], earth:[] };
    try { localStorage.removeItem(STORE); render(); toast("All Humanity OS local entries cleared."); }
    catch (_) { toast("Could not clear browser storage."); }
  });
  render();
})();