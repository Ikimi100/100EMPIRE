/* 100EMPIRE — enquire.js: one enquiry form for the whole site.
   Built by _src/enquire/build.py — edit the files in _src/enquire, then run the build.
   Any WhatsApp link (wa.me/2347039934163) opens this form first, filled in from the link:
   the page's service, a package ("... the Gold package (₦700,000) under Weddings"), a course,
   a project, a frame order or a dog breed. The answers go to WhatsApp as one message.
   Links marked data-direct, and links inside the form, still go straight to WhatsApp.
   Without JavaScript (or without <dialog>) every link simply opens WhatsApp as before. */
(function () {
  "use strict";
  var DATA = {"services":[{"id":"graphic","name":"Graphic design and branding","pkgLabel":"Package"},{"id":"video","name":"Video editing and motion","pkgLabel":"Package"},{"id":"photo","name":"Photography","pkgLabel":"Package"},{"id":"weddings","name":"Weddings","pkgLabel":"Package"},{"id":"church","name":"Church media","pkgLabel":"Plan"},{"id":"web","name":"Web design","pkgLabel":"Package"},{"id":"apps","name":"App development","pkgLabel":"Package"},{"id":"social","name":"Social media and ads","pkgLabel":"Package"},{"id":"books","name":"Books and writing","pkgLabel":"Package"},{"id":"academy","name":"Academy (training)","pkgLabel":"Course"},{"id":"frames","name":"Frames and prints","pkgLabel":"Package"},{"id":"dogs","name":"Dogs and puppies","pkgLabel":"Package"},{"id":"join","name":"Join the network (for creatives)","pkgLabel":"Package"},{"id":"other","name":"Something else","pkgLabel":"Package"}],"packages":{"apps":[{"g":"Packages","n":"App lite","p":"₦250,000 – ₦600,000"},{"g":"Packages","n":"Starter app","p":"₦600,000 – ₦1,500,000"},{"g":"Packages","n":"Business app","p":"₦1,500,000 – ₦4,000,000"},{"g":"Packages","n":"Platform","p":"₦4,000,000 – ₦10,000,000+"}],"books":[{"g":"Ghostwriting packages","n":"Booklet or devotional","p":"₦250,000 – ₦500,000"},{"g":"Ghostwriting packages","n":"Full book","p":"₦600,000 – ₦1,500,000"},{"g":"Ghostwriting packages","n":"Signature book","p":"₦1,500,000 – ₦3,000,000+"}],"church":[{"g":"Monthly plans","n":"Basic","p":"₦500,000"},{"g":"Monthly plans","n":"Premium","p":"₦1,000,000"},{"g":"Monthly plans","n":"Gold","p":"₦1,500,000"},{"g":"Monthly plans","n":"Elite","p":"₦2M – ₦5M+"}],"social":[{"g":"Monthly packages","n":"Starter","p":"₦60,000 – ₦80,000"},{"g":"Monthly packages","n":"Growth","p":"₦120,000 – ₦180,000"},{"g":"Monthly packages","n":"Premium","p":"₦250,000 – ₦400,000"}],"graphic":[{"g":"Flyers and social media","n":"Single","p":"₦10,000"},{"g":"Flyers and social media","n":"Bundle 5","p":"₦45,000"},{"g":"Flyers and social media","n":"Bundle 10","p":"₦85,000"},{"g":"Flyers and social media","n":"Monthly content","p":"₦170,000"},{"g":"Logo and brand identity","n":"Basic logo","p":"₦25,000"},{"g":"Logo and brand identity","n":"Standard logo","p":"₦60,000"},{"g":"Logo and brand identity","n":"Brand identity","p":"₦150,000 – ₦350,000"},{"g":"Parties and nightlife","n":"One Night","p":"₦35,000"},{"g":"Parties and nightlife","n":"Big Night","p":"₦90,000"},{"g":"Parties and nightlife","n":"Mega Night","p":"₦250,000"}],"photo":[{"g":"Portrait sessions","n":"Mini","p":"₦25,000"},{"g":"Portrait sessions","n":"Classic","p":"₦45,000"},{"g":"Portrait sessions","n":"Signature","p":"₦80,000"},{"g":"Event coverage","n":"Essential","p":"₦80,000"},{"g":"Event coverage","n":"Standard","p":"₦150,000"},{"g":"Event coverage","n":"Full day","p":"₦250,000"}],"video":[{"g":"Monthly packages","n":"Starter","p":"₦150,000"},{"g":"Monthly packages","n":"Growth","p":"₦300,000"},{"g":"Monthly packages","n":"Campaign","p":"₦550,000"}],"web":[{"g":"Core packages","n":"Landing page","p":"₦80,000 – ₦150,000"},{"g":"Core packages","n":"Starter business","p":"₦200,000 – ₦350,000"},{"g":"Core packages","n":"Growth","p":"₦450,000 – ₦900,000"},{"g":"Core packages","n":"Custom platform","p":"₦1,500,000+"},{"g":"School websites","n":"Result checker","p":"₦200,000 – ₦450,000"},{"g":"School websites","n":"School portal","p":"₦600,000 – ₦1,200,000"},{"g":"School websites","n":"School management","p":"₦1.5M – ₦3M+"},{"g":"Real estate websites","n":"Listing showcase","p":"₦180,000 – ₦250,000"},{"g":"Real estate websites","n":"Managed portal","p":"₦400,000 – ₦600,000"},{"g":"Real estate websites","n":"Property platform","p":"₦900,000 – ₦1,500,000"},{"g":"Church websites","n":"Ministry site","p":"₦250,000 – ₦450,000"},{"g":"Church websites","n":"Ministry hub","p":"₦500,000 – ₦900,000"},{"g":"Church websites","n":"Ministry platform","p":"₦1M – ₦2M"},{"g":"Online stores","n":"Store starter","p":"₦350,000 – ₦600,000"},{"g":"Online stores","n":"Store pro","p":"₦700,000 – ₦1,800,000"}],"weddings":[{"g":"Wedding packages","n":"Basic","p":"₦150,000"},{"g":"Wedding packages","n":"Premium","p":"₦350,000"},{"g":"Wedding packages","n":"Gold","p":"₦700,000"},{"g":"Wedding packages","n":"Diamond","p":"₦1,200,000"},{"g":"Wedding packages","n":"Elite","p":"₦2,500,000+"},{"g":"Wedding stationery","n":"Digital suite","p":"₦45,000"},{"g":"Wedding stationery","n":"Classic suite","p":"₦95,000"},{"g":"Wedding stationery","n":"Luxury suite","p":"₦180,000"}],"academy":[{"g":"Courses","n":"Graphic Design","p":"₦80,000 – ₦120,000"},{"g":"Courses","n":"Video Editing","p":"₦100,000 – ₦150,000"},{"g":"Courses","n":"Motion Graphics","p":"₦150,000 – ₦220,000"},{"g":"Courses","n":"Photography & Lightroom","p":"₦70,000 – ₦100,000"},{"g":"Courses","n":"Social Media Marketing & Ads","p":"₦60,000 – ₦100,000"},{"g":"Courses","n":"Mini Importation","p":"₦15,000 – ₦30,000"},{"g":"Courses","n":"Church Media Team Training","p":"₦100,000 – ₦300,000"},{"g":"Courses","n":"Web Development","p":""}]},"fields":[{"n":"gd_type","l":"What should we design?","t":"select","for":["graphic"],"o":["Logo or brand identity","Flyers or posters","Social media designs","Business cards and print","Party or event designs","Book cover","Packaging or labels","Something else"],"reqFor":["graphic"],"err":"Please choose what we should design."},{"n":"gd_qty","l":"How many","t":"text","for":["graphic"],"ph":"e.g. 1 flyer, 10 posts","opt":true},{"n":"gd_brand","l":"Logo and brand colours","t":"select","for":["graphic"],"o":["I have them","Partly","I need them too"]},{"n":"gd_when","l":"When do you need it?","t":"select","for":["graphic"],"o":["Within 24–48 hours","This week","Within 2 weeks","Flexible"]},{"n":"vd_type","l":"Kind of video","t":"select","for":["video"],"o":["Reels or short videos","YouTube video","Sermon or church service","Event highlight","Documentary or interview","Music video","Advert or promo","Class or course","Something else"],"reqFor":["video"],"err":"Please choose the kind of video."},{"n":"vd_len","l":"Raw footage length","t":"select","for":["video"],"o":["Under 10 minutes","10–30 minutes","30–60 minutes","1–2 hours","Over 2 hours","We need you to film it too"]},{"n":"vd_count","l":"How many videos","t":"text","for":["video"],"ph":"e.g. 1, or 8 reels a month","opt":true},{"n":"vd_when","l":"When do you need it?","t":"select","for":["video"],"o":["Within 3 days","This week","Within 2 weeks","Flexible"]},{"n":"ph_type","l":"Kind of shoot","t":"select","for":["photo"],"o":["Portraits","Birthday or celebration","Event coverage","Corporate headshots","Products","Graduation","Something else"],"reqFor":["photo"],"err":"Please choose the kind of shoot."},{"n":"ph_date","l":"Shoot date","t":"date","for":["photo"],"opt":true},{"n":"ph_people","l":"How many people or products","t":"text","for":["photo"],"ph":"e.g. 2 people, 30 products","opt":true},{"n":"wd_type","l":"Wedding","t":"select","for":["weddings"],"o":["Traditional wedding","White wedding","Traditional and white","Engagement or pre-wedding shoot","Introduction"],"reqFor":["weddings"],"err":"Please choose the kind of wedding."},{"n":"wd_date","l":"Wedding date","t":"date","for":["weddings"],"opt":true},{"n":"wd_cover","l":"Coverage","t":"select","for":["weddings"],"o":["Photo only","Video only","Photo and video","Photo, video and drone","Photo, video, drone and livestream","Stationery only"]},{"n":"wd_guests","l":"Guests","t":"select","for":["weddings"],"o":["Under 100","100–300","300–600","Over 600"],"opt":true},{"n":"ch_need","l":"What the church needs","t":"select","for":["church"],"o":["Monthly media support","Livestream setup","Sermon clips","Programme or event coverage","Flyers and designs","Media team training","Something else"],"reqFor":["church"],"err":"Please choose what the church needs."},{"n":"ch_name","l":"Church name","t":"text","for":["church"],"opt":true},{"n":"ch_size","l":"Church size","t":"select","for":["church"],"o":["Under 100 members","100–500","500–1,000","Over 1,000"],"opt":true},{"n":"ch_when","l":"When to start","t":"select","for":["church"],"o":["Now","Within a month","For a specific programme"]},{"n":"wb_type","l":"Kind of website","t":"select","for":["web"],"o":["Business website","Church or ministry","School","Real estate","Online store","Landing page","Portfolio","Something else"],"reqFor":["web"],"err":"Please choose the kind of website."},{"n":"wb_pages","l":"How many pages","t":"select","for":["web"],"o":["1 page","2–5 pages","6–10 pages","More than 10"]},{"n":"wb_domain","l":"Domain name (.com, .ng)","t":"select","for":["web"],"o":["I have one","I need one","Not sure"]},{"n":"wb_when","l":"When do you need it?","t":"select","for":["web"],"o":["As soon as possible","Within 2 weeks","Within a month","1–3 months","Flexible"]},{"n":"ap_plat","l":"Platform","t":"select","for":["apps"],"o":["Android","iPhone (iOS)","Android and iPhone","Web app","Admin dashboard"],"reqFor":["apps"],"err":"Please choose a platform."},{"n":"ap_stage","l":"Where you are","t":"select","for":["apps"],"o":["Just an idea","Idea with designs","Existing app to improve"]},{"n":"ap_feat","l":"Main features","t":"text","for":["apps"],"ph":"e.g. login, payments, booking","opt":true},{"n":"ap_when","l":"When do you need it?","t":"select","for":["apps"],"o":["As soon as possible","Within 2 weeks","Within a month","1–3 months","Flexible"]},{"n":"sm_goal","l":"Main goal","t":"select","for":["social"],"o":["More followers","More sales or leads","Promote an event","Brand awareness","Manage my pages for me"],"reqFor":["social"],"err":"Please choose your main goal."},{"n":"sm_plat","l":"Platforms","t":"select","for":["social"],"o":["Instagram","Facebook","TikTok","X (Twitter)","LinkedIn","WhatsApp","Several platforms"]},{"n":"sm_ads","l":"Monthly ad budget","t":"select","for":["social"],"o":["No ads for now","Under ₦50,000","₦50,000 – ₦200,000","₦200,000 – ₦500,000","Above ₦500,000","Not sure"],"opt":true},{"n":"sm_handle","l":"Page or handle","t":"text","for":["social"],"ph":"@yourpage","opt":true},{"n":"bk_type","l":"Kind of project","t":"select","for":["books"],"o":["Ghostwriting a book","Sermons or talks into a book","Rewriting or editing","Devotional or booklet","Course or training manual","Cover design","Audiobook"],"reqFor":["books"],"err":"Please choose the kind of project."},{"n":"bk_len","l":"Length","t":"select","for":["books"],"o":["Under 50 pages","50–150 pages","Over 150 pages","Not sure"]},{"n":"bk_mat","l":"What you have now","t":"select","for":["books"],"o":["A full draft","Notes or recordings","Just an idea"]},{"n":"bk_when","l":"When do you need it?","t":"select","for":["books"],"o":["Within a month","1–3 months","3–6 months","Flexible"]},{"n":"ac_mode","l":"How you want to learn","t":"select","for":["academy"],"o":["In person in Suleja","Online","Either"],"reqFor":["academy"],"err":"Please choose how you want to learn."},{"n":"ac_level","l":"Your level","t":"select","for":["academy"],"o":["Complete beginner","Some experience"]},{"n":"ac_start","l":"When to start","t":"select","for":["academy"],"o":["Next class","This month","Flexible"]},{"n":"ac_laptop","l":"Do you have a laptop?","t":"select","for":["academy"],"o":["Yes","No"]},{"n":"fr_type","l":"Frame","t":"select","for":["frames"],"o":["Border frame","Borderless frame","Acrylic frame","Not sure"],"reqFor":["frames"],"err":"Please choose a frame."},{"n":"fr_size","l":"Size","t":"select","for":["frames"],"o":["8x10\"","10x12\"","12x16\"","16x20\"","20x24\"","24x30\"","30x34\"","34x40\"","40x50\"","5x7ft","7x9ft","Custom size"]},{"n":"fr_qty","l":"How many","t":"number","for":["frames"],"ph":"1","opt":true},{"n":"fr_photo","l":"The picture","t":"select","for":["frames"],"o":["I will send a photo to print","Already printed","Certificate or document","Not sure"]},{"n":"breed","l":"Breed you want","t":"select","for":["dogs"],"o":["German Shepherd","Boerboel","Rottweiler","Caucasian Shepherd","Lhasa Apso","Labrador Retriever","Siberian Husky","American Bully","Doberman","Golden Retriever","Shih Tzu","Chihuahua","Bullmastiff","Chow Chow","French Bulldog","English Bulldog","Maltese","Pug","Not sure, I need advice","Another breed (say in the notes)"],"ph":"Choose a breed…","reqNeed":["buy","stud"],"err":"Please choose a breed, or pick ‘Not sure’."},{"n":"dg_sex","l":"Male or female","t":"select","for":["dogs"],"o":["Male","Female","Either"],"need":["buy"],"opt":true,"ml":"Sex"},{"n":"dg_dogsex","l":"Your dog is","t":"select","for":["dogs"],"o":["Male","Female"],"need":["stud","papers"],"ml":"My dog is"},{"n":"dg_count","l":"How many dogs","t":"select","for":["dogs"],"o":["1","2","3","4 or more"],"need":["vax","health"]},{"n":"dg_purpose","l":"Main purpose","t":"select","for":["dogs"],"o":["Security","Family companion","Security and family","Breeding"],"need":["consult"]},{"n":"dg_agewant","l":"Age you want","t":"select","for":["dogs"],"o":["8–12 weeks (puppy)","3–6 months","6–12 months","Adult dog","Any age"],"need":["buy"],"ml":"Age wanted"},{"n":"dg_paperswant","l":"Pedigree papers","t":"select","for":["dogs"],"o":["Yes, with COBA papers","Not needed","Not sure"],"need":["buy"]},{"n":"dg_budget","l":"Budget","t":"select","for":["dogs"],"o":["Under ₦300,000","₦300,000 – ₦600,000","₦600,000 – ₦1,000,000","Above ₦1,000,000","Not sure yet"],"need":["buy"],"opt":true,"ph":"Prefer not to say"},{"n":"dg_when","l":"When do you want it","t":"select","for":["dogs"],"o":["As soon as possible","Within a month","In 1–3 months","Just checking prices"],"need":["buy"],"ml":"When"},{"n":"dg_age","l":"Your dog’s age","t":"text","for":["dogs"],"need":["stud","vax","health","papers","care"],"ph":"e.g. 10 weeks or 2 years","ml":"My dog's age"},{"n":"dg_papers","l":"Does it have pedigree papers?","t":"select","for":["dogs"],"o":["Yes","No","Not sure"],"need":["stud","papers"],"ml":"Has pedigree papers"},{"n":"dg_vaxhist","l":"Vaccines so far","t":"select","for":["dogs"],"o":["None yet","Some vaccines","Up to date, needs a booster","Not sure"],"need":["vax","health"]},{"n":"dg_vaccinated","l":"Is your dog vaccinated?","t":"select","for":["dogs"],"o":["Yes, up to date","Not up to date","Not sure"],"need":["stud"],"ml":"Vaccinated"},{"n":"dg_studwant","l":"What you want","t":"select","for":["dogs"],"o":["Use your stud for my female","Offer my male for stud","Advice on breeding"],"need":["stud"],"ml":"Looking for"},{"n":"dg_home","l":"Your home","t":"select","for":["dogs"],"o":["Flat or apartment","House with a compound","Estate","Farm or large land"],"need":["consult"],"ml":"Home"},{"n":"dg_exp","l":"Owned a dog before?","t":"select","for":["dogs"],"o":["Yes","No, first dog"],"need":["consult"]},{"n":"dg_delivery","l":"Delivery or pick-up","t":"select","for":["dogs"],"o":["Deliver to my location","Pick up at an agreed point","Not sure yet"],"need":["buy"],"ml":"Delivery"},{"n":"jn_skill","l":"Your skill","t":"select","for":["join"],"o":["Filmmaking or video","Photography","Graphic design","Video editing","Web or app development","Writing","Social media","Something else"],"reqFor":["join"],"err":"Please choose your skill."},{"n":"jn_link","l":"Portfolio link","t":"text","for":["join"],"ph":"Instagram, Behance, Drive or website","reqFor":["join"],"err":"Please add a link to your work."},{"n":"jn_years","l":"Experience","t":"select","for":["join"],"o":["Under 1 year","1–3 years","3–5 years","Over 5 years"]}],"common":[{"n":"state","l":"Your state","t":"select","for":["graphic","video","photo","weddings","church","web","apps","social","books","academy","frames","dogs","join","other"],"o":["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","Outside Nigeria"],"ph":"Choose your state…","req":true,"err":"Please choose your state."},{"n":"area","l":"Town or area","t":"text","for":["graphic","video","photo","weddings","church","web","apps","social","books","academy","frames","dogs","join","other"],"ph":"e.g. Wuse 2, Lekki, Suleja","opt":true,"ac":"address-level2"},{"n":"name","l":"Your name","t":"text","for":["graphic","video","photo","weddings","church","web","apps","social","books","academy","frames","dogs","join","other"],"req":true,"err":"Please enter your name.","ac":"name"},{"n":"notes","l":"Anything else","t":"textarea","for":["graphic","video","photo","weddings","church","web","apps","social","books","academy","frames","dogs","join","other"],"wide":true,"reqFor":["other"],"err":"Please tell us a little about it."}],"groups":{"Weddings":"weddings","Wedding stationery":"weddings","Web Design":"web","School websites":"web","Real estate websites":"web","Church websites":"web","Online stores":"web","Church Media":"church","Graphic Design":"graphic","Photography":"photo","Video Editing":"video","App Development":"apps","Books & Writing":"books","Social Media & Campaigns":"social"},"pages":{"/graphic-design":"graphic","/video-editing":"video","/photography":"photo","/weddings":"weddings","/church-media":"church","/web-design":"web","/app-development":"apps","/digital-marketing":"social","/book-writing":"books","/academy":"academy","/frames":"frames","/dogs":"dogs","/unity-worship-centre":"church","/from-lead-to-deal":"video","/nursing-emigration-explainer":"video","/christian-book-from-sermons":"books","/graciest-fashion":"web","/christhouse-apostolic-fellowship":"web","/pastor-abraham-praise":"web","/apostolic-ministry-network":"web","/fixnaija-movement":"web","/capital-city-real-estate":"social","/beginner-web-development-course":"other","/mini-importation-class":"other"},"dogNeeds":[["buy","Buy a puppy"],["stud","Stud or breeding"],["vax","Vaccination and deworming"],["health","Health check"],["consult","Breed consultation"],["papers","Pedigree papers (COBA)"],["care","Aftercare and training"]],"dogNeedName":{"buy":"Buy a puppy","stud":"Stud or breeding","vax":"Vaccination and deworming","health":"Health check","consult":"Breed consultation","papers":"Pedigree papers (COBA)","care":"Aftercare and training"},"notesHint":{"graphic":"Text for the design, colours you like, sizes, where it will be used…","video":"What the video is for, music, style you like, where to download the footage…","photo":"Venue, outfit changes, the look you want…","weddings":"Venue, schedule, extras like albums or a livestream…","church":"Services per week, equipment you already have…","web":"What the site is for, sites you like, features you need…","apps":"Who will use the app and what it should do…","social":"Your business, audience and what you have tried…","books":"Topic, audience, and anything already written…","academy":"Questions about the course, dates or payment…","frames":"Colour, glass, delivery, anything special…","dogs":"Colour, temperament, health concern, dates, questions…","join":"A short note about you and the work you do…","other":"What you want to make, who it is for and when you need it…"}};
  var d = document;
  if (!DATA || !window.HTMLDialogElement) return;
  var WA = "2347039934163";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function wa(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  var SVC = {}; DATA.services.forEach(function (s) { SVC[s.id] = s; });

  /* ---------- fields ---------- */
  function fieldHTML(f) {
    var id = "eq-" + f.n, lab = esc(f.l) + (f.opt ? " <span>(optional)</span>" : "");
    var canErr = f.req || f.reqFor || f.reqNeed;
    var req = (f.req ? " required" : "") + (canErr ? ' aria-describedby="' + id + '-err"' : "");
    var err = canErr ? '<p class="form-error" id="' + id + '-err" aria-live="polite"></p>' : "";
    var attrs = ' data-for="' + (f.for || []).join(" ") + '"' + (f.need ? ' data-need="' + f.need.join(" ") + '"' : "");
    var inner;
    if (f.t === "select") {
      inner = '<select id="' + id + '" name="' + f.n + '"' + req + '><option value="">' + esc(f.ph || "Choose one…") + "</option>" +
        f.o.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
    } else if (f.t === "textarea") {
      inner = '<textarea id="' + id + '" name="' + f.n + '" rows="3"' + req + ' placeholder="' + esc(f.ph || "") + '"></textarea>';
    } else {
      inner = '<input id="' + id + '" name="' + f.n + '" type="' + (f.t || "text") + '"' + req + ' placeholder="' + esc(f.ph || "") + '"' +
        (f.t === "date" ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : "") + (f.ac ? ' autocomplete="' + f.ac + '"' : "") + ">";
    }
    return '<div class="form-field' + (f.wide ? " eq-wide" : "") + '"' + attrs + '><label for="' + id + '"' + (f.n === "breed" ? ' id="eq-breed-label"' : "") + ">" + lab + "</label>" + inner + err + "</div>";
  }

  var dlg, form, done, pre, openBtn, copyBtn, direct, ctx = {};
  function build() {
    if (dlg) return;
    var svcOpts = DATA.services.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + "</option>"; }).join("");
    var needChips = DATA.dogNeeds.map(function (n, i) {
      return '<label class="qd-chip"><input type="radio" name="need" value="' + n[0] + '"' + (i ? "" : " checked") + "><span>" + esc(n[1]) + "</span></label>";
    }).join("");
    var html =
      '<form class="contact-form qd-form" id="enqForm" novalidate>' +
      '<div class="qd-head"><div><p class="e-label">Request a quote</p><h2 class="qd-title" id="enq-title">Tell us what you need</h2></div>' +
      '<button class="qd-close" type="button" aria-label="Close the form">×</button></div>' +
      '<p class="eq-intro">A few quick questions, then everything goes to WhatsApp in one message. <a class="eq-direct" data-direct href="' + wa("Hello 100EMPIRE") + '" target="_blank" rel="noopener">Prefer to just chat? Open WhatsApp</a></p>' +
      '<p class="eq-ref" hidden></p>' +
      '<div class="form-row">' +
        '<div class="form-field"><label for="eq-service">What do you need?</label><select id="eq-service" name="service" required aria-describedby="eq-service-err"><option value="">Choose a service…</option>' + svcOpts + '</select><p class="form-error" id="eq-service-err" aria-live="polite"></p></div>' +
        '<div class="form-field" data-pkg><label for="eq-package" id="eq-package-label">Package</label><select id="eq-package" name="package"></select></div>' +
      "</div>" +
      '<fieldset class="qd-need" data-for="dogs"><legend>For your dog</legend><div class="qd-chips">' + needChips + "</div></fieldset>" +
      '<div class="form-row eq-fields">' + DATA.fields.map(fieldHTML).join("") + "</div>" +
      '<div class="form-row">' + DATA.common.map(fieldHTML).join("") + "</div>" +
      '<div class="form-hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="form-actions"><button class="btn btn-primary" type="submit">Send on WhatsApp' +
      '<svg class="e-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5l1.3-4A8.3 8.3 0 1 1 8.6 19z"/><path d="M9 10.5c.3 1.9 2.4 4 4.5 4.4l1.2-1.1 1.8.8-.4 1.6c-3.4.2-7.4-3.6-7.6-7.1l1.6-.4.8 1.8z"/></svg></button></div>' +
      '<p class="form-note">Your answers go into one WhatsApp message to +234 703 993 4163. Nothing is sent until you press send in WhatsApp.</p>' +
      '<div class="form-done" role="status" aria-live="polite" hidden><p class="form-done-h">Your request is ready.</p>' +
      '<p class="form-done-p">WhatsApp has opened with everything filled in. Press send there to deliver it. If nothing opened, use the button below.</p>' +
      '<pre class="form-pre"></pre><div class="e-btns"><a class="btn btn-primary form-open" data-direct href="#" target="_blank" rel="noopener">Open WhatsApp</a>' +
      '<button class="btn btn-ghost form-copy" type="button">Copy message</button></div></div></form>';
    dlg = d.createElement("dialog");
    dlg.className = "qd"; dlg.id = "enquire"; dlg.setAttribute("aria-labelledby", "enq-title");
    dlg.innerHTML = html;
    d.body.appendChild(dlg);
    form = dlg.querySelector("form");
    done = form.querySelector(".form-done"); pre = form.querySelector(".form-pre");
    openBtn = form.querySelector(".form-open"); copyBtn = form.querySelector(".form-copy"); direct = form.querySelector(".eq-direct");
    form.querySelector(".qd-close").addEventListener("click", function () { dlg.close(); });
    form.elements.service.addEventListener("change", function () { fillPackages(); sync(); });
    Array.prototype.forEach.call(form.querySelectorAll('input[name="need"]'), function (r) { r.addEventListener("change", sync); });
    dlg.addEventListener("close", function () {
      d.documentElement.classList.remove("qd-open");
      if (ctx.trigger && ctx.trigger.focus) ctx.trigger.focus({ preventScroll: true });
    });
    form.addEventListener("submit", submit);
    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
      var clear = function () { if (el.getAttribute("aria-invalid")) setErr(el, ""); };
      el.addEventListener("input", clear); el.addEventListener("change", clear);
    });
    copyBtn.addEventListener("click", function () {
      var t = copyBtn.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = t; }, 1600); });
      }
    });
  }

  function svc() { return form.elements.service.value; }
  function need() { var r = form.querySelector('input[name="need"]:checked'); return r ? r.value : "buy"; }

  function fillPackages(selected) {
    var s = SVC[svc()], sel = form.elements["package"], box = form.querySelector("[data-pkg]");
    var pk = (s && DATA.packages[s.id]) || [];
    box.hidden = !pk.length;
    sel.disabled = !pk.length;
    if (!pk.length) { sel.innerHTML = ""; return; }
    form.querySelector("#eq-package-label").innerHTML = esc(s.pkgLabel || "Package") + " <span>(optional)</span>";
    var groups = {}, order = [];
    pk.forEach(function (p) { if (!groups[p.g]) { groups[p.g] = []; order.push(p.g); } groups[p.g].push(p); });
    var html = '<option value="">Not sure yet, please advise</option>';
    order.forEach(function (g) {
      var opts = groups[g].map(function (p) {
        var label = p.n + (p.p ? " (" + p.p + ")" : "");
        return '<option value="' + esc(label + (order.length > 1 ? " · " + g : "")) + '">' + esc(label) + "</option>";
      }).join("");
      html += order.length > 1 ? '<optgroup label="' + esc(g) + '">' + opts + "</optgroup>" : opts;
    });
    html += '<option value="Something not listed">Something not listed</option>';
    sel.innerHTML = html;
    if (selected) {
      var want = selected.toLowerCase();
      for (var i = 0; i < sel.options.length; i++) {
        var v = sel.options[i].value.toLowerCase();
        if (v && (v === want || v.indexOf(want) === 0)) { sel.selectedIndex = i; break; }
      }
    }
  }

  function sync() {
    var s = svc(), n = need();
    Array.prototype.forEach.call(form.querySelectorAll("[data-for]"), function (box) {
      var on = (" " + box.getAttribute("data-for") + " ").indexOf(" " + s + " ") > -1;
      var nd = box.getAttribute("data-need");
      if (on && nd && s === "dogs") on = (" " + nd + " ").indexOf(" " + n + " ") > -1;
      box.hidden = !on;
      Array.prototype.forEach.call(box.querySelectorAll("input:not([type=radio]), select, textarea"), function (f) { f.disabled = !on; });
    });
    var bl = d.getElementById("eq-breed-label");
    if (bl) bl.textContent = (n === "buy" || n === "consult") ? "Breed you want" : "Your dog’s breed";
    var notes = form.elements.notes;
    if (notes) {
      notes.placeholder = DATA.notesHint[s] || "Anything else we should know…";
      var nl = form.querySelector('label[for="eq-notes"]');
      if (nl) nl.innerHTML = (s === "other" || s === "") ? "Tell us about it" : "Anything else <span>(optional)</span>";
    }
  }

  function setErr(el, msg) {
    var err = d.getElementById(el.id + "-err"), wrap = el.closest(".form-field");
    if (wrap) wrap.classList.toggle("has-error", !!msg);
    if (msg) { el.setAttribute("aria-invalid", "true"); if (err) err.textContent = msg; }
    else { el.removeAttribute("aria-invalid"); if (err) err.textContent = ""; }
  }

  function val(name) {
    var f = form.elements[name];
    if (!f || f.disabled) return "";
    return (f.value || "").trim();
  }
  function fmtDate(v) {
    var p = v.split("-"); if (p.length !== 3) return v;
    var dt = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch (e) { return v; }
  }

  function submit(ev) {
    ev.preventDefault();
    if (form.elements.company.value) return; /* spam trap */
    var s = svc(), first = null;
    function check(el, ok, msg) { if (!el) return; setErr(el, ok ? "" : msg); if (!ok && !first) first = el; }
    check(form.elements.service, !!s, "Please choose what you need.");
    DATA.fields.concat(DATA.common).forEach(function (f) {
      var el = form.elements[f.n];
      if (!el || el.disabled) return;
      var must = f.req || (f.reqFor && f.reqFor.indexOf(s) > -1) || (f.reqNeed && s === "dogs" && f.reqNeed.indexOf(need()) > -1);
      if (must) check(el, !!val(f.n), f.err || "Please fill this in.");
      else if (el.getAttribute("aria-invalid")) setErr(el, "");
    });
    if (first) { first.focus(); return; }

    var S = SVC[s];
    var lines = ["Hello 100EMPIRE, " + (s === "join" ? "I'd like to join the network." : "I would like a quote."), ""];
    lines.push("Service: " + S.name + (s === "dogs" ? " · " + DATA.dogNeedName[need()] : ""));
    if (ctx.ref) lines.push("About: " + ctx.ref);
    if (val("package")) lines.push((S.pkgLabel || "Package") + ": " + val("package"));
    DATA.fields.forEach(function (f) {
      var v = val(f.n); if (!v) return;
      var label = f.n === "breed" ? (need() === "buy" || need() === "consult" ? "Breed" : "My dog's breed") : (f.ml || f.l);
      lines.push(label + ": " + (f.t === "date" ? fmtDate(v) : v));
    });
    lines.push("Location: " + val("state") + (val("area") ? ", " + val("area") : ""));
    lines.push("Name: " + val("name"));
    if (val("notes")) lines.push("", val("notes"));
    lines.push("", "(Sent from 100empire.com" + (location.pathname === "/" ? "" : location.pathname.replace(/\.html$/, "")) + ")");
    var msg = lines.join("\n"), url = wa(msg);
    pre.textContent = msg; openBtn.href = url; done.hidden = false;
    window.open(url, "_blank", "noopener");
    done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }

  /* ---------- reading what a link was for ---------- */
  function pageService(path) {
    path = (path || location.pathname).replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    return DATA.pages[path] || "";
  }
  function fromLink(a) {
    var o = { service: a.getAttribute("data-enq") || "", pkg: a.getAttribute("data-pkg") || "" };
    var q = a.getAttribute("data-quote"); if (q) { o.service = "dogs"; o.need = q; }
    var br = a.getAttribute("data-breed"); if (br) o.breed = br;
    var href = a.getAttribute("href") || "", m = href.match(/[?&]text=([^&]*)/), t = "";
    try { t = m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : ""; } catch (e) { t = ""; }
    var r;
    if ((r = t.match(/interested in the (.+?) package \((.+?)\) under (.+?)\./))) {
      o.service = o.service || DATA.groups[r[3]] || ""; o.pkg = r[1] + " (" + r[2] + ")";
    } else if ((r = t.match(/enrol in the (.+?) course/))) { o.service = "academy"; o.pkg = r[1]; }
    else if (/enrol in a course/.test(t)) { o.service = "academy"; }
    else if ((r = t.match(/samples of the (.+?) project/))) { o.ref = "Samples of the " + r[1] + " project"; }
    else if ((r = t.match(/saw the (.+?) project and I would like something similar/))) { o.ref = "Something like the " + r[1] + " project"; }
    else if ((r = t.match(/samples of your work in/))) { o.ref = "Samples of your work"; }
    else if ((r = t.match(/order (\d+) x (.+?) \((.+?)\)\. Estimate: (.+?)\./))) {
      o.service = "frames"; o.set = { fr_type: r[2], fr_size: r[3], fr_qty: r[1] }; o.ref = "Frame estimate " + r[4];
    } else if ((r = t.match(/pure-bred (.+?) puppy\./))) { o.service = "dogs"; o.need = o.need || "buy"; o.breed = o.breed || r[1]; }
    else if (/join the network/.test(t)) { o.service = "join"; }
    else if (/confirm what to pay/.test(t)) { o.ref = "Confirming what to pay before paying online"; }
    else if (/bundle quote/.test(t)) { o.ref = "A bundle of several services"; o.service = o.service || "other"; }
    if (!o.service) o.service = pageService();
    o.chat = href;
    return o;
  }

  function open(o) {
    o = o || {};
    build();
    ctx = { trigger: o.trigger || null, ref: o.ref || "" };
    done.hidden = true;
    var s = SVC[o.service] ? o.service : (o.page ? pageService(o.page) : "");
    form.elements.service.value = s;
    var nr = form.querySelector('input[name="need"][value="' + (o.need || "buy") + '"]');
    if (nr) nr.checked = true;
    fillPackages(o.pkg);
    if (o.breed && form.elements.breed) form.elements.breed.value = o.breed;
    if (o.set) Object.keys(o.set).forEach(function (k) {
      var el = form.elements[k]; if (!el) return;
      if (el.tagName === "SELECT") { for (var i = 0; i < el.options.length; i++) if (el.options[i].text === o.set[k]) { el.selectedIndex = i; break; } }
      else el.value = o.set[k];
    });
    if (o.notes && form.elements.notes) form.elements.notes.value = o.notes;
    var ref = form.querySelector(".eq-ref");
    ref.hidden = !ctx.ref; ref.textContent = ctx.ref ? "About: " + ctx.ref : "";
    direct.href = o.chat && /wa\.me/.test(o.chat) ? o.chat : wa("Hello 100EMPIRE");
    sync();
    dlg.showModal();
    d.documentElement.classList.add("qd-open");
    form.scrollTop = 0; dlg.scrollTop = 0;
    var focusEl = !s ? form.elements.service : (o.pkg || o.breed || o.set ? form.elements.state : (form.elements["package"].disabled ? form.elements.state : form.elements["package"]));
    if (focusEl) focusEl.focus({ preventScroll: true });
  }

  d.addEventListener("click", function (ev) {
    if (ev.defaultPrevented || ev.button > 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest && ev.target.closest('a[href*="wa.me/' + WA + '"], [data-quote], [data-enq]');
    if (!a || a.hasAttribute("data-direct") || (dlg && dlg.contains(a))) return;
    ev.preventDefault();
    var o = fromLink(a); o.trigger = a;
    open(o);
  }, true);

  window.ENQ = { open: open, pageService: pageService };
})();
