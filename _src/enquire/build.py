"""Build js/enquire.js (the site-wide enquiry form) from engine.js + data harvested from the pages.

Run from the repo root:  python3 _src/enquire/build.py
- Packages come from the package cards (<article class="e-pkg">) on each service page,
  courses from the Academy page, frame sizes from the Frames price table.
- Questions per service are defined below in FIELDS.
- Adds <script src="/js/enquire.js"> to every page (not paylink.html or the Google file).
"""
import glob, html, json, os, re
from urllib.parse import unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(ROOT)
VERSION = '6'

SERVICES = [
    ('graphic', 'Graphic design and branding', 'Package'),
    ('video', 'Video editing and motion', 'Package'),
    ('photo', 'Photography', 'Package'),
    ('weddings', 'Weddings', 'Package'),
    ('church', 'Church media', 'Plan'),
    ('web', 'Web design', 'Package'),
    ('apps', 'App development', 'Package'),
    ('social', 'Social media and ads', 'Package'),
    ('books', 'Books and writing', 'Package'),
    ('academy', 'Academy (training)', 'Course'),
    ('frames', 'Frames and prints', 'Package'),
    ('dogs', 'Dogs and puppies', 'Package'),
    ('join', 'Join the network (for creatives)', 'Package'),
    ('other', 'Something else', 'Package'),
]
GROUPS = {'Weddings': 'weddings', 'Wedding stationery': 'weddings', 'Web Design': 'web', 'School websites': 'web',
          'Real estate websites': 'web', 'Church websites': 'web', 'Online stores': 'web', 'Church Media': 'church',
          'Graphic Design': 'graphic', 'Photography': 'photo', 'Video Editing': 'video', 'App Development': 'apps',
          'Books & Writing': 'books', 'Social Media & Campaigns': 'social'}
PAGES = {'/graphic-design': 'graphic', '/video-editing': 'video', '/photography': 'photo', '/weddings': 'weddings',
         '/church-media': 'church', '/web-design': 'web', '/app-development': 'apps', '/digital-marketing': 'social',
         '/book-writing': 'books', '/academy': 'academy', '/frames': 'frames', '/dogs': 'dogs',
         '/unity-worship-centre': 'church', '/from-lead-to-deal': 'video', '/nursing-emigration-explainer': 'video',
         '/christian-book-from-sermons': 'books', '/graciest-fashion': 'web', '/christhouse-apostolic-fellowship': 'web',
         '/pastor-abraham-praise': 'web', '/apostolic-ministry-network': 'web', '/fixnaija-movement': 'web',
         '/capital-city-real-estate': 'social', '/beginner-web-development-course': 'other', '/mini-importation-class': 'other'}
DOG_NEEDS = [('buy', 'Buy a puppy'), ('stud', 'Stud or breeding'), ('vax', 'Vaccination and deworming'),
             ('health', 'Health check'), ('consult', 'Breed consultation'), ('papers', 'Pedigree papers (COBA)'),
             ('care', 'Aftercare and training')]
BREEDS = ['German Shepherd', 'Boerboel', 'Rottweiler', 'Caucasian Shepherd', 'Lhasa Apso', 'Labrador Retriever',
          'Siberian Husky', 'American Bully', 'Doberman', 'Golden Retriever', 'Shih Tzu', 'Chihuahua', 'Bullmastiff',
          'Chow Chow', 'French Bulldog', 'English Bulldog', 'Maltese', 'Pug', 'Not sure, I need advice', 'Another breed (say in the notes)']
STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi',
          'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
          'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
          'Yobe', 'Zamfara', 'Outside Nigeria']
WHEN = ['As soon as possible', 'Within 2 weeks', 'Within a month', '1–3 months', 'Flexible']

def F(n, l, t='select', o=None, for_=(), **kw):
    d = {'n': n, 'l': l, 't': t, 'for': list(for_)}
    if o: d['o'] = o
    d.update(kw)
    return d

def frame_sizes():
    s = open('frames.html', encoding='utf-8').read()
    m = re.search(r'data-prices="([^"]*)"', s)
    return [r['size'] for r in json.loads(html.unescape(m.group(1)))] + ['Custom size']

