#!/usr/bin/env python3
"""Builds the price guides, the free tools and their two hub pages.

Run from the repo root:  python3 _src/guides/build.py
The page shell (head, header, footer) is taken from refunds.html, so menu and
footer changes made there carry over the next time this runs.
Prices come from the service pages; update them here when they change there.
"""
import html, json, re
from urllib.parse import quote

SITE = "https://www.100empire.com"
UPDATED = "2026-11-21"
UPDATED_TEXT = "Updated 21 November 2026"
WA = "2347039934163"
TOOLS_JS = "/js/tools.js?v=1"

TPL = open("refunds.html", encoding="utf-8").read()
HEAD_A = TPL[: TPL.index("<title>")]
HEAD_B = TPL[TPL.index('<meta name="theme-color"'): TPL.index("</head>")]
HEAD_B = re.sub(r'<meta property="og:title"[^>]*><meta property="og:description"[^>]*><meta property="og:url"[^>]*>', "", HEAD_B)
BODY_TO_MAIN = TPL[TPL.index("<body"): TPL.index('<main id="main">')]
FOOT = TPL[TPL.index("</main>"):]


def esc(s):
    return html.escape(s, quote=True)


def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()


def wa(text):
    return "https://wa.me/%s?text=%s" % (WA, quote(text, safe=""))


ICON_WA = ('<svg class="e-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5l1.3-4A8.3 8.3 0 1 1 8.6 19z"/>'
           '<path d="M9 10.5c.3 1.9 2.4 4 4.5 4.4l1.2-1.1 1.8.8-.4 1.6c-3.4.2-7.4-3.6-7.6-7.1l1.6-.4.8 1.8z"/></svg>')
ARROW = '<svg class="e-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'


def btn_enq(label, text, attrs, cls="e-btn e-btn--gold"):
    return '<a class="%s" %s href="%s" target="_blank" rel="noopener">%s%s</a>' % (cls, attrs, esc(wa(text)), esc(label), ICON_WA)


def btn(label, href, cls="e-btn e-btn--ghost"):
    return '<a class="%s" href="%s">%s%s</a>' % (cls, href, esc(label), ARROW)


def page(slug, title, desc, body_main, jsonld, page_key, extra_js=""):
    url = SITE + "/" + slug
    head = (HEAD_A + "<title>%s</title>\n" % esc(title) +
            '<meta name="description" content="%s">\n' % esc(desc) +
            '<link rel="canonical" href="%s">\n' % url + HEAD_B.replace(
                '<meta property="og:type" content="website"><meta property="og:site_name" content="100EMPIRE">',
                '<meta property="og:type" content="website"><meta property="og:site_name" content="100EMPIRE">\n'
                '<meta property="og:title" content="%s"><meta property="og:description" content="%s"><meta property="og:url" content="%s">'
                % (esc(title), esc(desc), url)))
    for block in jsonld:
        head += '<script type="application/ld+json">%s</script>\n' % json.dumps(block, ensure_ascii=False, separators=(", ", ": "))
    body = BODY_TO_MAIN.replace('data-page="refunds"', 'data-page="%s"' % page_key)
    foot = FOOT
    if extra_js:
        foot = foot.replace("</body>", '<script src="%s" defer></script>\n</body>' % extra_js)
    out = head + "</head>\n" + body + '<main id="main">\n' + body_main + "\n" + foot
    assert "Refunds and cancellations" not in out.split("<main")[0], slug
    open(slug + ".html", "w", encoding="utf-8").write(out)
    return url


def hero(word, crumbs, label, h1, sub, btns=""):
    c = '<a href="/">Home</a>'
    for name, href in crumbs:
        c += '<span aria-hidden="true">/</span>' + ('<a href="%s">%s</a>' % (href, esc(name)) if href else "<span>%s</span>" % esc(name))
    return ('<section class="page-hero"><p class="page-hero-word" aria-hidden="true">%s</p><div class="container">'
            '<nav class="crumbs" aria-label="Breadcrumb">%s</nav><p class="section-label">%s</p>'
            '<h1 class="section-title">%s<span class="accent">.</span></h1><p class="section-sub">%s</p>%s</div></section>'
            % (word, c, esc(label), h1, sub, ('<div class="e-btns">%s</div>' % btns) if btns else ""))


def crumbs_ld(items):
    out, pos = [], 1
    for name, url in [("Home", SITE + "/")] + items:
        out.append({"@type": "ListItem", "position": pos, "name": name, "item": url})
        pos += 1
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": out}


def faq_html(items):
    return '<div class="e-faq">' + "".join(
        "<details><summary>%s</summary><div class=\"a\"><p>%s</p></div></details>" % (esc(q), a) for q, a in items) + "</div>"


def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in items]}


def article_ld(url, headline, desc):
    return {"@context": "https://schema.org", "@type": "Article", "headline": headline, "description": desc,
            "url": url, "mainEntityOfPage": url, "datePublished": UPDATED, "dateModified": UPDATED, "inLanguage": "en-NG",
            "image": SITE + "/assets/og-image.jpg",
            "author": {"@type": "Person", "name": "Ikimi Clifford Festus", "url": SITE + "/about"},
            "publisher": {"@type": "Organization", "name": "100EMPIRE", "url": SITE + "/",
                          "logo": {"@type": "ImageObject", "url": SITE + "/assets/logo-512.png"}}}


def table(head, rows, stack=False, nums=()):
    h = "<thead><tr>" + "".join('<th%s>%s</th>' % (' class="gd-num"' if i in nums else "", esc(x)) for i, x in enumerate(head)) + "</tr></thead>"
    b = ""
    for r in rows:
        if isinstance(r, str):
            b += '<tr class="gd-group"><td colspan="%d">%s</td></tr>' % (len(head), esc(r))
            continue
        tds = ""
        for i, x in enumerate(r):
            cls = ' class="gd-num"' if i in nums else ""
            lab = ' data-l="%s"' % esc(head[i]) if stack and i > 0 else ""
            tds += "<td%s%s>%s</td>" % (cls, lab, x)
        b += "<tr>" + tds + "</tr>"
    return '<div class="gd-tablewrap"><table class="gd-table%s">%s<tbody>%s</tbody></table></div>' % (" is-stack" if stack else "", h, b)


def ul(items):
    return '<ul class="legal-list">' + "".join("<li>%s</li>" % x for x in items) + "</ul>"


