import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://tpzynmrlwuupchhdhfxb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SSb_Ww3vsSrW8n-wIp7ZUQ_zNfcWCUP";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
let currentUser = null;

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 3000);
}
function categoryValue(label) {
  const s = label.toLowerCase();
  if (s.includes("food")) return "food";
  if (s.includes("education")) return "education";
  if (s.includes("work") || s.includes("skill")) return "work";
  if (s.includes("health")) return "health";
  if (s.includes("environment")) return "other";
  return "other";
}
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function dateLabel(value) {
  return new Date(value).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function updateAuthUI(user) {
  currentUser = user || null;
  $("authStatus").textContent = user ? (user.email || "Signed in") : "Guest workspace";
  $("authToggle").classList.toggle("hidden", !!user);
  $("signOutBtn").classList.toggle("hidden", !user);
  $("authPanel").classList.add("hidden");
  $("helpForm").querySelector('button[type="submit"]').textContent = user ? "Publish to community" : "Sign in to publish";
}
async function authAction(mode) {
  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  const displayName = $("authName").value.trim() || email.split("@")[0];
  if (!email || password.length < 8) return toast("Valid email aur minimum 8-character password enter karein.");
  const result = mode === "signup"
    ? await supabase.auth.signUp({email,password,options:{data:{display_name:displayName}}})
    : await supabase.auth.signInWithPassword({email,password});
  if (result.error) return toast(result.error.message);
  if (mode === "signup" && !result.data.session) {
    toast("Account request created. Email confirmation complete karke sign in karein.");
  } else {
    updateAuthUI(result.data.user);
    toast(mode === "signup" ? "Account created. Welcome!" : "Signed in successfully.");
  }
}
$("authToggle").addEventListener("click", () => $("authPanel").classList.toggle("hidden"));
$("loginBtn").addEventListener("click", () => authAction("login"));
$("signupBtn").addEventListener("click", () => authAction("signup"));
$("signOutBtn").addEventListener("click", async () => {
  const {error}=await supabase.auth.signOut();
  if(error) return toast(error.message);
  updateAuthUI(null); toast("Signed out.");
});
supabase.auth.onAuthStateChange((_event, session) => updateAuthUI(session?.user || null));
const {data:{session}} = await supabase.auth.getSession();
updateAuthUI(session?.user || null);

async function loadCommunity() {
  const [requests, offers] = await Promise.all([
    supabase.from("help_requests").select("id,user_id,category,title,description,city,state,status,created_at,profiles(display_name)").in("status",["open","in_progress"]).order("created_at",{ascending:false}).limit(40),
    supabase.from("help_offers").select("id,user_id,category,title,description,city,state,status,created_at,profiles(display_name)").eq("status","active").order("created_at",{ascending:false}).limit(40)
  ]);
  if (requests.error || offers.error) {
    $("helpList").textContent = "Community board load nahi hua. Sign in karke dobara try karein.";
    return;
  }
  const rows = [
    ...(requests.data||[]).map(x=>({...x,entry_type:"Need help"})),
    ...(offers.data||[]).map(x=>({...x,entry_type:"Offering help"}))
  ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,40);
  $("helpTotal").textContent = rows.length;
  $("helpCount").textContent = rows.length;
  if (!rows.length) {
    $("helpList").textContent = "Abhi koi public community entry nahi hai. Pehli entry publish karein.";
    return;
  }
  $("helpList").innerHTML = '<div class="entry-list">'+rows.map(x=>(
    '<article class="entry"><div class="entry-top"><span class="entry-title">'+safe(x.title)+'</span><span class="entry-tag">'+safe(x.entry_type)+'</span></div>'+
    '<div class="entry-meta">'+safe(x.category)+' · '+safe(x.city)+', '+safe(x.state)+' · '+dateLabel(x.created_at)+' · '+safe(x.profiles?.display_name||"Community member")+'</div>'+
    '<p>'+safe(x.description)+'</p>'+
    (currentUser && currentUser.id===x.user_id ? '<button class="delete-entry" data-cloud-delete="'+safe(x.id)+'" data-kind="'+(x.entry_type==="Need help"?"help_requests":"help_offers")+'">Delete my post</button>' : '')+
    '</article>'
  )).join("")+'</div>';
  $("helpList").querySelectorAll("[data-cloud-delete]").forEach(btn=>btn.addEventListener("click",async()=>{
    if(!confirm("Apni community post delete karni hai?")) return;
    const {error}=await supabase.from(btn.dataset.kind).delete().eq("id",btn.dataset.cloudDelete).eq("user_id",currentUser.id);
    if(error) toast(error.message); else {toast("Post deleted.");loadCommunity();}
  }));
}
document.addEventListener("submit", async (event) => {
  if (event.target.id !== "helpForm") return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!currentUser) {
    $("authPanel").classList.remove("hidden");
    return toast("Community post ke liye pehle sign in karein.");
  }
  const title=$("helpTitle").value.trim();
  const description=$("helpDetails").value.trim();
  const city=$("helpLocation").value.trim();
  const state=$("helpState").value.trim();
  if(title.length<5 || description.length<10 || !city || !state) return toast("Title, 10+ character details, city aur state required hain.");
  const table=$("helpType").value==="I need help"?"help_requests":"help_offers";
  const payload={user_id:currentUser.id,category:categoryValue($("helpCategory").value),title,description,city,state};
  const {error}=await supabase.from(table).insert(payload);
  if(error) return toast(error.message);
  event.target.reset();
  toast("Community post successfully publish ho gayi.");
  await loadCommunity();
}, true);
loadCommunity();