FIELDS = [
    # graphic design
    F('gd_type', 'What should we design?', o=['Logo or brand identity', 'Flyers or posters', 'Social media designs', 'Business cards and print',
      'Party or event designs', 'Book cover', 'Packaging or labels', 'Something else'], for_=['graphic'], reqFor=['graphic'], err='Please choose what we should design.'),
    F('gd_qty', 'How many', 'text', for_=['graphic'], ph='e.g. 1 flyer, 10 posts', opt=True),
    F('gd_brand', 'Logo and brand colours', o=['I have them', 'Partly', 'I need them too'], for_=['graphic']),
    F('gd_when', 'When do you need it?', o=['Within 24–48 hours', 'This week', 'Within 2 weeks', 'Flexible'], for_=['graphic']),
    # video
    F('vd_type', 'Kind of video', o=['Reels or short videos', 'YouTube video', 'Sermon or church service', 'Event highlight', 'Documentary or interview',
      'Music video', 'Advert or promo', 'Class or course', 'Something else'], for_=['video'], reqFor=['video'], err='Please choose the kind of video.'),
    F('vd_len', 'Raw footage length', o=['Under 10 minutes', '10–30 minutes', '30–60 minutes', '1–2 hours', 'Over 2 hours', 'We need you to film it too'], for_=['video']),
    F('vd_count', 'How many videos', 'text', for_=['video'], ph='e.g. 1, or 8 reels a month', opt=True),
    F('vd_when', 'When do you need it?', o=['Within 3 days', 'This week', 'Within 2 weeks', 'Flexible'], for_=['video']),
    # photography
    F('ph_type', 'Kind of shoot', o=['Portraits', 'Birthday or celebration', 'Event coverage', 'Corporate headshots', 'Products', 'Graduation', 'Something else'],
      for_=['photo'], reqFor=['photo'], err='Please choose the kind of shoot.'),
    F('ph_date', 'Shoot date', 'date', for_=['photo'], opt=True),
    F('ph_people', 'How many people or products', 'text', for_=['photo'], ph='e.g. 2 people, 30 products', opt=True),
    # weddings
    F('wd_type', 'Wedding', o=['Traditional wedding', 'White wedding', 'Traditional and white', 'Engagement or pre-wedding shoot', 'Introduction'],
      for_=['weddings'], reqFor=['weddings'], err='Please choose the kind of wedding.'),
    F('wd_date', 'Wedding date', 'date', for_=['weddings'], opt=True),
    F('wd_cover', 'Coverage', o=['Photo only', 'Video only', 'Photo and video', 'Photo, video and drone', 'Photo, video, drone and livestream', 'Stationery only'], for_=['weddings']),
    F('wd_guests', 'Guests', o=['Under 100', '100–300', '300–600', 'Over 600'], for_=['weddings'], opt=True),
    # church
    F('ch_note', 'Church Media is available in Abuja (FCT) and Suleja only for now. Other locations are coming soon. Churches elsewhere can still send this to join the waitlist.', 'note', for_=['church']),
    F('ch_need', 'What the church needs', o=['Monthly media support', 'Livestream setup', 'Sermon clips', 'Programme or event coverage', 'Flyers and designs',
      'Media team training', 'Something else'], for_=['church'], reqFor=['church'], err='Please choose what the church needs.'),
    F('ch_name', 'Church name', 'text', for_=['church'], opt=True),
    F('ch_size', 'Church size', o=['Under 100 members', '100–500', '500–1,000', 'Over 1,000'], for_=['church'], opt=True),
    F('ch_when', 'When to start', o=['Now', 'Within a month', 'For a specific programme'], for_=['church']),
    # web
    F('wb_type', 'Kind of website', o=['Business website', 'Church or ministry', 'School', 'Real estate', 'Online store', 'Landing page', 'Portfolio', 'Something else'],
      for_=['web'], reqFor=['web'], err='Please choose the kind of website.'),
    F('wb_pages', 'How many pages', o=['1 page', '2–5 pages', '6–10 pages', 'More than 10'], for_=['web']),
    F('wb_domain', 'Domain name (.com, .ng)', o=['I have one', 'I need one', 'Not sure'], for_=['web']),
    F('wb_when', 'When do you need it?', o=WHEN, for_=['web']),
    # apps
    F('ap_plat', 'Platform', o=['Android', 'iPhone (iOS)', 'Android and iPhone', 'Web app', 'Admin dashboard'], for_=['apps'], reqFor=['apps'], err='Please choose a platform.'),
    F('ap_stage', 'Where you are', o=['Just an idea', 'Idea with designs', 'Existing app to improve'], for_=['apps']),
    F('ap_feat', 'Main features', 'text', for_=['apps'], ph='e.g. login, payments, booking', opt=True),
    F('ap_when', 'When do you need it?', o=WHEN, for_=['apps']),
    # social
    F('sm_goal', 'Main goal', o=['More followers', 'More sales or leads', 'Promote an event', 'Brand awareness', 'Manage my pages for me'],
      for_=['social'], reqFor=['social'], err='Please choose your main goal.'),
    F('sm_plat', 'Platforms', o=['Instagram', 'Facebook', 'TikTok', 'X (Twitter)', 'LinkedIn', 'WhatsApp', 'Several platforms'], for_=['social']),
    F('sm_ads', 'Monthly ad budget', o=['No ads for now', 'Under ₦50,000', '₦50,000 – ₦200,000', '₦200,000 – ₦500,000', 'Above ₦500,000', 'Not sure'], for_=['social'], opt=True),
    F('sm_handle', 'Page or handle', 'text', for_=['social'], ph='@yourpage', opt=True),
    # books
    F('bk_type', 'Kind of project', o=['Ghostwriting a book', 'Sermons or talks into a book', 'Rewriting or editing', 'Devotional or booklet',
      'Course or training manual', 'Cover design', 'Audiobook'], for_=['books'], reqFor=['books'], err='Please choose the kind of project.'),
    F('bk_len', 'Length', o=['Under 50 pages', '50–150 pages', 'Over 150 pages', 'Not sure'], for_=['books']),
    F('bk_mat', 'What you have now', o=['A full draft', 'Notes or recordings', 'Just an idea'], for_=['books']),
    F('bk_when', 'When do you need it?', o=['Within a month', '1–3 months', '3–6 months', 'Flexible'], for_=['books']),
    # academy
    F('ac_mode', 'How you want to learn', o=['In person in Abuja (Utako)', 'Online', 'Either'], for_=['academy'], reqFor=['academy'], err='Please choose how you want to learn.'),
    F('ac_level', 'Your level', o=['Complete beginner', 'Some experience'], for_=['academy']),
    F('ac_start', 'When to start', o=['Next class', 'This month', 'Flexible'], for_=['academy']),
    F('ac_laptop', 'Do you have a laptop?', o=['Yes', 'No'], for_=['academy']),
    # frames
    F('fr_type', 'Frame', o=['Border frame', 'Borderless frame', 'Acrylic frame', 'Not sure'], for_=['frames'], reqFor=['frames'], err='Please choose a frame.'),
    F('fr_size', 'Size', o=frame_sizes(), for_=['frames']),
    F('fr_qty', 'How many', 'number', for_=['frames'], ph='1', opt=True),
    F('fr_photo', 'The picture', o=['I will send a photo to print', 'Already printed', 'Certificate or document', 'Not sure'], for_=['frames']),
    # dogs (shown by need)
    F('breed', 'Breed you want', o=BREEDS, for_=['dogs'], ph='Choose a breed…', reqNeed=['buy', 'stud'], err='Please choose a breed, or pick ‘Not sure’.'),
    F('dg_sex', 'Male or female', o=['Male', 'Female', 'Either'], for_=['dogs'], need=['buy'], opt=True, ml='Sex'),
    F('dg_dogsex', 'Your dog is', o=['Male', 'Female'], for_=['dogs'], need=['stud', 'papers'], ml='My dog is'),
    F('dg_count', 'How many dogs', o=['1', '2', '3', '4 or more'], for_=['dogs'], need=['vax', 'health']),
    F('dg_purpose', 'Main purpose', o=['Security', 'Family companion', 'Security and family', 'Breeding'], for_=['dogs'], need=['consult']),
    F('dg_agewant', 'Age you want', o=['8–12 weeks (puppy)', '3–6 months', '6–12 months', 'Adult dog', 'Any age'], for_=['dogs'], need=['buy'], ml='Age wanted'),
    F('dg_paperswant', 'Pedigree papers', o=['Yes, with COBA papers', 'Not needed', 'Not sure'], for_=['dogs'], need=['buy']),
    F('dg_budget', 'Budget', o=['Under ₦300,000', '₦300,000 – ₦600,000', '₦600,000 – ₦1,000,000', 'Above ₦1,000,000', 'Not sure yet'], for_=['dogs'], need=['buy'], opt=True, ph='Prefer not to say'),
    F('dg_when', 'When do you want it', o=['As soon as possible', 'Within a month', 'In 1–3 months', 'Just checking prices'], for_=['dogs'], need=['buy'], ml='When'),
    F('dg_age', 'Your dog’s age', 'text', for_=['dogs'], need=['stud', 'vax', 'health', 'papers', 'care'], ph='e.g. 10 weeks or 2 years', ml="My dog's age"),
    F('dg_papers', 'Does it have pedigree papers?', o=['Yes', 'No', 'Not sure'], for_=['dogs'], need=['stud', 'papers'], ml='Has pedigree papers'),
    F('dg_vaxhist', 'Vaccines so far', o=['None yet', 'Some vaccines', 'Up to date, needs a booster', 'Not sure'], for_=['dogs'], need=['vax', 'health']),
    F('dg_vaccinated', 'Is your dog vaccinated?', o=['Yes, up to date', 'Not up to date', 'Not sure'], for_=['dogs'], need=['stud'], ml='Vaccinated'),
    F('dg_studwant', 'What you want', o=['Use your stud for my female', 'Offer my male for stud', 'Advice on breeding'], for_=['dogs'], need=['stud'], ml='Looking for'),
    F('dg_home', 'Your home', o=['Flat or apartment', 'House with a compound', 'Estate', 'Farm or large land'], for_=['dogs'], need=['consult'], ml='Home'),
    F('dg_exp', 'Owned a dog before?', o=['Yes', 'No, first dog'], for_=['dogs'], need=['consult']),
    F('dg_delivery', 'Delivery or pick-up', o=['Deliver to my location', 'Pick up at an agreed point', 'Not sure yet'], for_=['dogs'], need=['buy'], ml='Delivery'),
    # join the network
    F('jn_skill', 'Your skill', o=['Filmmaking or video', 'Photography', 'Graphic design', 'Video editing', 'Web or app development', 'Writing',
      'Social media', 'Something else'], for_=['join'], reqFor=['join'], err='Please choose your skill.'),
    F('jn_link', 'Portfolio link', 'text', for_=['join'], ph='Instagram, Behance, Drive or website', reqFor=['join'], err='Please add a link to your work.'),
    F('jn_years', 'Experience', o=['Under 1 year', '1–3 years', '3–5 years', 'Over 5 years'], for_=['join']),
]
ALL = [s[0] for s in SERVICES]
COMMON = [
    F('state', 'Your state', o=STATES, for_=ALL, ph='Choose your state…', req=True, err='Please choose your state.'),
    F('area', 'Town or area', 'text', for_=ALL, ph='e.g. Wuse 2, Lekki, Suleja', opt=True, ac='address-level2'),
    F('name', 'Your name', 'text', for_=ALL, req=True, err='Please enter your name.', ac='name'),
    F('notes', 'Anything else', 'textarea', for_=ALL, wide=True, reqFor=['other'], err='Please tell us a little about it.'),
]
NOTES_HINT = {
    'graphic': 'Text for the design, colours you like, sizes, where it will be used…',
    'video': 'What the video is for, music, style you like, where to download the footage…',
    'photo': 'Venue, outfit changes, the look you want…',
    'weddings': 'Venue, schedule, extras like albums or a livestream…',
    'church': 'Services per week, equipment you already have…',
    'web': 'What the site is for, sites you like, features you need…',
    'apps': 'Who will use the app and what it should do…',
    'social': 'Your business, audience and what you have tried…',
    'books': 'Topic, audience, and anything already written…',
    'academy': 'Questions about the course, dates or payment…',
    'frames': 'Colour, glass, delivery, anything special…',
    'dogs': 'Colour, temperament, health concern, dates, questions…',
    'join': 'A short note about you and the work you do…',
    'other': 'What you want to make, who it is for and when you need it…',
}