def guide(slug, title, desc, headline, word, crumb, h1, sub, answer, sections, faqs, cta, aside_btns, related, page_key):
    url = SITE + "/" + slug
    toc = "".join('<li><a href="#%s">%s</a></li>' % (sid, esc(h)) for sid, h, _ in sections) + '<li><a href="#faq">Questions people ask</a></li>'
    rel = "".join('<li><a class="text-link" href="%s">%s</a></li>' % (h, esc(t)) for t, h in related)
    aside = ('<aside class="legal-aside"><p class="legal-updated">%s</p><nav aria-label="On this page"><p class="footer-label">On this page</p>'
             '<ol class="legal-toc">%s</ol></nav><p class="footer-label">Also useful</p><ul class="legal-more">%s</ul>'
             '<div class="gd-aside-cta">%s</div></aside>' % (UPDATED_TEXT, toc, rel, aside_btns))
    body = '<div class="gd-answer"><p class="gd-answer-h">The short answer</p><p>%s</p></div>' % answer
    for sid, h, content in sections:
        body += '<section class="legal-sec" id="%s"><h2>%s</h2>%s</section>' % (sid, esc(h), content)
    body += '<section class="legal-sec" id="faq"><h2>Questions people ask</h2>%s</section>' % faq_html(faqs)
    body += cta
    main = (hero(word, [("Price guides", "/guides"), (crumb, None)], "Price guide · 2026", h1, sub) +
            '<section class="section legal gd"><div class="container legal-grid">%s<div class="legal-body">%s</div></div></section>' % (aside, body))
    ld = [article_ld(url, headline, desc), crumbs_ld([("Price guides", SITE + "/guides"), (crumb, url)]), faq_ld(faqs)]
    page(slug, title, desc, main, ld, page_key)
    return url


def cta_box(h, p, btns):
    return '<div class="gd-cta"><h2>%s</h2><p>%s</p><div class="e-btns">%s</div></div>' % (h, p, btns)


# ============================================================ DOG PRICES
DOGS = [
    ("Guard and working breeds", [
        ("German Shepherd", "Large guard and family dog", "₦300,000 – ₦1,000,000"),
        ("Boerboel", "Giant guard dog, handles heat well", "₦350,000 – ₦1,200,000"),
        ("Rottweiler", "Large, loyal guard dog", "₦300,000 – ₦1,000,000"),
        ("Caucasian Shepherd", "Giant guard dog for experienced owners", "₦400,000 – ₦1,500,000"),
        ("American Bully", "Medium, muscular companion", "₦250,000 – ₦600,000"),
        ("Doberman", "Large, alert guard dog", "From ₦400,000"),
        ("Bullmastiff", "Large guard dog", "From ₦600,000")]),
    ("Family and sporting breeds", [
        ("Labrador Retriever", "Large, friendly family dog", "₦200,000 – ₦500,000"),
        ("Golden Retriever", "Large, gentle family dog", "From ₦600,000"),
        ("Siberian Husky", "Medium, very active; needs shade", "₦400,000 – ₦1,000,000")]),
    ("Companion and toy breeds", [
        ("Lhasa Apso", "Small; good for flats", "₦150,000 – ₦500,000"),
        ("Maltese", "Toy companion", "₦150,000 – ₦300,000"),
        ("Shih Tzu", "Small indoor companion", "₦400,000 – ₦700,000"),
        ("Chihuahua", "The smallest breed", "₦300,000 – ₦600,000"),
        ("Pug", "Small companion", "₦300,000 – ₦600,000"),
        ("French Bulldog", "Small companion for flats", "₦350,000 – ₦700,000"),
        ("Chow Chow", "Companion; needs shade", "₦300,000 – ₦600,000"),
        ("English Bulldog", "Calm companion; needs shade", "From ₦700,000")]),
]
rows = []
for g, items in DOGS:
    rows.append(g)
    rows += [(n, p, d) for n, d, p in items]

