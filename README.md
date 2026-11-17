# Beatriz Perez Photography — website

The new website of Beatriz Perez, rebuilt from the Squarespace site at www.beatrizperezphotography.com. Same setup as the ART from HEART website.

- **Eleventy 3** builds plain HTML pages from Markdown and JSON content. No framework in the browser, so pages are fast and image-led.
- **Decap CMS** at `/admin/` is the editing panel. Every project, exhibition, press entry, print and page text is a form.
- **Netlify** builds and hosts the site from GitHub, handles the forms (contact and collectors' list) and resizes images on the fly.

The Squarespace site stays live until the new one is approved. Nothing here touches the domain.

## Run it on your computer

Requires Node.js 20 or newer.

```bash
npm install
npm start                # site at http://localhost:8081
```

To use the content manager locally without GitHub, open a second terminal:

```bash
npm run cms              # local editing backend
```

Then open http://localhost:8081/admin/ and choose **Login**. Changes are written straight to the files in `src/`.

To send a version for review without a server, run `npm run preview` and double-click `vista-previa/index.html` (fonts are inlined so it also opens in Safari).

## Where things live

| What | File or folder |
| --- | --- |
| Projects (one page each) | `src/projects/*.md` |
| Homepage | `src/_data/home.json` |
| Exhibitions | `src/_data/exhibitions.json` |
| Press | `src/_data/press.json` |
| Prints | `src/_data/prints.json` |
| About, CV, contact | `src/_data/about.json`, `cv.json`, `contact.json` |
| Name, menu, email, social links | `src/_data/site.json` |
| Images | `src/images/` (new uploads go to `src/images/uploads/`) |
| PDFs (CV, articles) | `src/files/` |
| Redirects from old Squarespace addresses | `src/_redirects` |
| Design system (colours, type, layout) | `src/assets/css/main.css` |
| Templates | `src/_includes/` and `src/*.njk` |

`scripts/import-squarespace.mjs` is the one-off import of images and PDFs from the old site. It skips files that already exist.

## Design system

The concept is the *punctum*: a quiet gallery wall where the only loud thing is one carmine point, the full stop after the name.

| Colour | Value | Use |
| --- | --- | --- |
| Indigo | `#26305E` | All text. There is no black anywhere on the site |
| Paper | `#F7F4EF` | Page background |
| Lace | `#EEE6DA` | Header, footer, bands, frames |
| Powder pink | `#F2E1DD` | The MISShapes band |
| Carmine | `#B8102F` | The full stop, links, details and the collectors' list band |

Type: **Bodoni Moda** for titles, **Hanken Grotesk** for text, **IBM Plex Mono** for dates, editions and print details. All fonts are served from this site, not Google.

Motion (in `src/assets/js/main.js`): smooth scrolling with Lenis, images revealed from the page colour as they scroll in, headings rising word by word, a header that hides on the way down. Every image in a gallery, print, poster or tearsheet opens in a viewer with click-to-zoom. Everything respects "reduce motion", and the content shows normally if JavaScript fails.

House style (from Beatriz): British spelling, no long dashes, no serial commas, no unnecessary capitals.

## Publish to GitHub and Netlify

1. Create a GitHub repository and push the contents of this `web` folder to it, so `package.json` sits at the root.
2. In Netlify: **Add new site → Import an existing project → GitHub**, then pick the repository. Build settings come from `netlify.toml`.
3. Review on the `something.netlify.app` address. Do not connect the domain yet.

### Content manager

1. Put the repository name in `src/admin/config.yml` (`backend.repo`).
2. In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**, callback URL `https://api.netlify.com/auth/done`.
3. In Netlify: **Site configuration → Access & security → OAuth → Install provider → GitHub**, then paste the Client ID and Secret.
4. Sign in at `/admin/`. Edits go through **Draft → In review → Ready → Publish**.

### Forms

Netlify Forms collects the contact form and collectors' list sign-ups. Turn on email notifications under **Netlify → Forms → Form notifications**. Export the existing mailing list from Squarespace before switching.

## Going live (only after approval)

1. Test both forms on the Netlify preview.
2. Check the old addresses still work: every page keeps its Squarespace address, single exhibition pages redirect to `/exhibitions/`, and the old PDF links redirect to `/files/`.
3. Run Lighthouse on the homepage and one project page on mobile.
4. Add the domain in Netlify and follow its DNS instructions. Keep Squarespace for a month before cancelling.
5. Submit `https://www.beatrizperezphotography.com/sitemap.xml` in Google Search Console.
