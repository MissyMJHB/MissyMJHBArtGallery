Decap (Netlify) CMS — Admin setup and GitHub OAuth

Overview

This repo includes a lightweight Decap (Netlify) CMS admin UI at /admin/ (admin/index.html + admin/config.yml). The CMS uses the GitHub backend and is configured to create PRs (editorial_workflow) so you can review uploads before merging.

Quick steps to finish setup

1) Register a GitHub OAuth app
   - URL: https://github.com/settings/developers -> OAuth Apps -> New OAuth App
   - App name: "Missy Art Gallery Admin"
   - Homepage URL: https://missymjhb.github.io/MissyMJHBArtGallery/  (or http://localhost:8000 for local testing)
   - Authorization callback URL: https://missymjhb.github.io/MissyMJHBArtGallery/admin/  (or http://localhost:8000/admin/ for testing)
   - Save and copy Client ID (and Client Secret for your records).

   Exact callback URL examples you can use when registering the OAuth app:
     - GitHub Pages: https://missymjhb.github.io/MissyMJHBArtGallery/admin/
     - Custom domain: https://your-domain.com/admin/
     - Local testing: http://localhost:8000/admin/

2) Update admin/config.yml with your Client ID
   - Open admin/config.yml and under backend: add:
       client_id: "YOUR_CLIENT_ID"
   - Do NOT commit client_secret into the repo. The client secret must stay private.

3) Host the admin folder at https://your-site-domain/admin/
   - GitHub Pages is an easy option: enable Pages in repo settings (branch: main) and use the root. admin/index.html will then be reachable at https://<owner>.github.io/<repo>/admin/.
   - For local testing, run a static server (python -m http.server 8000) and visit http://localhost:8000/admin/ (remember to use same callback in OAuth app for localhost if testing).

4) Recommended: Keep "editorial_workflow" enabled
   - Admin creates Pull Requests for each change. You review and merge PRs to publish updates.
   - Also enable branch protection on the remote (Require pull request reviews before merging) for stronger security.

How the artist uses it

1. Visit https://your-site-domain/admin/
2. Click "GitHub" and sign in using GitHub (you must authorize the OAuth app)
3. Click "New Artwork" → upload image from phone, add Title/Caption/Date → Save
4. CMS creates a PR with the new image and caption (you review & merge)

Notes & troubleshooting

- If images fail to upload, confirm media_folder in admin/config.yml is set to "Gallery" and that GitHub Pages has write access via the OAuth app.
- For production, prefer registering the OAuth app with real https domain; localhost is for testing only.
- If you want the CMS to push directly to main instead of PRs, change publish_mode (not recommended).

Want me to add the Client ID placeholder to admin/config.yml and instructions to you on where to paste the secret? Respond "Yes — add client_id placeholder" or "No".