DOG_FAQ = [
    ("How much is a German Shepherd puppy in Nigeria?",
     "In 2026 a pure-bred German Shepherd puppy costs ₦300,000 to ₦1,000,000. Puppies from registered or imported parents, with pedigree papers, sit at the top of that range."),
    ("How much is a Boerboel puppy in Nigeria?",
     "₦350,000 to ₦1,200,000 in 2026. A Caucasian Shepherd, the other giant guard breed, is ₦400,000 to ₦1,500,000."),
    ("Which pure breed costs the least?",
     "Small companion breeds. The Lhasa Apso starts from about ₦150,000 and the Maltese costs ₦150,000 to ₦300,000."),
    ("Why are prices shown as a range?",
     "Price depends on lineage, papers, imported parents, age, sex and colour. Ask for the exact price of an available puppy."),
    ("When can a puppy go home?",
     "From 8 weeks old, after its first vaccination and deworming. Younger puppies stay with their mother."),
    ("Do you deliver outside Abuja?",
     "Yes, nationwide. We deliver to any state in Nigeria, or hand your puppy over at a pick-up point that suits you. The delivery cost depends on distance and is quoted with the puppy."),
]
dog_url = guide(
    "dog-prices-nigeria",
    "Dog Prices in Nigeria (2026): Pure-Breed Puppy Price Guide · 100EMPIRE",
    "How much is a German Shepherd, Boerboel, Rottweiler or Caucasian puppy in Nigeria in 2026? Guide prices for 18 pure breeds, what changes the price, and how to buy safely.",
    "Dog prices in Nigeria (2026): pure-breed puppy price guide",
    "PUPPIES", "Dog prices", "Dog prices in Nigeria",
    "Guide prices for 18 pure breeds in 2026, what pushes a price up or down, and what a puppy should come with.",
    "Most pure-breed puppies cost between <b>₦150,000 and ₦1,500,000</b> in 2026. Small companion breeds such as the Lhasa Apso and Maltese start from about ₦150,000. "
    "A German Shepherd or Rottweiler puppy is ₦300,000 to ₦1,000,000, a Boerboel ₦350,000 to ₦1,200,000 and a Caucasian Shepherd ₦400,000 to ₦1,500,000.",
    [
        ("prices", "Prices by breed",
         "<p>These are our guide prices for pure-bred puppies in 2026. See photos and temperament for each breed on the <a href=\"/dogs#breeds\">Dogs page</a>.</p>" +
         table(["Breed", "Guide price", "Good to know"], rows, stack=True, nums=(1,)) +
         '<p class="gd-small">We only deal in pure breeds: both parents are the same recognised breed. Prices are per puppy and change with each litter.</p>'),
        ("why", "What changes the price",
         "<p>Two puppies of the same breed can be hundreds of thousands of naira apart. These are the reasons.</p>" + ul([
             "<b>Lineage and papers.</b> Litters registered with COBA, Nigeria’s national kennel club, come with pedigree papers that show the ancestry. They cost more.",
             "<b>Imported parents.</b> Puppies from imported or proven parents sit at the top of the range.",
             "<b>Sex, colour and coat.</b> Some colours and coat types are rarer, and some buyers pay more for a male or a female.",
             "<b>Age.</b> The price changes as a puppy grows. We quote for the puppy’s age on the day.",
             "<b>Care already given.</b> Vaccination, deworming and a health check before handover are part of a fair price."])),
        ("included", "What a puppy should come with",
         "<p>Whoever you buy from, ask for these. Every puppy from us comes with them.</p>" + ul([
             "Its first vaccination and deworming, written on a vaccination card. Puppies go home from 8 weeks old.",
             "A health check before it leaves.",
             "Photos and live video of the puppy and both parents before you pay. You can also visit by appointment.",
             "Pedigree papers where the litter is registered. We tell you before you pay whether it has papers.",
             "A feeding plan, a first-week checklist, and answers on WhatsApp for as long as you have the dog."])),
        ("safe", "How to buy a puppy safely",
         ul([
             "See the puppy and both parents on a live video call or in person, not only in photos.",
             "Ask for the vaccination card and check the dates against the <a href=\"/puppy-vaccination-calculator\">vaccination schedule</a>.",
             "If a seller mentions papers, ask which kennel club issued them. In Nigeria, pedigree papers come from COBA.",
             "Be careful with prices far below the range for that breed, and with sellers who will not show the parents.",
             "Do not pay the full price to a seller you cannot verify."])),
        ("after", "Costs after you buy",
         "<p>The purchase price is only the start. Plan for food, vaccination boosters, deworming, vet visits, grooming for long-coated breeds, "
         "and shade or cooling for breeds that struggle in the heat, such as the Husky, Chow Chow and English Bulldog.</p>"
         "<p>Our <a href=\"/puppy-vaccination-calculator\">puppy vaccination calculator</a> gives you every vaccination date from your puppy’s birthday. "
         "A breed consultation also covers what a breed costs to feed and care for.</p>"),
        ("delivery", "Delivery and pick-up",
         "<p>We deliver nationwide, to any state in Nigeria, or hand your puppy over at a pick-up point that suits you. "
         "Delivery is priced by distance and quoted together with the puppy.</p>"),
    ],
    DOG_FAQ,
    cta_box("Looking for a puppy?", "Tell us the breed, your state and when you want the puppy. We send photos and videos of available puppies and their parents.",
            btn_enq("Ask about a puppy", "Hello 100EMPIRE, I am looking for a pure-bred puppy. Which breeds do you have available?", 'data-quote="buy"') +
            btn("See all breeds", "/dogs#breeds")),
    btn_enq("Ask about a puppy", "Hello 100EMPIRE, I am looking for a pure-bred puppy. Which breeds do you have available?", 'data-quote="buy"') +
    btn("Vaccination calculator", "/puppy-vaccination-calculator"),
    [("Dogs and puppies", "/dogs"), ("Puppy vaccination calculator", "/puppy-vaccination-calculator"), ("All price guides", "/guides")],
    "dog-prices-nigeria")

