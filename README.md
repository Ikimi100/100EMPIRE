# 100EMPIRE website

The personal brand and creative studio site of Ikimi Clifford Festus.
Plain HTML, CSS and JavaScript. No build step is needed to host it.

## Pages
- index.html      Home: hero with the living collage and the idea box, selected work, about, services, process
- work.html       All projects, with filters
- services.html   The five disciplines, all 12 categories, bundles
- about.html      Portrait, story, capabilities, tools, process
- contact.html    Contact form (opens WhatsApp with the message filled in) and direct details
- pricing.html    Prices by category (closed until a category is opened)
- 12 category pages: graphic-design, video-editing, photography, weddings, church-media,
  web-design, app-development, digital-marketing, book-writing, academy, frames, dogs
- 404.html

## Files
- css/style.css        All styles. Colours and fonts are at the top under :root
- js/script.js         Menu, reveals, hero collage, idea box, work filters, contact form, frame estimator
- assets/fonts/        Space Grotesk and Inter, self-hosted (includes the naira sign)
- assets/img/          Your portrait (ikimi.webp / ikimi.png) and the FixNaija screenshots
- assets/img/photos/   Free stock photos from Pexels, two sizes each (-s and -l)
- assets/og-image.jpg  The picture shown when a link is shared on WhatsApp or social media
- _original-template/  The template you started from, kept as a backup

## Still to add
- Your real email address and social media links (left out until you confirm them).
- Your own project photos, to replace the stock photos over time.

## Deploy on Vercel
Framework preset: Other. Build command: none. Output directory: ./
Add your domain in Project > Settings > Domains.

## How the contact form works
There is no server. When someone presses "Send on WhatsApp", their message opens in
WhatsApp addressed to +234 703 993 4163, ready to send. Nothing is sent until they press send.
