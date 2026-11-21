# Humanity OS

**Small actions. Human impact.** A human-first, mobile-friendly platform for everyday problem-solving, community support, open learning, digital safety and local environmental action.

## MVP modules

- **NeedBridge** — record a request for help or an offer of support.
- **LifeSolver** — turn an everyday challenge into a practical checklist.
- **OpenKnowledge** — access established free learning platforms.
- **EarthGuardian** — log personal environmental actions.
- **HumanShield** — review text for common scam warning signs.
- **Humanity Impact** — view a transparent count of activity recorded locally.

## Run it

This is a static website. Open `index.html` in a browser, or deploy the repository as a static site (for example, with GitHub Pages or Vercel).

No build step, paid API key, account or server is required for this MVP.

## Privacy and limitations

- NeedBridge and EarthGuardian entries are saved in the current browser using `localStorage`.
- Entries are **not uploaded, shared, matched or visible to other users**.
- Use the Export option to download your records, or Clear local data to remove them.
- Humanity Impact counts user-entered local records only. It does not claim verified real-world outcomes.
- HumanShield is a limited text-pattern checklist, not a malware scanner, fraud detector or guarantee that a message is safe.
- LifeSolver provides general planning prompts, not professional, legal, medical or emergency advice.
- Do not enter passwords, OTPs, PINs, bank details, identity numbers, exact home addresses or other sensitive personal information.

## Safety principles

Humanity OS is designed around consent, dignity, privacy, transparency and human judgement. It does not make critical decisions about people, sell personal data, or automate high-stakes support decisions.

## Next steps before a public community launch

A shared service would require a secure backend, access controls, moderation, abuse reporting, consent flows, data retention rules, safeguarding procedures and appropriate human verification. Those capabilities are **not included** in this zero-budget local MVP.

## License

MIT


## Supabase community backend (v0.2)

The live app now connects to a Supabase project in Mumbai (`ap-south-1`).

- Email/password account creation and sign-in.
- NeedBridge requests and offers are stored in shared PostgreSQL tables.
- Community board is visible only to authenticated users.
- Users can delete only their own posts.
- Profiles contain only a chosen display name and optional city/state; no phone, Aadhaar, exact address, payment or identity-document fields are collected.
- Row Level Security is enabled on every public table. Frontend uses a publishable key only; no service-role key is shipped to the browser.
- New accounts receive a minimal profile through a database trigger.
- Content reports have a database table for future moderation workflow.

### Current boundaries

- Email confirmation and outbound email delivery depend on the Supabase Auth email configuration.
- No live identity verification, background checks, emergency dispatch, payments, or guaranteed help delivery.
- Community posts are user-generated. Treat all requests/offers as unverified; independently verify people and organisations before meeting or transferring money.
- The local LifeSolver, EarthGuardian, HumanShield and impact counters remain client-side tools; their results are not professional advice or independently verified impact.
- This MVP does not expose direct contact details. Arrange any follow-up only through safe, consent-based channels outside the public post.