# ============================================================ WEDDINGS
W_PKG = [
    ("<a href=\"/weddings#packages\">Basic</a>", "₦150,000", "Up to 5 hours · 1 photographer · traditional or white wedding", "100+ edited photos online"),
    ("<a href=\"/weddings#packages\">Premium</a>", "₦350,000", "Up to 8 hours · 1 photographer, 1 videographer · traditional and white wedding · drone shots if available", "200+ edited photos, 3–5 minute highlight video"),
    ("<a href=\"/weddings#packages\">Gold</a>", "₦700,000", "Full day · 2 photographers, 2 videographers · pre-wedding shoot · social media teaser", "300+ edited photos, 5–10 minute cinematic film, full ceremony video"),
    ("<a href=\"/weddings#packages\">Diamond</a>", "₦1,200,000", "Full day + preparations · everything in Gold · drone · same-day edit · luxury album design", "500+ edited photos, premium wedding film, documentary edit"),
    ("<a href=\"/weddings#packages\">Elite</a>", "₦2,500,000+", "Multi-day and destination · full production team · printed luxury album · wedding website", "Feature-length film, luxury media collection"),
]
W_ADD = [
    "Photo and film",
    ("Pre-wedding shoot", "₦80,000 – ₦200,000"), ("Save-the-date video", "₦50,000 – ₦120,000"), ("Drone coverage", "₦80,000 – ₦150,000"),
    ("Same-day edit", "₦150,000 – ₦300,000"), ("Extra photographer", "₦60,000 – ₦120,000"), ("Extra hour", "₦25,000 – ₦50,000"),
    "Live and online",
    ("Livestream (1–2 cameras)", "₦150,000 – ₦400,000"), ("Wedding website", "₦80,000 – ₦200,000"),
    "Albums and stationery",
    ("Photobook (30 pages)", "₦120,000 – ₦250,000"), ("Luxury album", "₦250,000 – ₦450,000"),
    ("Digital stationery suite", "₦45,000"), ("Classic stationery suite (print and digital)", "₦95,000"), ("Luxury stationery suite", "₦180,000"),
]
W_FAQ = [
    ("How much does a wedding photographer cost in Abuja?",
     "With 100EMPIRE in 2026, photo-only coverage of up to 5 hours costs ₦150,000 and includes 100+ edited photos. Bigger teams, longer hours and video raise the price."),
    ("How much is a wedding videographer in Abuja?",
     "Photo and video together start at ₦350,000 (Premium: a 3–5 minute highlight video and 200+ photos). A full-day cinematic film with a full ceremony video is ₦700,000 (Gold)."),
    ("How much does drone coverage cost?",
     "₦80,000 to ₦150,000 as an add-on. Diamond and Elite include drone coverage."),
    ("Do you cover the traditional and white wedding?",
     "Yes. Premium and above cover both. If they are on different days, we plan the coverage hours across both dates."),
    ("Can we pay in instalments?",
     "Yes. After the 50% deposit, the balance can be split into monthly payments, completed 2 weeks before the wedding."),
    ("When do we get our photos and film?",
     "Sneak peeks within 72 hours, the full gallery in 2–3 weeks and the films in 3–6 weeks, depending on the package."),
]
w_url = guide(
    "wedding-photography-prices-abuja",
    "Wedding Photography & Video Prices in Abuja (2026) · 100EMPIRE",
    "How much do wedding photographers and videographers cost in Abuja in 2026? Packages from ₦150,000, add-ons like drone and same-day edits, and how to budget.",
    "Wedding photography and videography prices in Abuja (2026)",
    "WEDDINGS", "Wedding photo prices", "Wedding photo and film prices",
    "What wedding photography and videography cost in Abuja in 2026, what each package includes, and the add-ons that change the price.",
    "Photo-only wedding coverage in Abuja starts at <b>₦150,000</b> for up to 5 hours. Photo and video together start at <b>₦350,000</b>, "
    "a full-day cinematic package is <b>₦700,000</b>, and luxury coverage runs from ₦1,200,000 to ₦2,500,000 and above. These are 100EMPIRE’s 2026 prices.",
    [
        ("packages", "Wedding packages and prices",
         "<p>Every package includes professional editing and high-resolution online delivery.</p>" +
         table(["Package", "Price", "Coverage and team", "You receive"], W_PKG, stack=True, nums=(1,))),
        ("addons", "Add-ons",
         "<p>Start from the closest package and add what you need.</p>" +
         table(["Add-on", "Price"], W_ADD, nums=(1,))),
        ("why", "What changes the price",
         ul([
             "<b>Hours of coverage.</b> Five hours covers a ceremony and portraits. A full day adds preparations, the reception and the send-off.",
             "<b>Photo only, or photo and video.</b> Video needs its own operator and editing time.",
             "<b>Team size.</b> A second photographer or videographer catches both families, guests and details at the same time.",
             "<b>Two events.</b> A traditional and a white wedding, especially on different days, need more hours.",
             "<b>Extras.</b> Drone, same-day edits, livestream, albums and prints are priced on top.",
             "<b>Travel.</b> Weddings in the FCT and Niger State are covered. Elsewhere, transport and accommodation are added at cost."])),
        ("budget", "How to budget for photo and video",
         "<p>Decide first what you want to keep: photos only, a short highlight film to share, or the full ceremony on video. "
         "Then count the hours from preparations to the last dance, and pick the package that covers them.</p>"
         "<p>A 50% deposit secures your date, and the balance can be paid monthly until 2 weeks before the wedding. "
         "Our free <a href=\"/wedding-budget-planner\">wedding budget planner</a> helps you see photo and video next to venue, food and everything else.</p>"),
        ("delivery", "When you get your photos and films",
         "<p>Sneak peeks within 72 hours, the full gallery in 2–3 weeks, and the films in 3–6 weeks depending on the package.</p>"),
    ],
    W_FAQ,
    cta_box("Check your date", "Send your date, venue and the package you like. We confirm availability and the final price in writing.",
            btn_enq("Ask about your date", "Hello 100EMPIRE, I would like to check your availability for our wedding.", 'data-enq="weddings"') +
            btn("Watch wedding films", "/weddings#films")),
    btn_enq("Ask about your date", "Hello 100EMPIRE, I would like to check your availability for our wedding.", 'data-enq="weddings"') +
    btn("Budget planner", "/wedding-budget-planner"),
    [("Weddings", "/weddings"), ("Wedding budget planner", "/wedding-budget-planner"), ("All price guides", "/guides")],
    "wedding-photography-prices-abuja")

