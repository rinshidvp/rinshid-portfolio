# Portfolio: project priority, writing link, and freelance connection

Status: approved and implemented; local verification and independent review passed. Production verification follows deployment.

## Requirements
1. Add a visible hero button to writing at https://rinshid-note.vercel.app/writing/.
2. Put BlinkBreak first inside the existing Projects section, retaining its current green palette, eye graphic, open-source/MIT badge, and download/source links. It must not remain a separate FOSS section.
3. Prioritize CosmIQ Sync, then add CosmIQ KEAM Predictor and the CosmIQ OS website.
4. Change desktop and mobile Hire Me buttons to Connect With Me, linking to the existing contact section. Describe availability as freelance work, not job seeking.
5. Preserve the recently approved hero wording, remaining projects, mobile menu, contact behavior, resume access, and Vice Chair FOSS experience entry.
6. Add Vice Chair · FOSS to The journey so far. No start date or chapter name has been supplied; do not fabricate either.

## Recommended presentation
- Hero actions: View Projects, Read My Writing, Connect With Me.
- Keep resume access in About instead of occupying a prominent hero button.
- One Projects section. First item is a prominent green BlinkBreak card; use the existing dark/orange design for the remaining project cards.
- Featured order: BlinkBreak, CosmIQ Sync, CosmIQ KEAM Predictor, CosmIQ OS.
- Next: AURA, CampusTrade, RentVibe. Keep Pragathi KEAM Portal, AI SDR & Meeting Intelligence, AI Content Factory and Rinshid Note below these; do not silently delete existing cards.
- Keep CosmIQ KEAM Predictor distinct from Pragathi KEAM Portal. They are different repositories/products.
- Keep writing linked from the hero and footer as well as the existing lower-priority notebook card.
- Journey entry: FOSS — Vice Chair, described simply as free and open-source community leadership. Leave the date unspecified. Keep the existing Experience entry too.

## Verified source and proposed destinations
- BlinkBreak: https://github.com/rinshidvp/blinkbreak/releases/latest; source https://github.com/rinshidvp/blinkbreak. Tauri 2, React, TypeScript, Rust.
- CosmIQ Sync: https://cosmiq-sync.vercel.app/; source https://github.com/rinshidvp/cosmiq-sync. React, TypeScript, Supabase; avoid unsupported expiry durations.
- CosmIQ KEAM Predictor: https://cosmiq-keam-predictor.vercel.app/; source https://github.com/rinshidvp/cosmiq-keam-predictor. Next.js, TypeScript, Supabase; rank-to-college eligibility based on historical cutoff data, not guaranteed admission.
- CosmIQ OS: https://cosmiq-os.vercel.app/. Local `cosmiq-os-web/.vercel/project.json` confirms the Vercel project is `cosmiq-os`; README describes a Next.js website and enquiry-to-quotation prototype with a simulated WhatsApp interface. Source repository is private: show Website, not a public GitHub button. Do not imply production WhatsApp/LIMS integration or expose protected staff/demo routes.
- Writing: https://rinshid-note.vercel.app/writing/; notebook home remains https://rinshid-note.vercel.app/.
- Live fetches for the two new websites failed at the transport layer during planning. Verify reachability before publishing; no current outage is inferred.

## Backbone and boundaries
- Static HTML remains the architecture: no framework migration, dependencies, data models or APIs.
- `index.html` owns the hero actions, project order/content, and existing section anchors.
- `css/style.css` scopes green variables and visual treatment to the BlinkBreak card. Avoid changing the site's global orange palette or retaining a full-page FOSS wrapper.
- Keep one BlinkBreak card and one card per project; old FOSS section is replaced by moving its card, not duplicating it.
- Vice Chair FOSS stays in Experience. Do not invent chapter names, dates, metrics or new achievements.
- Only portfolio files change. Do not redesign or alter the notebook repository for this task.
- Preserve `#projects`, `#contact` and the other existing navigation anchors. If removing `#foss`, provide an anchor within the relocated green card to keep old links useful.
- Use real public links, label prototype work honestly, and retain known Coming Soon states where no verified demo exists.

## Implementation steps and verification gates
1. Revise hero/navbar buttons, freelance availability, and the journey's Vice Chair FOSS entry. Verify destinations, wording, no invented date, and mobile-menu behavior.
2. Move/reorder project cards and add Predictor/OS. Verify exact order, uniqueness, website/source destinations, and private-source omission.
3. Scope/reuse green styling for the first BlinkBreak card. Check desktop/mobile screenshots, legibility, keyboard focus and reduced-motion behavior.
4. Run a feature browser test that asserts the new first-four order, green BlinkBreak inside `#projects`, writing/connection buttons, Vice Chair FOSS in Journey and Experience, existing contact/resume access, and no horizontal overflow at 360/768/1440px. Test fails against the previous page.
5. Independent review, fix real findings, then deploy only after user approves implementation. Verify the production page rather than relying only on deployment Ready status.

## Rollback and acceptance
- Starting clean main is `4b4e6dc`; preserve history and use a new commit, never force-push/reset.
- Roll back only the implementation commit if necessary, or promote the prior Vercel deployment.
- Complete when the requested project order and buttons are visible live, green styling is confined to the first project card, legacy navigation still works, and mobile/desktop verification passes.

## Implementation evidence
- BlinkBreak is the first wide project card; `#foss` is retained on the card, not a separate section. All 11 projects follow the approved order.
- Added Predictor and OS website cards; preserved original case-study content and notebook card.
- Added hero writing/connection actions, renamed desktop/mobile Hire Me, updated both freelance badges, retained About CV access, and added the undated FOSS journey entry.
- New local browser feature test: `node .local/verify-project-priority.cjs`. It fails against the prior HTML (`--baseline`) at the ordering assertion and passes against the updated page. Checks exact order, links/source privacy, green styling, journey/experience, resume, menu, keyboard focus, reduced motion, project WCAG accessibility and 360/768/1024/1280/1440px overflow.
- Found and fixed pre-existing 1024px overflow: decorative hero glow extended to x=1040. Keeping the glow within the photo area resolves it without hiding page content.
- Independent code review: SHIP; reviewer independently confirmed the order, preserved content, legacy anchor and responsive layouts.
- HTML structure, ID uniqueness, internal anchors and local assets checked. Predictor, OS and writing destinations return HTTP 200.
