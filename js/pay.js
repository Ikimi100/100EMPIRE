/* ==========================================================================
   100EMPIRE — pay.js (Pay online page)
   1. Asks for the details each service needs (church name and address,
      wedding venue, shoot date and so on) before payment.
   2. Opens Flutterwave's secure checkout, with the key details attached.
   3. Asks our own /api/verify function to confirm the payment with
      Flutterwave, then shows a full receipt the customer can send on
      WhatsApp, by email, save as PDF or share.
   The secret key never reaches the browser.
   ========================================================================== */
(function () {
  "use strict";
  var d = document;
  var form = d.querySelector("[data-pay]");
  if (!form) return;

  var WA = "2347039934163", EMAIL = "hello@100empire.com";
  var $ = function (s) { return form.querySelector(s); };
  var field = function (n) { return form.elements.namedItem(n); };
  var totalEl = $("[data-pay-total]"), btn = $("[data-pay-btn]"), setup = $("[data-pay-setup]"), result = $(".pay-result");
  var detailsEl = $("[data-pay-details]");
  var publicKey = form.getAttribute("data-public-key") || "";
  var flwLoading = null, lastService = null;

  /* ---------- what each service needs ---------- */
  var STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi",
    "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara", "Outside Nigeria"];
  var OUTSIDE = "My church is outside Abuja and Suleja", SULEJA = "Suleja (Niger State, next to Abuja)";
  var COUNCILS = ["Abuja Municipal (AMAC)", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji", SULEJA, OUTSIDE];
  var DELIVER = "Deliver to my address";

  function F(n, l, t, o, x) { var f = { n: n, l: l, t: t || "text" }; if (o) f.o = o; for (var k in x) f[k] = x[k]; return f; }
  var R = { req: true };
  var SERVICES = {
    graphic: { name: "Graphic design", title: "About the design", loc: "contact", addr: "Business address", fields: [
      F("d_brand", "Business or brand name", "text", null, R),
      F("d_design", "What should we design?", "text", null, { req: true, ph: "e.g. Sunday flyer, logo, 5 Instagram posts" }),
      F("d_colours", "Brand colours", "text", null, { ph: "e.g. navy and gold, or use my logo colours" }),
      F("d_deadline", "When you need it", "date")] },
    video: { name: "Video editing", title: "About the video", loc: "contact", addr: "Business address", fields: [
      F("d_vtype", "Kind of video", "select", ["Reels or short videos", "YouTube video", "Sermon or church service", "Event highlight", "Promo or advert",
        "Music video", "Documentary or interview", "Something else"], R),
      F("d_brand", "Brand or channel name"),
      F("d_footage", "How much raw footage?", "text", null, { req: true, ph: "e.g. 2 hours, or 15 phone clips" }),
      F("d_send", "Footage sent by", "select", ["Google Drive or Dropbox link", "WeTransfer link", "WhatsApp",
        "Flash drive or hard drive at the studio"], R),
      F("d_deadline", "Deadline", "date")] },
    photo: { name: "Photography", title: "About the shoot", loc: "onsite", addr: "Venue address", fields: [
      F("d_shoot", "Kind of shoot", "select", ["Portrait or personal", "Event or party", "Church programme", "Corporate or headshots",
        "Product", "Birthday", "Something else"], R),
      F("d_event", "Event or brand name"),
      F("d_date", "Shoot date", "date", null, R),
      F("d_time", "Start time", "time", null, R),
      F("d_venue", "Venue name", "text", null, { req: true, ph: "e.g. the hall, hotel or church" }),
      F("d_people", "How many people or products", "text", null, { ph: "e.g. 2 people, or 30 products" })] },
    weddings: { name: "Weddings", title: "About the wedding", loc: "onsite", addr: "Venue address", fields: [
      F("d_couple", "Couple’s names", "text", null, { req: true, ph: "e.g. Ada & Tunde" }),
      F("d_wtype", "Kind of wedding", "select", ["White wedding", "Traditional wedding", "Traditional and white wedding", "Court wedding",
        "Engagement or pre-wedding shoot", "Something else"], R),
      F("d_date", "Wedding date", "date", null, R),
      F("d_time", "Start time", "time"),
      F("d_venue", "Ceremony venue name", "text", null, { req: true, ph: "e.g. the church or hall" }),
      F("d_guests", "Guests", "select", ["Under 100", "100–300", "300–600", "Over 600"]),
      F("d_reception", "Reception venue and address, if different", "text", null, { wide: true }),
      F("d_planner", "Planner or coordinator on the day (name and phone)", "text", null, { wide: true })] },
    stationery: { name: "Wedding stationery", title: "About the wedding", loc: "contact", addr: "Delivery address for printed items", fields: [
      F("d_couple", "Couple’s names", "text", null, { req: true, ph: "e.g. Ada & Tunde" }),
      F("d_date", "Wedding date", "date", null, R),
      F("d_theme", "Colours or theme", "text", null, { ph: "e.g. emerald and gold" }),
      F("d_print", "Printing", "select", ["Digital files only", "Digital and printed copies"], R),
      F("d_copies", "Printed copies (if printing)", "text", null, { ph: "e.g. 200 invitations" })] },
    church: { name: "Church media", title: "About your church", loc: "abuja", addr: "Church address", fields: [
      F("d_church", "Church or ministry name", "text", null, R),
      F("d_pastor", "Lead pastor’s name", "text", null, R),
      F("d_role", "Your role in the church", "select", ["Lead or senior pastor", "Assistant pastor", "Media head or director",
        "Church administrator", "Church member or volunteer", "Other"], R),
      F("d_size", "Sunday attendance", "select", ["Under 100", "100–300", "300–1,000", "1,000–5,000", "Over 5,000"], R),
      F("d_services", "Service days and times", "text", null, { req: true, ph: "e.g. Sun 7am and 9am, Wed 6pm" }),
      F("d_start", "Preferred start date", "date", null, R),
      F("d_team", "Media volunteers", "select", ["None yet", "1–3 people", "4–10 people", "More than 10"]),
      F("d_social", "Social media pages", "text", null, { ph: "Facebook, Instagram, YouTube or TikTok names" }),
      F("d_equip", "Media equipment you already have", "textarea", null, { wide: true, ph: "Cameras, laptop, projector, mixer, livestream gear…" })] },
    frames: { name: "Frames and prints", title: "Pick-up or delivery", loc: "delivery", addr: "Delivery address", fields: [
      F("d_get", "Pick-up or delivery", "select", ["Pick up at the studio (Utako, Abuja)", DELIVER], R),
      F("d_picture", "Picture sent by", "select", ["WhatsApp", "Email", "Bring it to the studio"], R),
      F("d_needby", "Date you need it", "date"),
      F("d_wording", "Name or wording on the frame", "text", null, { wide: true })] },
    web: { name: "Web design", title: "About the website", loc: "contact", addr: "Business address", fields: [
      F("d_brand", "Business, church or school name", "text", null, { req: true, wide: true }),
      F("d_wtype", "Kind of website", "select", ["Business website", "Church or ministry", "School", "Real estate", "Online store",
        "Landing page", "Portfolio", "Something else"], R),
      F("d_domain", "Domain name", "text", null, { ph: "e.g. mybusiness.com, or need one" })] },
    apps: { name: "App development", title: "About the app", loc: "contact", addr: "Business address", fields: [
      F("d_brand", "Business name", "text", null, R),
      F("d_app", "App name or idea", "text", null, R),
      F("d_platform", "Platform", "select", ["Android", "iPhone (iOS)", "Android and iPhone", "Web app"])] },
    social: { name: "Social media and ads", title: "About your pages", loc: "contact", addr: "Business address", fields: [
      F("d_brand", "Business or page name", "text", null, R),
      F("d_handles", "Page names or links", "text", null, { req: true, ph: "Instagram, Facebook, TikTok…" }),
      F("d_budget", "Monthly ad budget", "text", null, { ph: "e.g. ₦50,000, if running ads" })] },
    books: { name: "Books and writing", title: "About the book", loc: "contact", addr: "Address", fields: [
      F("d_title", "Book title (working title)", "text", null, R),
      F("d_author", "Author’s name as it will appear", "text", null, { req: true, wide: true }),
      F("d_btype", "Kind of work", "select", ["Ghostwriting", "Sermons into a book", "Editing or rewriting", "Cover design", "Publishing support"])] },
    academy: { name: "Academy (training)", title: "About the class", loc: "contact", addr: "Address", fields: [
      F("d_course", "Course or class", "text", null, R),
      F("d_student", "Student’s name", "text", null, { ph: "If not you" }),
      F("d_mode", "How you will attend", "select", ["In person", "Online"], R)] },
    dogs: { name: "Dogs and puppies", title: "About the dog", loc: "delivery", addr: "Delivery address", fields: [
      F("d_dneed", "What the payment is for", "select", ["Puppy", "Stud or breeding", "Vaccination or deworming", "Health check",
        "Consultation", "Pedigree papers", "Aftercare or training"], R),
      F("d_breed", "Breed", "text", null, R),
      F("d_get", "Delivery or pick-up", "select", [DELIVER, "Hand-over at a pick-up point (say where below)"], R)] },
    other: { name: "Something else", title: "About the job", loc: "contact", addr: "Address", fields: [] }
  };
  var GROUPS = { "Graphic Design": "graphic", "Video Editing": "video", "Photography": "photo", "Weddings": "weddings",
    "Wedding stationery": "stationery", "Church Media": "church", "Frames & Prints": "frames" };
  var ORDER = ["church", "weddings", "photo", "video", "graphic", "web", "apps", "social", "books", "academy", "frames", "stationery", "dogs", "other"];

  /* ---------- helpers ---------- */
  function naira(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function waLink(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function mode() { var r = form.querySelector('input[name="mode"]:checked'); return r ? r.value : "package"; }
  function selected() { var s = field("item"); return s.selectedIndex > 0 ? s.options[s.selectedIndex] : null; }
  function amountOf(v) { var n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function qty() { var o = selected(); if (!o || !o.hasAttribute("data-qty")) return 1; var q = parseInt(field("qty").value, 10); return Math.min(500, Math.max(1, isNaN(q) ? 1 : q)); }
  function val(n) { var f = field(n); return f && !f.disabled ? String(f.value || "").trim() : ""; }
  function fmtDate(v) {
    var p = v.split("-"); if (p.length !== 3) return v;
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch (e) { return v; }
  }
  function fmtTime(v) {
    var p = v.split(":"); if (p.length < 2) return v;
    var h = +p[0], m = p[1]; return (h % 12 || 12) + ":" + m + (h < 12 ? " am" : " pm");
  }
  function fmt(f, v) { return f.t === "date" ? fmtDate(v) : f.t === "time" ? fmtTime(v) : v; }

  function service() {
    if (mode() === "quote") return val("service");
    var o = selected();
    return o && o.parentNode && GROUPS[o.parentNode.label] || (o ? "other" : "");
  }
  function total() {
    if (mode() === "package") { var o = selected(); return o ? Number(o.getAttribute("data-amount")) * qty() : 0; }
    return amountOf(field("amount").value);
  }
  function describe() {
    if (mode() === "package") { var o = selected(); if (!o) return ""; var q = qty(); return (q > 1 ? q + " x " : "") + o.getAttribute("data-label"); }
    var s = SERVICES[val("service")];
    return (s ? s.name + ": " : "") + field("for").value.trim();
  }

  /* ---------- details section ---------- */
  function locFields(cfg) {
    if (cfg.loc === "abuja") return [
      F("d_council", "Area council (Abuja) or Suleja", "select", COUNCILS, { req: true, ph: "Choose one…" }),
      F("d_town", "District or area", "text", null, { req: true, ph: "e.g. Utako, Gwarinpa, Kubwa, Kwata" }),
      F("d_address", cfg.addr, "text", null, { req: true, wide: true, ph: "Street, building and nearest landmark", ac: "street-address" })];
    return [
      F("d_state", "State", "select", STATES, { req: true, ph: "Choose your state…" }),
      F("d_town", "Town or area", "text", null, { req: true, ph: "e.g. Wuse 2, Suleja, Ikeja", ac: "address-level2" }),
      F("d_address", cfg.addr, "text", null, { wide: true, ph: "Street, building and nearest landmark", ac: "street-address",
        req: cfg.loc === "onsite", reqIf: cfg.loc === "delivery" ? DELIVER : "" })];
  }
  function allFields(s) { var c = SERVICES[s]; return c ? c.fields.concat(locFields(c)) : []; }

  function fieldHTML(f) {
    var id = "payForm-" + f.n;
    var opt = !f.req && !f.reqIf ? " <span>(optional)</span>" : "";
    var desc = ' aria-describedby="' + id + '-err"';
    var inner;
    if (f.t === "select") {
      inner = '<select id="' + id + '" name="' + f.n + '"' + desc + '><option value="">' + esc(f.ph || "Choose one…") + "</option>" +
        f.o.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
    } else if (f.t === "textarea") {
      inner = '<textarea id="' + id + '" name="' + f.n + '" rows="3"' + desc + ' placeholder="' + esc(f.ph || "") + '"></textarea>';
    } else {
      inner = '<input id="' + id + '" name="' + f.n + '" type="' + f.t + '"' + desc + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : "") +
        (f.ac ? ' autocomplete="' + f.ac + '"' : "") + (f.t === "date" ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : "") + ">";
    }
    return '<div class="form-field' + (f.wide || f.t === "textarea" ? " pay-wide" : "") + '" data-f="' + f.n + '"><label for="' + id + '">' +
      esc(f.l) + opt + "</label>" + inner + '<p class="form-error" id="' + id + '-err" aria-live="polite"></p></div>';
  }

  function renderDetails() {
    var s = service();
    if (s === lastService) return;
    var keep = {};
    Array.prototype.forEach.call(detailsEl.querySelectorAll("input, select, textarea"), function (el) { if (el.value) keep[el.name] = el.value; });
    lastService = s;
    var cfg = SERVICES[s];
    if (!cfg) { detailsEl.innerHTML = ""; return; }
    var h = '<p class="pay-sec-h">' + esc(cfg.title) + "</p>";
    if (cfg.loc === "abuja") {
      h += '<p class="pay-note"><b>Church Media is available in Abuja (FCT) and Suleja only for now.</b> Other locations are coming soon.</p>';
    }
    h += '<div class="pay-grid">' + cfg.fields.map(fieldHTML).join("") + "</div>";
    h += '<p class="pay-sec-h">' + (cfg.loc === "abuja" ? "Church location" : cfg.loc === "onsite" ? "Venue location" :
      cfg.loc === "delivery" ? "Your location" : "Your location") + "</p>";
    h += '<div class="pay-grid">' + locFields(cfg).map(fieldHTML).join("") + "</div>";
    h += '<p class="pay-note pay-note--warn" data-pay-outside hidden>Church Media is only available in Abuja (FCT) and Suleja for now, so this plan can’t be paid for yet. ' +
      '<a class="text-link" data-pay-waitlist data-direct href="#" target="_blank" rel="noopener">Join the waitlist on WhatsApp</a> and we will tell you when we reach your area.</p>';
    detailsEl.innerHTML = h;
    Object.keys(keep).forEach(function (n) { var el = field(n); if (el && el.closest("[data-pay-details]")) el.value = keep[n]; });
  }

  function syncDetails() {
    var cfg = SERVICES[service()] || {};
    var outside = cfg.loc === "abuja" && val("d_council") === OUTSIDE;
    var box = $("[data-pay-outside]");
    if (box) {
      box.hidden = !outside;
      var wl = $("[data-pay-waitlist]");
      if (wl) wl.href = waLink("Hello 100EMPIRE, my church" + (val("d_church") ? " (" + val("d_church") + ")" : "") + " is outside Abuja and Suleja" +
        (val("d_town") ? ", in " + val("d_town") : "") + ". Please add us to the Church Media waitlist and let me know when you reach our area.");
    }
    form.classList.toggle("is-blocked", outside);
    var addr = field("d_address"), lab = addr && form.querySelector('label[for="payForm-d_address"]');
    if (lab && cfg.loc === "delivery") lab.innerHTML = esc(cfg.addr) + (val("d_get") === DELIVER ? "" : " <span>(optional)</span>");
  }

  function render() {
    var m = mode();
    form.classList.toggle("is-quote", m === "quote");
    var o = selected();
    form.classList.toggle("has-qty", m === "package" && !!o && o.hasAttribute("data-qty"));
    renderDetails();
    syncDetails();
    var t = total();
    totalEl.textContent = naira(t);
    btn.innerHTML = btn.innerHTML.replace(/^[^<]*/, t ? "Pay " + naira(t) + " securely" : "Pay securely");
  }

  /* ---------- checks ---------- */
  function setError(name, msg) {
    var el = field(name), box = d.getElementById("payForm-" + name + "-err");
    if (box) box.textContent = msg || "";
    if (el && el.setAttribute) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    return !msg;
  }
  function validate() {
    var bad = [];
    if (mode() === "package") {
      if (!setError("item", selected() ? "" : "Choose the package you are paying for.")) bad.push("item");
      setError("amount", ""); setError("for", ""); setError("service", "");
    } else {
      if (!setError("service", val("service") ? "" : "Choose the service you are paying for.")) bad.push("service");
      var a = amountOf(field("amount").value);
      if (!setError("amount", a >= 1000 ? (a > 20000000 ? "For amounts above ₦20,000,000, ask for bank details on WhatsApp." : "") : "Enter the amount on your quote (at least ₦1,000).")) bad.push("amount");
      if (!setError("for", field("for").value.trim().length >= 3 ? "" : "Say what the payment is for, for example the quote or deposit.")) bad.push("for");
      setError("item", "");
    }
    if (!setError("name", field("name").value.trim().length >= 2 ? "" : "Enter your full name.")) bad.push("name");
    var ph = field("phone").value.replace(/\D/g, "");
    if (!setError("phone", ph.length >= 10 && ph.length <= 15 ? "" : "Enter your WhatsApp number.")) bad.push("phone");
    if (!setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field("email").value.trim()) ? "" : "Enter an email address for the receipt.")) bad.push("email");
    var s = service();
    allFields(s).forEach(function (f) {
      var need = f.req || (f.reqIf && val("d_get") === f.reqIf);
      var v = val(f.n), msg = "";
      if (need && !v) msg = f.t === "select" ? "Please choose one." : f.n === "d_address" ? "Enter the full address with a landmark." : "Please fill this in.";
      if (f.n === "d_council" && v === OUTSIDE) msg = "Church Media is available in Abuja (FCT) and Suleja only for now.";
      if (f.t === "date" && v && v < new Date().toISOString().slice(0, 10)) msg = "Choose a date from today on.";
      if (!setError(f.n, msg)) bad.push(f.n);
    });
    return bad;
  }

  /* ---------- the receipt ---------- */
  function collect() {
    var s = service(), cfg = SERVICES[s];
    var contact = [["Name", field("name").value.trim()], ["WhatsApp", field("phone").value.trim()]];
    if (field("phone2").value.trim()) contact.push(["Other phone", field("phone2").value.trim()]);
    contact.push(["Email", field("email").value.trim()]);
    var rows = [];
    if (cfg) {
      cfg.fields.forEach(function (f) { var v = val(f.n); if (v) rows.push([f.l, fmt(f, v)]); });
      var place = cfg.loc === "abuja" ? [val("d_address"), val("d_town"), val("d_council") === SULEJA ? "Suleja, Niger State" : val("d_council") + ", Abuja (FCT)"] : [val("d_address"), val("d_town"), val("d_state")];
      place = place.filter(Boolean).join(", ");
      if (place) rows.push([cfg.loc === "abuja" ? "Church address" : cfg.loc === "onsite" ? "Venue address" : "Address", place]);
    }
    if (val("notes")) rows.push(["Notes", val("notes")]);
    return { service: s, title: cfg ? cfg.title : "Details", contact: contact, rows: rows };
  }

  function receiptText(ctx, status, nl) {
    nl = nl || "\n";
    var L = ["100EMPIRE PAYMENT RECEIPT", "Status: " + status, "Reference: " + ctx.ref];
    if (ctx.flwRef) L.push("Flutterwave ref: " + ctx.flwRef);
    L.push("Date: " + ctx.when, "Amount: " + naira(ctx.paid || ctx.amount), "Paid for: " + ctx.desc, "", "CUSTOMER");
    ctx.info.contact.forEach(function (r) { L.push(r[0] + ": " + r[1]); });
    if (ctx.info.rows.length) { L.push("", ctx.info.title.toUpperCase()); ctx.info.rows.forEach(function (r) { L.push(r[0] + ": " + r[1]); }); }
    return L.join(nl);
  }

  function dl(rows) {
    return '<dl class="pay-receipt">' + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
  }

  function receiptHTML(ctx, status) {
    var top = [["Status", status], ["Reference", ctx.ref]];
    if (ctx.flwRef) top.push(["Flutterwave ref", ctx.flwRef]);
    top.push(["Date", ctx.when], ["Amount", naira(ctx.paid || ctx.amount)], ["Paid for", ctx.desc]);
    var h = '<p class="pay-rc-h">Payment</p>' + dl(top) + '<p class="pay-rc-h">Customer</p>' + dl(ctx.info.contact);
    if (ctx.info.rows.length) h += '<p class="pay-rc-h">' + esc(ctx.info.title) + "</p>" + dl(ctx.info.rows);
    return h;
  }

  function showResult(html, good) {
    result.innerHTML = html;
    result.hidden = false;
    result.classList.toggle("is-bad", !good);
    result.focus();
    try { result.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* old browsers */ }
  }

  var ICON_WA = '<svg class="e-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5l1.3-4A8.3 8.3 0 1 1 8.6 19z"/><path d="M9 10.5c.3 1.9 2.4 4 4.5 4.4l1.2-1.1 1.8.8-.4 1.6c-3.4.2-7.4-3.6-7.6-7.1l1.6-.4.8 1.8z"/></svg>';
  var ICON_MAIL = '<svg class="e-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>';

  function receipt(info, ctx, status) {
    var text = receiptText(ctx, status);
    var waMsg = "Hello 100EMPIRE, here is my payment receipt.\n\n" + text;
    var mail = "mailto:" + EMAIL + "?cc=" + encodeURIComponent(ctx.email) +
      "&subject=" + encodeURIComponent("Payment receipt " + ctx.ref + " · " + naira(ctx.paid || ctx.amount)) +
      "&body=" + encodeURIComponent("Hello 100EMPIRE,\r\n\r\nHere is my payment receipt.\r\n\r\n" + receiptText(ctx, status, "\r\n"));
    ctx.lastStatus = status;
    return '<p class="form-done-h">' + info.title + "</p><p>" + info.text + "</p>" +
      '<div class="pay-rc">' + receiptHTML(ctx, status) + "</div>" +
      '<p class="pay-sec-h">Send your receipt</p>' +
      '<p class="pay-rc-tip">Send it to us so work can start, and keep a copy. Email opens your mail app with the receipt ready, addressed to us with a copy to you.</p>' +
      '<div class="pay-rc-btns">' +
      '<a class="btn btn-primary" data-direct href="' + esc(waLink(waMsg)) + '" target="_blank" rel="noopener">Send on WhatsApp' + ICON_WA + "</a>" +
      '<a class="btn btn-ghost" href="' + esc(mail) + '">Send by email' + ICON_MAIL + "</a>" +
      '<button class="btn btn-ghost" type="button" data-rc-pdf>Save as PDF</button>' +
      '<button class="btn btn-ghost" type="button" data-rc-share>' + (navigator.share ? "Share" : "Copy receipt") + "</button>" +
      "</div>";
  }

  var current = null;
  result.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-rc-pdf], [data-rc-share]") : null;
    if (!t || !current) return;
    var text = receiptText(current, current.lastStatus);
    if (t.hasAttribute("data-rc-pdf")) { printReceipt(current); return; }
    if (navigator.share) { navigator.share({ title: "100EMPIRE payment receipt " + current.ref, text: text }).catch(function () {}); return; }
    var done = function (m) { t.textContent = m; setTimeout(function () { t.textContent = "Copy receipt"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done("Could not copy"); });
    else done("Could not copy");
  });

  function printReceipt(ctx) {
    var old = d.getElementById("printReceipt");
    if (old) old.parentNode.removeChild(old);
    var box = d.createElement("div");
    box.id = "printReceipt";
    box.innerHTML = '<div class="pr-head"><b>100EMPIRE</b><span>Payment receipt</span></div>' + receiptHTML(ctx, ctx.lastStatus) +
      '<p class="pr-foot">100EMPIRE · Utako, Abuja · +234 703 993 4163 · ' + EMAIL + " · www.100empire.com<br>" +
      "Paid online through Flutterwave. Flutterwave also emails its own receipt to " + esc(ctx.email) + ".</p>";
    d.body.appendChild(box);
    d.documentElement.classList.add("print-receipt");
    var title = d.title;
    d.title = "100EMPIRE receipt " + ctx.ref;
    var after = function () { d.documentElement.classList.remove("print-receipt"); d.title = title; window.removeEventListener("afterprint", after); };
    window.addEventListener("afterprint", after);
    setTimeout(function () { window.print(); }, 50);
  }

  /* ---------- payment ---------- */
  function verify(resp, ctx) {
    var q = "transaction_id=" + encodeURIComponent(resp.transaction_id) + "&tx_ref=" + encodeURIComponent(ctx.ref) +
      (ctx.item ? "&item=" + encodeURIComponent(ctx.item) + "&qty=" + ctx.qty : "&amount=" + ctx.amount);
    var first = esc(ctx.name.split(" ")[0]);
    showResult('<p class="form-done-h">Checking your payment…</p><p>Confirming with Flutterwave. Please keep this page open.</p>', true);
    fetch("/api/verify?" + q, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
      .then(function (r) {
        if (r.body && r.body.flw_ref) ctx.flwRef = r.body.flw_ref;
        if (r.body && r.body.ok) {
          ctx.paid = r.body.amount || ctx.amount;
          showResult(receipt({ title: "Payment confirmed", text: "Thank you, " + first + ". Flutterwave has confirmed this payment and will also email you its receipt. Send this receipt to us below so we can start." }, ctx, "Paid, confirmed by Flutterwave"), true);
          form.classList.add("is-paid");
        } else if (r.status === 503) {
          showResult(receipt({ title: "Payment sent", text: "Flutterwave reported this payment as " + esc(resp.status || "complete") + ". We will confirm it from our Flutterwave account. Send this receipt to us below so we can match it to your job." }, ctx, "Sent, waiting for our confirmation"), true);
          form.classList.add("is-paid");
        } else {
          showResult(receipt({ title: "Payment not confirmed yet", text: "Flutterwave has not confirmed this payment. If money left your account, send this receipt to us on WhatsApp and we will check it straight away." }, ctx, "Not confirmed yet"), false);
        }
      })
      .catch(function () {
        showResult(receipt({ title: "Could not check the payment", text: "The connection dropped while checking. If your payment went through, Flutterwave will email a receipt. Send this receipt to us on WhatsApp and we will check it." }, ctx, "Not checked (connection dropped)"), false);
      });
  }

  function meta(ctx) {
    var m = { item: ctx.item || "quote", qty: String(ctx.qty), service: ctx.info.service || "" };
    ctx.info.rows.slice(0, 14).forEach(function (r) {
      m[r[0].toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40)] = String(r[1]).slice(0, 150);
    });
    if (ctx.phone2) m.other_phone = ctx.phone2;
    return m;
  }

  function pay(ctx) {
    btn.disabled = true;
    loadFlutterwave().then(function () {
      var modal = window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: ctx.ref,
        amount: ctx.amount,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: { email: ctx.email, phone_number: ctx.phone, name: ctx.name },
        customizations: { title: "100EMPIRE", description: ctx.desc.slice(0, 100), logo: "https://www.100empire.com/assets/logo-512.png" },
        meta: meta(ctx),
        callback: function (resp) {
          ctx.done = true;
          try { modal.close(); } catch (e) { /* already closed */ }
          verify(resp, ctx);
        },
        onclose: function (incomplete) {
          btn.disabled = false;
          if (incomplete && !ctx.done) showResult('<p class="form-done-h">Payment not completed</p><p>The checkout was closed before payment finished. Nothing was charged. You can try again.</p>', false);
        }
      });
    }).catch(function () {
      btn.disabled = false;
      showResult('<p class="form-done-h">Checkout did not load</p><p>Flutterwave’s checkout could not be reached. Check your connection and try again, or ask for payment details on WhatsApp.</p>', false);
    });
  }

  function loadFlutterwave() {
    if (window.FlutterwaveCheckout) return Promise.resolve();
    if (flwLoading) return flwLoading;
    flwLoading = new Promise(function (resolve, reject) {
      var s = d.createElement("script");
      s.src = "https://checkout.flutterwave.com/v3.js";
      s.onload = function () { resolve(); };
      s.onerror = function () { flwLoading = null; reject(new Error("load")); };
      d.head.appendChild(s);
    });
    return flwLoading;
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad.length) { var f = field(bad[0]); if (f && f.focus) f.focus(); return; }
    if (!publicKey) { setup.hidden = false; setup.focus && setup.focus(); return; }
    var o = selected();
    var now = new Date();
    current = {
      ref: "100E-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      amount: total(), desc: describe(), item: mode() === "package" && o ? o.value : "", qty: qty(),
      name: field("name").value.trim(), email: field("email").value.trim(), phone: field("phone").value.trim(), phone2: field("phone2").value.trim(),
      when: now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ", " +
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      info: collect()
    };
    pay(current);
  });

  /* Links like /pay?item=church-media--premium or /pay?amount=50000&for=Logo%20deposit&service=graphic */
  var svcSel = field("service");
  if (svcSel && svcSel.options.length < 2) {
    ORDER.forEach(function (k) { var op = d.createElement("option"); op.value = k; op.textContent = SERVICES[k].name; svcSel.appendChild(op); });
  }
  try {
    var p = new URLSearchParams(location.search);
    if (p.get("item")) {
      var sel = field("item");
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === p.get("item")) sel.selectedIndex = i;
      if (p.get("qty")) field("qty").value = p.get("qty");
    } else if (p.get("amount") || p.get("service")) {
      form.querySelector('input[value="quote"]').checked = true;
      if (p.get("amount")) field("amount").value = amountOf(p.get("amount")).toLocaleString("en-NG");
      if (p.get("for")) field("for").value = p.get("for").slice(0, 120);
      if (p.get("service") && SERVICES[p.get("service")]) svcSel.value = p.get("service");
    }
  } catch (e) { /* old browsers: no preselect */ }
  render();

  /* The public key comes from the page, or from Vercel's settings through /api/config */
  function ready(ok) { form.classList.toggle("is-setup", !ok); setup.hidden = ok; }
  if (publicKey) ready(true);
  else if (location.protocol.indexOf("http") === 0) {
    fetch("/api/config", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { if (j && j.publicKey) { publicKey = j.publicKey; ready(true); } else ready(false); })
      .catch(function () { ready(false); });
  } else ready(false);
})();