# ============================================================ WEBSITES
WEB_CORE = [
    ("Landing page", "₦80,000 – ₦150,000", "1 page", "3–5 days"),
    ("Starter business website", "₦200,000 – ₦350,000", "Up to 5 pages", "1–2 weeks"),
    ("Growth website", "₦450,000 – ₦900,000", "8–12 pages, you can edit it", "3–4 weeks"),
    ("Custom platform", "₦1,500,000+", "Logins, dashboards, payments", "4–8 weeks"),
]
WEB_SPEC = [
    "School websites",
    ("Result checker (website + PIN results)", "₦200,000 – ₦450,000"), ("School portal (parent and student logins)", "₦600,000 – ₦1,200,000"),
    ("School management system", "₦1.5M – ₦3M+"),
    "Church and ministry websites",
    ("Ministry site (up to 6 pages)", "₦250,000 – ₦450,000"), ("Ministry hub (10–20 pages)", "₦500,000 – ₦900,000"), ("Ministry platform", "₦1M – ₦2M"),
    "Real estate websites",
    ("Listing showcase (4–5 pages)", "₦180,000 – ₦250,000"), ("Managed portal (you manage listings)", "₦400,000 – ₦600,000"),
    ("Property platform", "₦900,000 – ₦1,500,000"),
    "Online stores",
    ("Store starter (up to 50 products)", "₦350,000 – ₦600,000"), ("Store pro (unlimited products)", "₦700,000 – ₦1,800,000"),
]
WEB_YEAR = [
    ("Domain name (.com)", "₦25,000 – ₦35,000 a year"), (".com.ng or .ng domain", "₦5,000 – ₦12,000 a year"),
    ("Hosting", "₦40,000 – ₦150,000 a year, depending on traffic and features"), ("Business email setup", "₦15,000 – ₦30,000, plus the provider’s monthly fee"),
    ("Care plan (optional)", "₦20,000, ₦50,000 or ₦100,000 a month"),
]
WEB_FAQ = [
    ("How much does a school website cost in Nigeria?",
     "A school website with a PIN result checker is ₦200,000 to ₦450,000. A portal with parent and student logins is ₦600,000 to ₦1,200,000, and a full school management system ₦1.5M to ₦3M or more."),
    ("How much is a church website?",
     "A ministry site of up to 6 pages is ₦250,000 to ₦450,000. Larger ministry hubs of 10–20 pages are ₦500,000 to ₦900,000."),
    ("How much is an e-commerce website in Nigeria?",
     "An online store for up to 50 products is ₦350,000 to ₦600,000. A store with unlimited products is ₦700,000 to ₦1,800,000. Payments run through Paystack or Flutterwave."),
    ("How long does a website take?",
     "Landing pages take 3–5 days, business sites 1–2 weeks, Growth sites 3–4 weeks, and custom platforms 4–8 weeks or more."),
    ("Who owns the website?",
     "You do. We register the domain in your name and hand over the code and logins when the final payment is made."),
    ("Is hosting included in the price?",
     "Hosting and the domain are paid yearly, on top of the build price. We set up reliable hosting and can manage it on a care plan, or hand it over to your IT team."),
]
web_url = guide(
    "website-cost-nigeria",
    "How Much Does a Website Cost in Nigeria? (2026 Price Guide) · 100EMPIRE",
    "Website prices in Nigeria for 2026: landing pages from ₦80,000, business sites ₦200,000–₦350,000, school, church, real estate and online store prices, plus domain and hosting costs.",
    "How much does a website cost in Nigeria? (2026 price guide)",
    "WEBSITES", "Website prices", "Website prices in Nigeria",
    "What a website costs in 2026, from a one-page site to a school portal or online store, plus the yearly costs most quotes leave out.",
    "A one-page website costs <b>₦80,000 to ₦150,000</b>. A business website of up to 5 pages is <b>₦200,000 to ₦350,000</b>, and a larger 8–12 page site "
    "₦450,000 to ₦900,000. Sites with logins, dashboards or payments start at ₦1,500,000. On top of the build you pay yearly for the domain and hosting. These are 100EMPIRE’s 2026 prices.",
    [
        ("types", "Prices by type of website",
         table(["Website", "Price", "Size", "Time"], WEB_CORE, stack=True, nums=(1,)) +
         '<p class="gd-small">Builds are paid 50% to start, 30% when you approve the design and 20% at launch.</p>'),
        ("special", "School, church, real estate and store prices", table(["Website", "Price"], WEB_SPEC, nums=(1,))),
        ("yearly", "Yearly costs after launch",
         "<p>These are paid every year or month, on top of the build price. Ask any web designer to list them in the quote.</p>" +
         table(["Cost", "Price"], WEB_YEAR, nums=())),
        ("why", "What changes the price",
         ul([
             "<b>Number of pages.</b> Each page needs design, content and testing.",
             "<b>Features.</b> Logins, payments through Paystack or Flutterwave, dashboards and databases add the most.",
             "<b>Editing yourself.</b> From the Growth package up, we set up an editor so you can change text, photos, events and listings.",
             "<b>Content.</b> Writing the words and preparing photos takes time if you do not have them ready.",
             "<b>Custom design.</b> A design made for your brand costs more than a ready-made template, and looks it."])),
        ("check", "Before you pay for a cheap website",
         ul([
             "The domain should be registered in your name, not the designer’s.",
             "You should get the code and logins when you finish paying.",
             "Open the designer’s past work on your phone. Most of your visitors will come on phones.",
             "Ask what hosting costs after the first year, and who renews it.",
             "Ask how you will update the site, and what it costs if they do it for you."])),
    ],
    WEB_FAQ,
    cta_box("Get a quote for your website", "Tell us what the site is for, how many pages and any features you need. We reply with a written quote.",
            btn_enq("Get a quote", "Hello 100EMPIRE, I would like a quote for a website.", 'data-enq="web"') + btn("See our websites", "/work")),
    btn_enq("Get a quote", "Hello 100EMPIRE, I would like a quote for a website.", 'data-enq="web"') + btn("Web design", "/web-design"),
    [("Web design", "/web-design"), ("Our work", "/work"), ("All price guides", "/guides")],
    "website-cost-nigeria")

# ============================================================ FRAMES
FRAMES = [("8x10\"", 8000, 10000, 15000), ("10x12\"", 10000, 15000, 20000), ("12x16\"", 17000, 20000, 25000), ("16x20\"", 20000, 25000, 40000),
          ("20x24\"", 30000, 35000, 50000), ("24x30\"", 40000, 45000, 60000), ("30x34\"", 50000, 55000, 70000), ("34x40\"", 70000, 75000, 90000),
          ("40x50\"", 90000, 95000, 150000), ("5x7ft", 150000, 170000, 200000), ("7x9ft", 190000, 200000, 250000)]


def n(x):
    return "₦{:,}".format(x)


def size_label(s):
    return s.replace("x", " × ").replace('"', " in").replace("ft", " ft")


FR_ROWS = [(size_label(s), n(a), n(b), n(c)) for s, a, b, c in FRAMES]
FR_FAQ = [
    ("How much is a 16×20 frame in Abuja?", "₦20,000 with a border frame, ₦25,000 borderless and ₦40,000 in acrylic."),
    ("How much is a 24×30 frame?", "₦40,000 with a border frame, ₦45,000 borderless and ₦60,000 in acrylic. 24×30 and above work well over a sofa."),
    ("Can you frame a photo from my phone?", "Yes. Send the original photo on WhatsApp (not a screenshot). We check if it is sharp enough for the size you want and advise you."),
    ("Do you do bulk orders?", "Yes. Schools, churches and companies get a discount on 10 pieces or more. Ask for a bulk quote."),
    ("How do I collect my frame?", "Pick up at our studio in Utako, Abuja, or ask us to arrange delivery at your cost."),
]
fr_url = guide(
    "picture-frame-prices-abuja",
    "Picture Frame Prices in Abuja (2026): Every Size and Finish · 100EMPIRE",
    "Frame prices in Abuja for 2026: border frames from ₦8,000 (8×10) to ₦190,000 (7×9 ft), plus borderless and acrylic prices for 11 sizes and which size to choose.",
    "Picture frame prices in Abuja (2026)",
    "FRAMES", "Frame prices", "Picture frame prices",
    "What framing costs in 2026 for 11 sizes, from 8×10 inches to 7×9 feet, in border, borderless and acrylic finishes.",
    "A framed 8×10 photo costs <b>₦8,000</b> with a border frame, ₦10,000 borderless and ₦15,000 in acrylic. A 16×20 is ₦20,000 to ₦40,000 and a 24×30 "
    "₦40,000 to ₦60,000. The largest size, 7×9 feet, is ₦190,000 to ₦250,000. These are 100EMPIRE’s 2026 prices per framed piece.",
    [
        ("prices", "Prices by size and finish",
         table(["Size", "Border", "Borderless", "Acrylic"], FR_ROWS, stack=True, nums=(1, 2, 3)) +
         '<p class="gd-small">Prices per framed piece, including the print. Want to see a size before you order? Try the <a href="/frame-size-preview">frame size preview</a>.</p>'),
        ("finishes", "Border, borderless or acrylic?",
         ul([
             "<b>Border frame.</b> A classic framed finish with a visible border around your print. Warm, traditional and the most affordable.",
             "<b>Borderless frame.</b> An edge-to-edge print with no visible border. Clean and modern for living rooms and offices.",
             "<b>Acrylic frame.</b> A premium glossy acrylic face-mount with deep colour and a high-end finish."])),
        ("size", "Which size to choose",
         ul([
             "<b>8×10 and 10×12.</b> Desks, shelves and side tables.",
             "<b>16×20.</b> Bedrooms, offices and corridors.",
             "<b>24×30 and above.</b> Over a sofa or as the main piece in a living room.",
             "<b>5×7 ft and 7×9 ft.</b> Statement pieces for halls, churches, offices and events."]) +
         "<p>The <a href=\"/frame-size-preview\">frame size preview</a> shows your own photo on a wall next to a sofa, at the right scale, with the price.</p>"),
        ("photo", "Getting your photo ready",
         "<p>Send the original photo on WhatsApp, not a screenshot. We check that it is sharp enough for the size you want before printing.</p>" +
         table(["Photo service", "Price"], [("Photo restoration before framing", "₦7,500 – ₦25,000"), ("Retouching", "₦2,000 – ₦10,000 per photo"),
                                            ("Collage or tribute design", "₦10,000 – ₦25,000")], nums=(1,))),
        ("collect", "Bulk orders, pick-up and delivery",
         "<p>Schools, churches and companies get a discount on 10 pieces or more. Pick up at our studio in Utako, Abuja, or ask us to arrange delivery at your cost.</p>"),
    ],
    FR_FAQ,
    cta_box("Order a frame", "Send your photo and the size and finish you want. We confirm the price and when it will be ready.",
            btn_enq("Order on WhatsApp", "Hello 100EMPIRE, I would like to order a frame.", 'data-enq="frames"') + btn("Preview a size", "/frame-size-preview")),
    btn_enq("Order on WhatsApp", "Hello 100EMPIRE, I would like to order a frame.", 'data-enq="frames"') + btn("Preview a size", "/frame-size-preview"),
    [("Frames and prints", "/frames"), ("Frame size preview", "/frame-size-preview"), ("All price guides", "/guides")],
    "picture-frame-prices-abuja")


