# Boran Han

Personal research website published at
[boranhan.github.io](https://boranhan.github.io/).

The active site is a dependency-free static build in `site/`. GitHub Actions
deploys that directory directly to GitHub Pages.

## Local preview

```bash
cd site
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

- `site/index.html`: homepage
- `site/research/`: research overview
- `site/publications/`: selected publication record
- `site/about/`: biography and experience
- `site/photography/`: photography contact sheet
- `site/assets/`: shared styles, interaction code, and images
