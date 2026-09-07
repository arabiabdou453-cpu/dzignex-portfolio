# Dzignex creative portfolio

The official portfolio of Mohamed Elamine Chaib, known professionally as Amine. Explore selected work across branding, packaging, art direction, and digital experiences.

[View the live portfolio](https://dzignex.me/) · [Email Amine](mailto:hello@dzignex.me) · [Instagram](https://www.instagram.com/dzignex_) · [LinkedIn](https://www.linkedin.com/in/dzignex/) · [Behance](https://www.behance.net/dzignex_)

## About Amine

Amine is an Algerian Senior Creative Designer and the Co-Founder and Creative Director of Dzignex Studio. He develops distinctive brand systems that connect strategy, visual identity, packaging, and digital execution.

His process starts with the problem behind the brief. He then builds clear visual ideas that help brands earn recognition and remain useful across real customer touchpoints.

## Selected work

The portfolio presents six case studies:

| Project | Creative focus |
| --- | --- |
| [Menotopia](https://dzignex.me/works/menotopia) | Packaging for a French skincare brand |
| [Auravita](https://dzignex.me/works/auravita) | Brand identity and packaging for a nutricosmetics brand |
| [Dermology](https://dzignex.me/works/champ-dermology) | Identity, packaging, and website design for dermatological skincare |
| [Formura Labs](https://dzignex.me/works/formura-labs) | Branding for an Algerian supplement manufacturer |
| [Maison Noua](https://dzignex.me/works/noua) | Identity refresh and packaging for an Algerian fragrance house |
| [Ops First](https://dzignex.me/works/ops-first) | Brand experience for an operations consultancy |

## Portfolio experience

The site uses a desktop-inspired interface to present Amine’s work through interactive windows, project cards, notes, and profile content. Responsive layouts preserve the experience across desktop, tablet, and mobile screens.

Key features include:

- Interactive portfolio windows and controls
- Dedicated pages for every case study
- Responsive mobile and desktop layouts
- About, experience, and notes sections
- Direct email and social links
- Locally hosted project imagery for reliable presentation

## Technology

This repository contains a static portfolio built with:

- HTML5
- CSS
- JavaScript
- Framer-generated layout and runtime assets
- Netlify hosting and custom-domain delivery

The site does not require a package installation or build step.

## Run locally

Install [Node.js](https://nodejs.org/), then start the included static server from the repository root:

```bash
node tools/static-server.mjs . 3200
```

Open the [local portfolio](http://127.0.0.1:3200) in your browser.

## Repository structure

```text
.
├── index.html                  # Main portfolio experience
├── works/                     # Individual project case studies
├── framerusercontent.com/     # Local fonts, images, and runtime assets
├── mac-window-controls.*      # Interactive window behavior and styling
├── mobile-project-images.js   # Mobile project-image handling
├── notes-content-sync.js      # Responsive experience content
├── about-email-link.js        # Portfolio email interaction
├── tools/                     # Local preview and verification utilities
└── _headers                   # Netlify response headers
```

## Deployment

Netlify publishes the production site from this repository. Updates pushed to the connected `main` branch trigger a new deployment.

## Contact

For branding, packaging, art direction, and digital design enquiries, contact Amine at [hello@dzignex.me](mailto:hello@dzignex.me).