# ============================================================ TOOLS
def tool(slug, title, desc, word, crumb, h1, sub, ui, sections, faqs, related, page_key, app_cat):
    url = SITE + "/" + slug
    extra = ""
    for h, content in sections:
        extra += '<section class="legal-sec"><h2>%s</h2>%s</section>' % (esc(h), content)
    extra += '<section class="legal-sec" id="faq"><h2>Questions people ask</h2>%s</section>' % faq_html(faqs)
    rel = "".join('<li><a class="text-link" href="%s">%s</a></li>' % (h, esc(t)) for t, h in related)
    main = (hero(word, [("Free tools", "/tools"), (crumb, None)], "Free tool", h1, sub) +
            '<section class="section gd"><div class="container">%s'
            '<div class="legal-grid tl-sec"><aside class="legal-aside"><p class="footer-label">Also useful</p><ul class="legal-more">%s</ul></aside>'
            '<div class="legal-body">%s</div></div></div></section>' % (ui, rel, extra))
    ld = [{"@context": "https://schema.org", "@type": "WebApplication", "name": strip(h1), "url": url, "description": desc,
           "applicationCategory": app_cat, "operatingSystem": "Any", "inLanguage": "en-NG",
           "offers": {"@type": "Offer", "price": "0", "priceCurrency": "NGN"},
           "provider": {"@type": "Organization", "name": "100EMPIRE", "url": SITE + "/"}},
          crumbs_ld([("Free tools", SITE + "/tools"), (crumb, url)]), faq_ld(faqs)]
    page(slug, title, desc, main, ld, page_key, TOOLS_JS)
    return url


VAX_UI = '''<div class="tl" data-tool="vax"><form class="tl-panel" data-vax-form novalidate>
<div class="tl-f"><label for="vxName">Puppy’s name <span>(optional)</span></label><input id="vxName" name="name" type="text" maxlength="40" autocomplete="off" placeholder="e.g. Rex"></div>
<div class="tl-f"><label for="vxDob">Date of birth</label><input id="vxDob" name="dob" type="date" required></div>
<p class="tl-err" data-vax-err aria-live="polite"></p>
<button class="e-btn e-btn--gold" type="submit">Show my puppy’s dates</button>
<p class="tl-hint">Based on the 2024 WSAVA vaccination guidelines. Your vet confirms the exact plan for each dog. The date stays on this phone; nothing is sent to us.</p>
</form><div class="tl-out" data-vax-out aria-live="polite"><div class="tl-empty">Enter your puppy’s date of birth to see every vaccination and deworming date.</div></div></div>'''

VAX_TABLE = table(["Age", "What is given"], [
    ("From 2 weeks", "<b>Deworming.</b> Repeated regularly through puppyhood and every few months for adults."),
    ("6–8 weeks", "<b>Core vaccine, 1st dose.</b> Distemper, hepatitis (adenovirus) and parvovirus."),
    ("10–12 weeks", "<b>Core vaccine, 2nd dose.</b> Leptospirosis can start here if your vet advises it."),
    ("14–16 weeks", "<b>Final puppy dose and rabies.</b> The last puppy dose is given at 16 weeks or older. Rabies is present in Nigeria, so it is a core vaccine here."),
    ("6–12 months", "<b>Booster.</b> Closes any gap left by the puppy course."),
    ("Adult dogs", "<b>Boosters.</b> Core vaccines no more often than every 3 years. Rabies and leptospirosis as your vet advises."),
], stack=True)
VAX_FAQ = [
    ("When should a puppy get its first vaccine?", "At 6–8 weeks old, with the core vaccine against distemper, hepatitis (adenovirus) and parvovirus. Deworming starts from 2 weeks."),
    ("Why must the last puppy dose be at 16 weeks or older?", "Antibodies from the mother can stop earlier doses from working. Giving the final puppy dose at 16 weeks or older makes sure it takes."),
    ("Does my puppy need the rabies vaccine?", "Yes. Rabies is present in Nigeria, so rabies is treated as a core vaccine here. It is given with the final puppy dose."),
    ("How often do adult dogs need boosters?", "Core vaccines no more often than every 3 years after the 6–12 month booster. Rabies and leptospirosis follow your vet’s advice."),
    ("My puppy missed a dose. What now?", "Speak to your vet. Depending on the gap, the vet may continue the course or restart it."),
]
vax_url = tool(
    "puppy-vaccination-calculator",
    "Puppy Vaccination Schedule Calculator (Nigeria) · 100EMPIRE",
    "Enter your puppy’s date of birth and get every vaccination and deworming date, based on the 2024 WSAVA guidelines. Save the dates to your calendar or WhatsApp.",
    "VACCINES", "Puppy vaccination calculator", "Puppy vaccination calculator",
    "Enter your puppy’s date of birth and get every vaccination and deworming date. Save them to your calendar or send them to WhatsApp.",
    VAX_UI,
    [("The schedule behind the dates",
      "<p>Based on the 2024 vaccination guidelines of the <a href=\"https://wsava.org/global-guidelines/vaccination-guidelines/\" target=\"_blank\" rel=\"noopener\">World Small Animal Veterinary Association (WSAVA)</a>. "
      "Your vet confirms the exact plan for each dog.</p>" + VAX_TABLE)],
    VAX_FAQ,
    [("Dogs and puppies", "/dogs"), ("Dog prices in Nigeria", "/dog-prices-nigeria"), ("All free tools", "/tools")],
    "puppy-vaccination-calculator", "HealthApplication")

