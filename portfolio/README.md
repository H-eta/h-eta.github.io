# Portfolio

## Folder structure

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── projects/
    ├── project-1/
    │   ├── cover.jpg        ← thumbnail shown in the grid
    │   ├── 01.jpg
    │   ├── 02.mp4
    │   └── meta.json
    ├── project-2/
    │   └── ...
    └── ...
```

## Adding a project

1. Create a new folder inside `projects/` (e.g. `projects/my-game/`)
2. Drop in your files — images, videos, audio — and a `cover.jpg`
3. Create a `meta.json` in that folder (see format below)
4. Open `js/main.js` and add your folder name to the `PROJECTS` array

## meta.json format

```json
{
  "title": "Project Title",
  "year": "2024",
  "tag": "Game Development",
  "description": "Optional description shown in the lightbox.",
  "link": {
    "label": "Play the game",
    "url": "https://your-link.com"
  },
  "media": [
    { "type": "image", "src": "01.jpg" },
    { "type": "image", "src": "02.jpg" },
    { "type": "video", "src": "03.mp4" },
    { "type": "audio", "src": "04.mp3" }
  ]
}
```

**Required:** `title`, `media`
**Optional:** `year`, `tag`, `description`, `link`

Supported media types: `image`, `video`, `audio`

## Deploying to GitHub Pages

1. Create a repo named `yourusername.github.io`
2. Push the entire `portfolio/` contents (not the folder itself) to the root of the repo
3. Go to repo Settings → Pages → set source to `main` branch
4. Your site will be live at `https://yourusername.github.io`

## Local preview

Because the site fetches `meta.json` files via `fetch()`, you need a local server to preview it.
The easiest way:

```bash
cd portfolio
npx serve .
```

Or if you have Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
Do NOT just open `index.html` directly — the fetch calls won't work without a server.