def harvest_packages():
    pk = {}
    for f in sorted(glob.glob('*.html')):
        s = open(f, encoding='utf-8').read()
        for sec in re.findall(r'<section\b.*?</section>', s, re.S):
            cards = re.findall(r'<article class="e-pkg[^"]*">(.*?)</article>', sec, re.S)
            if not cards: continue
            lab = re.search(r'<p class="e-label">(.*?)</p>', sec)
            seclabel = html.unescape(re.sub('<[^>]+>', '', lab.group(1))) if lab else ''
            heads = [(m.start(), html.unescape(re.sub('<[^>]+>', '', m.group(1))))
                     for m in re.finditer(r'<h3(?: class="(?!e-pkg-name)[^"]*")?>(.*?)</h3>', sec)]
            for cm in re.finditer(r'<article class="e-pkg[^"]*">(.*?)</article>', sec, re.S):
                c = cm.group(1)
                sub = [h for pos, h in heads if pos < cm.start()]
                n = html.unescape(re.sub('<[^>]+>', '', re.search(r'class="e-pkg-name">(.*?)</', c).group(1)))
                pm = re.search(r'class="e-pkg-price">(.*?)</', c)
                p = html.unescape(re.sub('<[^>]+>', '', pm.group(1))) if pm else ''
                m = re.search(r'text=([^"]*)"', c); msg = unquote(m.group(1)) if m else ''
                g = re.search(r'under (.+?)\. Please', msg)
                grp = g.group(1) if g else ''
                svc = GROUPS.get(grp)
                if not svc: continue
                group_label = grp if grp not in ('Graphic Design', 'Photography', 'Church Media', 'Video Editing', 'App Development',
                                                 'Books & Writing', 'Social Media & Campaigns', 'Web Design', 'Weddings') else (sub[-1] if sub else (seclabel or grp))
                pk.setdefault(svc, []).append({'g': group_label, 'n': n, 'p': p})
    # academy courses
    a = open('academy.html', encoding='utf-8').read()
    courses = []
    for c in re.findall(r'<article class="e-course">(.*?)</article>', a, re.S):
        n = html.unescape(re.sub('<[^>]+>', '', re.search(r'<h3>(.*?)</h3>', c).group(1)))
        p = re.search(r'<b>(.*?)</b>', c)
        courses.append({'g': 'Courses', 'n': n, 'p': html.unescape(p.group(1)) if p else ''})
    for m in re.findall(r'enrol%20in%20the%20(.+?)%20course', a):
        n = unquote(m)
        if n not in [c['n'] for c in courses]: courses.append({'g': 'Courses', 'n': n, 'p': ''})
    pk['academy'] = courses
    return pk

