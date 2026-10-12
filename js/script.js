/* ==========================================================================
   100EMPIRE — script.js
   Menu, header, reveals, the living hero collage, the idea box, colour-on-scroll
   for phones, work filters, the contact form (WhatsApp / email hand-off),
   copy buttons and the frame price estimator.
   Progressive enhancement: every page works without JavaScript.
   ========================================================================== */
(function () {
  "use strict";

  var d = document, root = d.documentElement;
  var WA = "2347039934163";
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  var canHover = window.matchMedia ? window.matchMedia("(hover: hover)").matches : true;

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function waLink(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function naira(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ------------------------------------------------------------------
     1. NAVIGATION — slide-in panel on phones
  ------------------------------------------------------------------ */
  var toggle = $("#navToggle"), menu = $("#navMenu"), scrim = $("#navScrim"), header = $("#siteHeader");

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    root.classList.toggle("is-locked", open);
    if (open) { var first = $("a", menu); if (first) setTimeout(function () { first.focus(); }, 80); }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    if (scrim) scrim.addEventListener("click", function () { setMenu(false); });
    menu.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) setMenu(false); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 900 && menu.classList.contains("is-open")) setMenu(false); });
  }

  /* Current page in the menu */
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (here.indexOf(".") === -1) here = (here || "index") + ".html";
  $$(".nav-link").forEach(function (a) {
    if ((a.getAttribute("href") || "").toLowerCase() === here) a.setAttribute("aria-current", "page");
  });

  /* ------------------------------------------------------------------
     2. HEADER STATE + FLOATING WHATSAPP BUTTON
  ------------------------------------------------------------------ */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
      root.classList.toggle("wa-on", window.scrollY > window.innerHeight * 0.6);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. REVEALS
  ------------------------------------------------------------------ */
  var revealEls = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ------------------------------------------------------------------
     4. THE LIVING COLLAGE — five disciplines take turns in colour
  ------------------------------------------------------------------ */
  var collage = $("[data-collage]");
  var panels = collage ? $$(".hc-panel", collage) : [];
  var roles = $$("[data-roles] span");
  var tick = 0, timer = null, pinned = false;

  function light(key) {
    panels.forEach(function (p) { p.classList.toggle("is-lit", p.getAttribute("data-key") === key); });
  }
  function step() {
    if (!panels.length) return;
    tick = (tick + 1) % panels.length;
    light(panels[tick].getAttribute("data-key"));
    roles.forEach(function (r, i) { r.classList.toggle("is-on", i === tick % roles.length); });
  }
  function start() { if (!reduce && !timer && panels.length) timer = setInterval(step, 2600); }
  function stop() { clearInterval(timer); timer = null; }
  if (panels.length) {
    roles.forEach(function (r, i) { r.classList.toggle("is-on", i === 0); });
    start();
    if (collage) {
      collage.addEventListener("mouseover", function (e) {
        var p = e.target.closest && e.target.closest(".hc-panel");
        if (!p) return;
        stop();
        tick = panels.indexOf(p);
        light(p.getAttribute("data-key"));
      });
      collage.addEventListener("mouseleave", function () { if (!pinned) start(); });
    }
    d.addEventListener("visibilitychange", function () { if (d.hidden) stop(); else if (!pinned) start(); });
  } else if (roles.length) {
    roles.forEach(function (r) { r.classList.add("is-on"); });
  }

  /* ------------------------------------------------------------------
     5. THE IDEA BOX — reads an idea, lights the right discipline,
        then hands it to WhatsApp
  ------------------------------------------------------------------ */
  var IDEAS = [
    { k: ["wedding", "bride", "groom", "marriage", "engagement", "introduction", "traditional"], p: "story", n: "Weddings", h: "weddings.html" },
    { k: ["church", "sermon", "ministry", "worship", "livestream", "live stream", "gospel", "pastor", "crusade"], p: "motion", n: "Church media", h: "church-media.html" },
    { k: ["logo", "brand", "flyer", "poster", "banner", "card", "packag", "label", "design", "identity", "invitation", "invite", "billboard", "sticker", "menu", "cover"], p: "design", n: "Visual design", h: "graphic-design.html" },
    { k: ["frame", "print", "canvas", "acrylic"], p: "design", n: "Frames and prints", h: "frames.html" },
    { k: ["video", "film", "reel", "edit", "youtube", "tiktok", "documentary", "music video", "motion", "animation", "trailer", "vlog", "shorts", "clip"], p: "motion", n: "Film and motion", h: "video-editing.html" },
    { k: ["podcast", "audio", "sound", "voice", "jingle", "mix", "song", "music"], p: "sound", n: "Audio and sound", h: "video-editing.html" },
    { k: ["app", "android", "ios", "dashboard", "portal"], p: "code", n: "App development", h: "app-development.html" },
    { k: ["website", "web", "site", "landing", "online store", "e-commerce", "ecommerce", "blog"], p: "code", n: "Web design", h: "web-design.html" },
    { k: ["social", "instagram", "facebook", "ads", "advert", "campaign", "marketing", "followers", "content"], p: "code", n: "Social media and campaigns", h: "digital-marketing.html" },
    { k: ["photo", "shoot", "portrait", "headshot", "picture", "birthday", "graduation"], p: "story", n: "Photography", h: "photography.html" },
    { k: ["book", "write", "writing", "novel", "ghost", "poem", "poetry", "story", "script", "manuscript", "author"], p: "story", n: "Books and writing", h: "book-writing.html" },
    { k: ["class", "course", "learn", "train", "teach", "academy", "lesson", "importation"], p: "code", n: "the Academy", h: "academy.html" },
    { k: ["dog", "puppy", "puppies", "pet"], p: null, n: "Dogs and puppies", h: "dogs.html" }
  ];
  function matchIdea(text) {
    var t = " " + text.toLowerCase().replace(/[^a-z0-9\- ]+/g, " ");
    for (var i = 0; i < IDEAS.length; i++) {
      for (var j = 0; j < IDEAS[i].k.length; j++) {
        if (t.indexOf(" " + IDEAS[i].k[j]) > -1) return IDEAS[i];
      }
    }
    return null;
  }
  var idea = $("[data-idea]");
  if (idea) {
    var input = $("input", idea), hint = $("[data-idea-hint]", idea), base = hint ? hint.innerHTML : "";
    var last = null;
    input.addEventListener("input", function () {
      var v = input.value.trim();
      var m = v.length > 2 ? matchIdea(v) : null;
      if (m === last) return;
      last = m;
      if (m) {
        stop(); pinned = true;
        if (m.p) light(m.p);
        hint.innerHTML = "Sounds like <b>" + esc(m.n) + "</b>. <a href=\"" + m.h + "\">See what it costs</a>, or press Make it real.";
        hint.classList.add("is-match");
      } else {
        pinned = false; start();
        hint.innerHTML = v.length > 2 ? "Interesting. Press Make it real and I will tell you how I would do it." : base;
        hint.classList.remove("is-match");
      }
    });
    idea.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (v.length < 3) { input.focus(); hint.innerHTML = "Type your idea first, even a few words."; return; }
      var m = matchIdea(v);
      var msg = "Hello 100EMPIRE, I want to make: " + v + (m ? "\n(It sounds like " + m.n + ".)" : "") + "\nCan we talk about it?";
      window.open(waLink(msg), "_blank", "noopener");
      hint.innerHTML = "WhatsApp is opening with your idea. Press send there and I will reply.";
    });
  }

  /* ------------------------------------------------------------------
     6. COLOUR ON SCROLL FOR PHONES (no hover) + category hero
  ------------------------------------------------------------------ */
  if (!canHover && "IntersectionObserver" in window) {
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-lit", en.isIntersecting); });
    }, { rootMargin: "-38% 0px -38% 0px" });
    $$(".service, .bw").forEach(function (el) { lo.observe(el); });
  }
  var px = $("[data-px]");
  if (px) {
    var pimg = $(".px-bg img", px);
    var alive = function () { requestAnimationFrame(function () { px.classList.add("is-alive"); }); };
    if (!pimg || pimg.complete) setTimeout(alive, 250); else { pimg.addEventListener("load", alive); pimg.addEventListener("error", alive); }
  }

  /* Process steps light up one after another */
  var track = $("[data-process]");
  if (track && "IntersectionObserver" in window && !reduce) {
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$(".process-step", track).forEach(function (s, i) { setTimeout(function () { s.classList.add("is-lit"); }, 300 + i * 260); });
        po.disconnect();
      });
    }, { threshold: 0.35 });
    po.observe(track);
  }

  /* ------------------------------------------------------------------
     7. WORK FILTERS
  ------------------------------------------------------------------ */
  var filterBtns = $$(".filter-btn");
  var cards = $$("[data-work] .work-card, .work--page .case");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      filterBtns.forEach(function (x) { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      cards.forEach(function (c) {
        var keys = " " + (c.getAttribute("data-category") || "") + " ";
        var show = f === "all" || keys.indexOf(" all ") > -1 || keys.indexOf(" " + f + " ") > -1;
        c.classList.toggle("is-hidden", !show);
        if (show) c.classList.add("is-visible");
      });
    });
  });

  /* ------------------------------------------------------------------
     8. CONTACT FORM — validate, then hand the message to WhatsApp or email.
        There is no server: nothing is sent until the visitor presses send.
  ------------------------------------------------------------------ */
  $$("[data-cf]").forEach(function (form) {
    var done = $(".form-done", form), pre = $(".form-pre", form), openBtn = $(".form-open", form), copyBtn = $(".form-copy", form);
    var emailTo = form.getAttribute("data-email") || "";
    var via = "whatsapp";
    $$("button[type='submit']", form).forEach(function (b) { b.addEventListener("click", function () { via = b.value || "whatsapp"; }); });
    function field(n) { return form.elements[n]; }
    function setErr(el, msg) {
      var err = d.getElementById(el.getAttribute("aria-describedby"));
      var wrap = el.closest(".form-field");
      if (wrap) wrap.classList.toggle("has-error", !!msg);
      if (msg) { el.setAttribute("aria-invalid", "true"); if (err) err.textContent = msg; }
      else { el.removeAttribute("aria-invalid"); if (err) err.textContent = ""; }
    }
    ["name", "email", "type", "brief"].forEach(function (n) {
      var el = field(n); if (!el) return;
      var clear = function () { if (el.getAttribute("aria-invalid")) setErr(el, ""); };
      el.addEventListener("input", clear);
      el.addEventListener("change", clear);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (field("company") && field("company").value) return; /* spam trap: real people never fill this */
      var name = field("name").value.trim(), email = field("email").value.trim(), type = field("type").value, brief = field("brief").value.trim();
      var budget = field("budget") ? field("budget").value : "";
      var first = null;
      function check(el, ok, msg) { setErr(el, ok ? "" : msg); if (!ok && !first) first = el; }
      check(field("name"), name.length >= 2, "Please enter your name.");
      check(field("email"), /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), "Please enter a valid email address so I can reply.");
      check(field("type"), !!type, "Please choose the kind of project.");
      check(field("brief"), brief.length >= 15, "Please add a sentence or two about the idea.");
      if (first) { first.focus(); return; }
      var lines = ["Hello 100EMPIRE, I have a project in mind.", "", "Name: " + name, "Email: " + email, "Project type: " + type];
      if (budget) lines.push("Budget: " + budget);
      lines.push("", brief);
      var msg = lines.join("\n");
      var byEmail = via === "email" && emailTo;
      var url = byEmail
        ? "mailto:" + emailTo + "?subject=" + encodeURIComponent("New project: " + type) + "&body=" + encodeURIComponent(msg)
        : waLink(msg);
      pre.textContent = msg;
      openBtn.href = url;
      openBtn.textContent = byEmail ? "Open email" : "Open WhatsApp";
      $(".form-done-p", form).textContent = byEmail
        ? "Your email app has opened with everything filled in. Press send there to deliver it. If nothing opened, use the button below."
        : "WhatsApp has opened in a new tab with everything filled in. Press send there to deliver it. If nothing opened, use the button below.";
      done.hidden = false;
      if (byEmail) { location.href = url; } else { window.open(url, "_blank", "noopener"); }
      done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var t = copyBtn.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = t; }, 1600); });
      } else { var r = d.createRange(); r.selectNodeContents(pre); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    });
  });

  /* ------------------------------------------------------------------
     9. COPY BUTTONS
  ------------------------------------------------------------------ */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy"), t = b.textContent;
      var ok = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1600); };
      var no = function () { b.textContent = "Select & copy"; setTimeout(function () { b.textContent = t; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, no); else no();
    });
  });

  /* ------------------------------------------------------------------
     10. FRAME PRICE ESTIMATOR (frames page)
  ------------------------------------------------------------------ */
  var est = $("#frameEst");
  if (est) {
    var data = JSON.parse(est.getAttribute("data-prices"));
    var typeBtns = $$("[data-ftype]", est), sizeSel = $("#f-size", est), qty = $("#f-qty", est);
    var frame = $(".e-est-frame", est), lbl = $(".e-est-frame span", est), total = $("#f-total", est), each = $("#f-each", est), order = $("#f-order", est);
    var type = "border";
    var names = { border: "Border frame", borderless: "Borderless frame", acrylic: "Acrylic frame" };
    var dims = function (s) {
      var m = s.match(/([\d.]+)\s*x\s*([\d.]+)\s*(ft)?/i); if (!m) return [8, 10];
      var a = parseFloat(m[1]), b = parseFloat(m[2]); if (m[3]) { a *= 12; b *= 12; } return [a, b];
    };
    var render = function () {
      var row = data[sizeSel.selectedIndex], q = Math.max(1, parseInt(qty.value, 10) || 1);
      var price = row[type], dm = dims(row.size), w = dm[0], h = dm[1];
      frame.style.width = Math.min(86, 26 + Math.sqrt(w * h) * 0.62) + "%";
      frame.style.aspectRatio = w + " / " + h;
      frame.setAttribute("data-type", type);
      lbl.textContent = row.size;
      each.textContent = naira(price) + " each";
      total.textContent = naira(price * q);
      order.href = waLink("Hello 100EMPIRE, I would like to order " + q + " x " + names[type] + " (" + row.size + "). Estimate: " + naira(price * q) + ".");
      typeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-ftype") === type)); });
    };
    typeBtns.forEach(function (b) { b.addEventListener("click", function () { type = b.getAttribute("data-ftype"); render(); }); });
    sizeSel.addEventListener("change", render);
    qty.addEventListener("input", render);
    render();
  }

  /* ------------------------------------------------------------------
     11. FOOTER YEAR
  ------------------------------------------------------------------ */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
