# 100EMPIRE website

Plain HTML, CSS and JavaScript. No build step is needed to host it.

## Pages
index · services · pricing · work · about · contact · 404
graphic-design · video-editing · photography · weddings · church-media · web-design
app-development · digital-marketing · book-writing · academy · frames · dogs

## Shared files
- css/site.css  - all styles (colours and fonts are at the top under :root)
- js/site.js    - menu, header, quote form, frame estimator, work filter
- img/          - drop real photos here (see img/README.txt)

## Deploy on Vercel
1. Push this folder to GitHub (for example Ikimi100/100EMPIRE).
2. In Vercel: Add New > Project > import the repo.
   Framework preset: Other. Build command: (leave empty). Output directory: ./
3. Add the domain 100empire.com in Project > Settings > Domains.

## Editing prices
Prices live in the page files. Search for the old figure (for example ₦150,000)
and replace it. The rate card (pricing.html) lists the same figures, so update
it too.