def main():
    pk = harvest_packages()
    data = {'services': [{'id': i, 'name': n, 'pkgLabel': l} for i, n, l in SERVICES], 'packages': pk, 'fields': FIELDS,
            'common': COMMON, 'groups': GROUPS, 'pages': PAGES, 'dogNeeds': DOG_NEEDS, 'dogNeedName': dict(DOG_NEEDS), 'notesHint': NOTES_HINT}
    eng = open('_src/enquire/engine.js', encoding='utf-8').read()
    out = eng.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    open('js/enquire.js', 'w', encoding='utf-8').write(out)
    print('js/enquire.js', len(out.encode()), 'bytes;', {k: len(v) for k, v in pk.items()})
    tag = f'<script src="/js/enquire.js?v={VERSION}" defer></script>'
    n = 0
    for f in glob.glob('*.html'):
        if f in ('paylink.html',) or f.startswith('google'): continue
        s = open(f, encoding='utf-8').read(); o = s
        s = re.sub(r'<script src="/js/enquire\.js\?v=[^"]*" defer></script>', '', s)
        s = s.replace('</body>', tag + '\n</body>', 1)
        if s != o: open(f, 'w', encoding='utf-8').write(s); n += 1
    print('pages with the form script:', n)

if __name__ == '__main__':
    main()