BP_UI = '''<div class="tl tl--wide" data-tool="budget"><div class="tl-panel">
<div class="bp-top"><div class="tl-f"><label for="bpBudget">Total budget (₦)</label><input class="tl-in" id="bpBudget" type="text" inputmode="numeric" placeholder="e.g. 5,000,000" data-bp-budget></div>
<div class="tl-f"><label for="bpGuests">Number of guests</label><input class="tl-in" id="bpGuests" type="text" inputmode="numeric" placeholder="e.g. 300" data-bp-guests></div></div>
<dl class="bp-sum"><div><dt>Estimated total</dt><dd data-bp-total>₦0</dd></div><div><dt>Paid so far</dt><dd data-bp-paid>₦0</dd></div><div><dt>Still to pay</dt><dd data-bp-due>₦0</dd></div><div><dt>Budget left</dt><dd data-bp-left>₦0</dd></div><div><dt>Cost per guest</dt><dd data-bp-pg>–</dd></div></dl>
<div class="bp-bar" aria-hidden="true"><i data-bp-bar></i></div>
<table class="bp-rows"><thead><tr><th>Item</th><th>Estimate (₦)</th><th>Paid (₦)</th><th><span class="sr-only">Remove</span></th></tr></thead><tbody data-bp-rows></tbody></table>
<div class="tl-btns bp-add"><button class="e-btn e-btn--ghost" type="button" data-bp-add>Add an item</button></div>
<div class="tl-btns"><button class="e-btn e-btn--gold" type="button" data-bp-share>Send to WhatsApp</button><button class="e-btn e-btn--ghost" type="button" data-bp-pdf>Save as PDF</button><button class="e-btn e-btn--ghost" type="button" data-bp-reset>Start again</button></div>
<p class="tl-hint">Saved automatically on this phone or computer, so you can come back and update it. Nothing is sent to us.</p>
</div></div>'''
BP_FAQ = [
    ("Where do I start with a wedding budget?", "Start with the guest count. Food, drinks, the size of the venue, chairs, souvenirs and aso ebi all grow with it. Then fill in the big items first: venue, food and drinks, photo and video, and decoration."),
    ("Should I keep money aside for surprises?", "Yes. The planner has a line for unexpected costs. Fill it in so a late bill does not come out of something you care about."),
    ("Is my budget saved?", "Yes, on this phone or computer only, in your browser. We cannot see it. Use Send to WhatsApp or Save as PDF to share it with your partner or planner."),
    ("How much is wedding photography and video?", "With 100EMPIRE in 2026, from ₦150,000 for photos only, ₦350,000 for photo and video, and ₦700,000 for a full-day cinematic package. See the full price guide."),
]
bp_url = tool(
    "wedding-budget-planner",
    "Wedding Budget Planner and Calculator (Nigeria) · 100EMPIRE",
    "Free wedding budget calculator for Nigerian weddings: list every cost from venue to aso ebi, track what you have paid, see the cost per guest, and share it on WhatsApp.",
    "BUDGET", "Wedding budget planner", "Wedding budget planner",
    "List every wedding cost, track what you have paid and what is left, and see your cost per guest. It saves as you type.",
    BP_UI,
    [("How to use it",
      ul(["Enter your total budget and the number of guests.",
          "Fill in an estimate for each item. Delete what you do not need and add your own items.",
          "As you pay vendors, enter what you have paid. The planner shows what is still to pay.",
          "For photo and video, pick a 100EMPIRE package to fill in its price, or type your own figure."]) +
      "<p>Prices for photo, video, albums and stationery are in our <a href=\"/wedding-photography-prices-abuja\">wedding photo and film price guide</a>.</p>")],
    BP_FAQ,
    [("Weddings", "/weddings"), ("Wedding photo and film prices", "/wedding-photography-prices-abuja"), ("All free tools", "/tools")],
    "wedding-budget-planner", "FinanceApplication")

