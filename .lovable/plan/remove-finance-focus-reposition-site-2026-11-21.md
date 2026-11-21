# Remove finance focus, reposition site

New positioning: custom operating systems, AI integration, agent systems, AI consulting, websites.

## Audit: finance found in
- Home page: headline "tools for finance", "Builder · AI · Finance" tag, "My focus now is finance..." about section, Filing Summarizer link, "Finance tools" button
- Site title / search + social descriptions (home and site-wide)
- Navbar: "Finance Tools" link
- Finance Tools page and Filing Summarizer page (whole pages)
- Work page: Filing Summarizer card, "finance tools" descriptions, "If you work in AI or finance", "Explore the finance tools" button
- Resources page: Filing Summarizer card, "Finance and markets" section, "AI and finance" intro + descriptions
- Updates page: "Shipped: a Filing Summarizer" post, "AI and finance" descriptions
- Contact section: "AI and finance intersection"
- AI search file (llms.txt) and sitemap: finance pages, SIE/markets bio
- Backend: SEC report and "email the report" functions

Kept as-is (not about your positioning): AI Brief industry options like "accounting firm", the "bank account numbers" safety tip in the data-safety guide, the food bank demo.

## Changes
1. Rewrite home headline, tag, intro and about section around OS builds, AI integration, agents, consulting, websites. Button goes to Work instead.
2. New title: "Hudson Turansky · Custom AI systems, agents and websites", with matching descriptions everywhere.
3. Remove "Finance Tools" from the menu.
4. Delete Finance Tools and Filing Summarizer pages; old links redirect to Home.
5. Work page: remove Filing Summarizer card, update copy and end button.
6. Resources: remove finance card + section, retitle to "AI for business".
7. Updates: remove the Filing Summarizer post, update descriptions.
8. Contact, llms.txt, sitemap: update wording, drop finance pages.
9. Delete the two SEC backend functions and their storage table.

## Technical details
- Delete FinanceToolsPage.tsx, FilingSummarizerPage.tsx; routes in App.tsx become `<Navigate to="/" />`; drop from prerender list in main.tsx.
- Delete edge functions summarize-filing, email-filing-report (and undeploy); drop their cache table via migration.
- Edit index.html, Index, Navbar, BuildsPage, ResourcesIndexPage, UpdatesPage, Contact, llms.txt, sitemap.xml.
- Final `rg -i "financ|filing|SEC "` sweep to confirm none remain.
