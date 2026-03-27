# Gallery — How to add images and captions (Git workflow)

This repository uses a Git-first workflow to manage gallery images and captions. Follow these steps to add a new artwork safely and consistently.

Recommended workflow

1. Create a branch from main (or your working branch):
   git checkout -b add-gallery-images

2. Place original images you want to add into Gallery/new_uploads/ on your local clone.
   - Do NOT edit images directly in the Gallery/ folder.
   - Allowed formats: .jpg, .jpeg, .png, .gif, .webp

3. Run the provided image processing script locally to validate, resize, and rename files. From the repository root run (PowerShell):
   .\\scripts\\process_new_images.ps1 -InputDir .\\Gallery\\new_uploads

   The script will:
   - Validate file types
   - Resize images to a maximum dimension (keeps aspect ratio)
   - Pick the next available filename GalleryN.jpg (avoids collisions)
   - Save the processed file into Gallery/
   - Create a caption placeholder in Gallery/captions/GalleryN.txt

4. Edit the generated caption files in Gallery/captions/ to add the artwork title, medium, size, year or short description.
   - Keep captions concise (1-2 lines).

5. Commit and push your branch, then open a Pull Request (PR) for review. Example:
   git add Gallery/Gallery*.jpg Gallery/captions/Gallery*.txt
   git commit -m "Add new artwork images and captions"
   git push --set-upstream origin add-gallery-images

6. Have a reviewer (you or a trusted admin) review the PR and merge when approved.

Security notes

- This workflow avoids exposing an open upload UI on the public site. Only users with repo access who can push/PR can add images.
- If you need remote uploads later, implement server-side auth and signed upload URLs. For now, keep changes via Git+PR.

Troubleshooting

- If the script cannot determine the next Gallery number, inspect the Gallery/ folder for unusual file names.
- If images look too large after upload, re-run the script with a smaller max dimension: see the script parameters.

Enjoy! - Your friendly site maintainer