FP_UI = '''<div class="tl" data-tool="frame"><div class="tl-panel">
<div class="tl-f"><label for="fpFile">Your photo</label><input id="fpFile" type="file" accept="image/*" data-fp-file><p class="tl-hint">Your photo stays on your phone. Nothing is uploaded.</p></div>
<fieldset class="tl-f"><legend class="tl-k">Finish</legend><div class="tl-seg"><label><input type="radio" name="fpType" value="border" checked><span>Border</span></label><label><input type="radio" name="fpType" value="borderless"><span>Borderless</span></label><label><input type="radio" name="fpType" value="acrylic"><span>Acrylic</span></label></div></fieldset>
<div class="tl-f"><label for="fpSize">Size</label><select id="fpSize" data-fp-size></select></div>
<fieldset class="tl-f"><legend class="tl-k">Direction</legend><div class="tl-seg"><label><input type="radio" name="fpDir" value="portrait" checked><span>Portrait</span></label><label><input type="radio" name="fpDir" value="landscape"><span>Landscape</span></label></div></fieldset>
<div class="fp-price"><span class="tl-k">Price</span><b data-fp-price>₦8,000</b></div>
<div class="tl-btns"><a class="e-btn e-btn--gold" data-fp-order href="/pay?item=frames--border--8x10">Order and pay</a><a class="e-btn e-btn--ghost" data-enq="frames" data-fp-ask href="https://wa.me/2347039934163?text=Hello%20100EMPIRE%2C%20I%20would%20like%20to%20order%20a%20frame." target="_blank" rel="noopener">Ask on WhatsApp</a></div>
</div><div class="tl-out"><div class="fp-wall" data-fp-wall><div class="fp-floor" data-fp-floor></div><span class="fp-scale" data-fp-scale></span>
<div class="fp-sofa" data-fp-sofa aria-hidden="true"><svg viewBox="0 0 84 34" preserveAspectRatio="none"><path fill="currentColor" d="M6 10h72v14H6z"/><rect fill="currentColor" x="0" y="12" width="10" height="18" rx="3"/><rect fill="currentColor" x="74" y="12" width="10" height="18" rx="3"/><rect fill="currentColor" x="8" y="2" width="68" height="14" rx="3" opacity=".85"/><rect fill="currentColor" x="4" y="28" width="76" height="3"/><rect fill="currentColor" x="8" y="31" width="3" height="3"/><rect fill="currentColor" x="73" y="31" width="3" height="3"/></svg></div>
<div class="fp-person" data-fp-person aria-hidden="true"><svg viewBox="0 0 20 68" preserveAspectRatio="none"><circle fill="currentColor" cx="10" cy="5" r="4.6"/><path fill="currentColor" d="M4.5 11h11l2.5 22h-3.5l-1.2-12-.3 45H11V40H9v26H6L5.7 21l-1.2 12H1z"/></svg></div>
<div class="fp-frame is-border" data-fp-frame><div class="fp-ph">Your photo</div></div></div>
<p class="tl-note" data-fp-note>Shown on a wall about 3.6 m wide next to a 2.1 m sofa and a 1.7 m person, so you can judge the size.</p></div></div>'''
FP_FAQ = [
    ("Which frame size suits a living room?", "24×30 inches and above work well over a sofa. 16×20 suits bedrooms and offices."),
    ("Is the preview exact?", "It is drawn to scale, so the size against the sofa and the person is right. Colours on screen and the exact crop of your photo are confirmed before printing."),
    ("Is my photo uploaded?", "No. The preview runs on your phone or computer. When you order, send the original photo on WhatsApp so we can check it is sharp enough for the size."),
    ("Can you frame a photo from my phone?", "Yes. Send the original photo on WhatsApp (not a screenshot). We check if it is sharp enough for the size you want and advise you."),
]
fp_url = tool(
    "frame-size-preview",
    "Frame Size Preview: See Your Photo Framed on a Wall · 100EMPIRE",
    "Upload a photo, pick a frame size and finish, and see how it looks on a wall next to a sofa, with the price. Border, borderless and acrylic, 8×10 inches to 7×9 feet.",
    "PREVIEW", "Frame size preview", "Frame size preview",
    "Add your photo, pick a size and finish, and see it on a wall next to a sofa, drawn to scale, with the price.",
    FP_UI,
    [("Prices", "<p>Every size and finish, with what each finish looks like, is in our <a href=\"/picture-frame-prices-abuja\">picture frame price guide</a>.</p>" +
      table(["Size", "Border", "Borderless", "Acrylic"], FR_ROWS, stack=True, nums=(1, 2, 3)))],
    FP_FAQ,
    [("Frames and prints", "/frames"), ("Picture frame prices", "/picture-frame-prices-abuja"), ("All free tools", "/tools")],
    "frame-size-preview", "DesignApplication")


# ============================================================ HUBS
def hub(slug, title, desc, word, crumb, label, h1, sub, cards, page_key):
    url = SITE + "/" + slug
    c = "".join('<a class="gd-card" href="%s"><span class="gd-card-k">%s</span><h2>%s</h2><p>%s</p><span class="gd-card-go">%s →</span></a>'
                % (h, esc(k), esc(t), esc(d), esc(go)) for k, t, d, h, go in cards)
    main = (hero(word, [(crumb, None)], label, h1, sub) +
            '<section class="section"><div class="container"><div class="gd-cards">%s</div></div></section>' % c)
    ld = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": strip(h1), "url": url, "description": desc,
           "hasPart": [{"@type": "WebPage", "name": t, "url": SITE + h} for k, t, d, h, go in cards]},
          crumbs_ld([(crumb, url)])]
    page(slug, title, desc, main, ld, page_key)


hub("guides", "Price Guides: What Things Cost in Nigeria (2026) · 100EMPIRE",
    "Free 2026 price guides for Nigeria: dog and puppy prices, wedding photography in Abuja, website costs and picture frame prices.",
    "GUIDES", "Price guides", "Price guides · 2026", "Price guides",
    "Straight answers on what things cost in Nigeria in 2026, with real prices, what changes them and what to check before you pay.",
    [("Dogs", "Dog prices in Nigeria", "Guide prices for 18 pure breeds, what changes the price, and how to buy a puppy safely.", "/dog-prices-nigeria", "Read the guide"),
     ("Weddings", "Wedding photo and film prices in Abuja", "Packages from ₦150,000, add-ons like drone and same-day edits, and how to budget.", "/wedding-photography-prices-abuja", "Read the guide"),
     ("Websites", "Website prices in Nigeria", "From one-page sites to school portals and online stores, plus the yearly costs.", "/website-cost-nigeria", "Read the guide"),
     ("Frames", "Picture frame prices in Abuja", "Every size from 8×10 inches to 7×9 feet, in border, borderless and acrylic.", "/picture-frame-prices-abuja", "Read the guide")],
    "guides")
hub("tools", "Free Tools: Puppy Vaccination, Wedding Budget, Frame Preview · 100EMPIRE",
    "Free tools from 100EMPIRE: a puppy vaccination date calculator, a wedding budget planner for Nigerian weddings, and a frame size preview.",
    "TOOLS", "Free tools", "Free tools", "Free tools",
    "Free to use, no sign-up. Everything runs on your phone, and nothing you enter is sent to us.",
    [("Dogs", "Puppy vaccination calculator", "Every vaccination and deworming date from your puppy’s birthday. Save to your calendar or WhatsApp.", "/puppy-vaccination-calculator", "Open the tool"),
     ("Weddings", "Wedding budget planner", "List every cost, track what you have paid and see your cost per guest.", "/wedding-budget-planner", "Open the tool"),
     ("Frames", "Frame size preview", "See your photo framed on a wall, to scale, with the price.", "/frame-size-preview", "Open the tool")],
    "tools")

print("built:", ", ".join(u.rsplit("/", 1)[1] for u in [dog_url, w_url, web_url, fr_url, vax_url, bp_url, fp_url]) + ", guides, tools")
