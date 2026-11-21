/* ==========================================================================
   100EMPIRE — book-social.js
   Social media management booking: plan → platforms (included + paid
   extras) → add-ons → brand → months → details. Live price, then the
   booking goes to WhatsApp, or to the pay page with the details carried over.
   ========================================================================== */
(function () {
  "use strict";
  var d = document, form = d.querySelector("[data-book]");
  if (!form) return;

  var WA = "2347039934163", EXTRA = 70000;
  var PH = { facebook: "facebook.com/yourpage", instagram: "@yourpage", tiktok: "@yourpage", youtube: "youtube.com/@yourchannel",
    whatsapp: "Business number or channel link", x: "@yourhandle", linkedin: "linkedin.com/company/yourpage" };
  var order = [], links = {};
  var $ = function (s) { return form.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(form.querySelectorAll(s)); };
  var el = function (n) { return form.elements.namedItem(n); };

  function naira(n) { return "₦" + Math.round(n || 0).toLocaleString("en-NG"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function val(n) { var e = el(n); return e ? String(e.value || "").trim() : ""; }
  function radio(n) { var r = form.querySelector('input[name="' + n + '"]:checked'); return r || null; }
  function today() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function isoToday() { var t = today(), m = t.getMonth() + 1, dd = t.getDate(); return t.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (dd < 10 ? "0" : "") + dd; }
  function fmtDate(v) {
    var p = String(v).split("-"); if (p.length !== 3) return v;
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch (e) { return v; }
  }
  function platLabel(k) { var c = form.querySelector('input[name="plat"][value="' + k + '"]'); return c ? c.getAttribute("data-label") : k; }

  el("start").min = isoToday();

  function state() {
    var p = radio("plan"), months = +(radio("months") || { value: 3 }).value;
    var plan = p ? { key: p.value, name: p.closest(".bk-plan").querySelector(".bk-plan-top b").textContent, price: +p.getAttribute("data-price"), n: +p.getAttribute("data-n") } : null;
    var extras = plan ? Math.max(0, order.length - plan.n) : 0;
    var monthly = plan ? plan.price + extras * EXTRA : 0;
    var adds = $$('input[name="add"]:checked').map(function (c) { return c.value; });
    return { plan: plan, months: months, extras: extras, monthly: monthly, period: monthly * months, adds: adds };
  }

  function drawLinks() {
    var box = $("[data-links]");
    $$("[data-links] input").forEach(function (i) { links[i.name.slice(5)] = i.value; });
    box.innerHTML = order.map(function (k) {
      return '<div class="tl-f"><label for="bk-link-' + k + '">' + esc(platLabel(k)) + ' page <span>(optional)</span></label>' +
        '<input id="bk-link-' + k + '" name="link-' + k + '" type="text" maxlength="120" placeholder="' + esc(PH[k] || "") + '" value="' + esc(links[k] || "") + '"></div>';
    }).join("");
  }

  function draw() {
    var s = state(), plan = s.plan;
    // platforms: tags, hint, count
    $$('input[name="plat"]').forEach(function (c) {
      var i = order.indexOf(c.value), tag = c.parentNode.querySelector("[data-tag]");
      tag.textContent = i < 0 || !plan ? "" : i < plan.n ? "Included" : "+₦70k";
    });
    if (plan) {
      $("[data-plat-hint]").textContent = "Your " + plan.name + " plan includes " + plan.n + " platforms. Pick as many as you need: each extra platform is " + naira(EXTRA) + " a month.";
      var c = order.length, cnt = $("[data-plat-count]");
      if (!c) cnt.textContent = "";
      else if (c < plan.n) cnt.innerHTML = "<b>" + c + "</b> picked. You can add " + (plan.n - c) + " more at no extra cost.";
      else if (c === plan.n) cnt.innerHTML = "<b>" + c + " of " + plan.n + "</b> included platforms picked.";
      else cnt.innerHTML = "<b>" + c + "</b> picked: " + plan.n + " included + " + s.extras + " extra (" + naira(s.extras * EXTRA) + " a month).";
    }
    // ads management is part of Premium
    var adsBox = form.querySelector('[data-add="ads"]'), adsIn = adsBox && adsBox.querySelector("input");
    if (adsBox) {
      var prem = plan && plan.key === "premium";
      adsBox.classList.toggle("is-off", !!prem);
      if (prem) adsIn.checked = false;
      adsIn.disabled = !!prem;
    }
    s = state();
    // summary
    var rows = [];
    if (plan) rows.push(["Plan", plan.name + " · " + naira(plan.price) + " a month"]);
    rows.push(["Platforms", order.length ? order.map(function (k, i) { return platLabel(k) + (plan && i >= plan.n ? " (extra)" : ""); }).join(", ") : "None picked yet"]);
    if (s.extras) rows.push(["Extras", s.extras + " × " + naira(EXTRA) + " a month"]);
    rows.push(["Add-ons", s.adds.length ? s.adds.join(", ") + " (we confirm the price)" : "None"]);
    if (val("start")) rows.push(["Start", fmtDate(val("start"))]);
    $("[data-sum]").innerHTML = rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    $("[data-sum-month]").textContent = naira(s.monthly);
    $("[data-sum-period-l]").textContent = "For " + s.months + (s.months === 1 ? " month" : " months");
    $("[data-sum-period]").textContent = naira(s.period);
    var p1 = $('[data-go="pay1"]'), pa = $('[data-go="payall"]');
    p1.textContent = "Pay first month online · " + naira(s.monthly);
    pa.textContent = "Pay all " + s.months + " months online · " + naira(s.period);
    pa.hidden = s.months === 1;
  }

  /* ---------- checks ---------- */
  function setErr(n, msg) {
    var box = form.querySelector('[data-err="' + n + '"]'), f = el(n);
    if (box) box.textContent = msg || "";
    if (f && f.setAttribute) { if (msg) f.setAttribute("aria-invalid", "true"); else f.removeAttribute("aria-invalid"); }
    return !msg;
  }
  function check() {
    var bad = [];
    function need(n, ok, msg) { if (!setErr(n, ok ? "" : msg)) bad.push(n); }
    need("plat", order.length > 0, "Pick at least one platform.");
    need("org", val("org").length >= 2, "Enter the business, ministry or organisation name.");
    need("kind", !!val("kind"), "Please choose one.");
    need("goal", !!val("goal"), "Please choose your main goal.");
    need("start", !!val("start") && val("start") >= isoToday(), val("start") ? "Choose a date from today on." : "Choose a start date.");
    need("name", val("name").length >= 2, "Enter your full name.");
    var ph = val("phone").replace(/\D/g, "");
    need("phone", ph.length >= 10 && ph.length <= 15, "Enter your WhatsApp number.");
    need("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email")), "Enter your email address.");
    need("state", !!val("state"), "Choose your state.");
    need("town", val("town").length >= 2, "Enter your town or area.");
    setErr("form", bad.length ? "Please fill in the highlighted fields." : "");
    if (bad.length) {
      var first = bad[0] === "plat" ? form.querySelector('input[name="plat"]') : el(bad[0]);
      try { (first.closest(".tl-f, .bk-step") || first).scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { /* old browsers */ }
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }
    return !bad.length;
  }

  function platLines() {
    var s = state();
    $$("[data-links] input").forEach(function (i) { links[i.name.slice(5)] = i.value.trim(); });
    return order.map(function (k, i) { return platLabel(k) + (links[k] ? " (" + links[k] + ")" : "") + (s.plan && i >= s.plan.n ? " [extra]" : ""); });
  }

  function brief(intro) {
    var s = state(), L = [intro, ""];
    L.push("Plan: " + s.plan.name + " (" + naira(s.plan.price) + " a month, " + s.plan.n + " platforms included)");
    L.push("Platforms: " + platLines().join(", "));
    if (s.extras) L.push("Extra platforms: " + s.extras + " × " + naira(EXTRA) + " a month");
    L.push("Monthly total: " + naira(s.monthly));
    L.push("Months: " + s.months + " (" + naira(s.period) + ")");
    if (s.adds.length) L.push("Add-ons to confirm: " + s.adds.join(", "));
    L.push("", "Organisation: " + val("org") + " (" + val("kind") + ")", "Goal: " + val("goal"));
    if (val("budget")) L.push("Monthly ad budget: " + val("budget"));
    L.push("Start date: " + fmtDate(val("start")));
    if (val("brand")) L.push("Branding: " + val("brand"));
    if (val("notes")) L.push("Notes: " + val("notes"));
    L.push("", "Name: " + val("name") + (val("role") ? " (" + val("role") + ")" : ""), "WhatsApp: " + val("phone"), "Email: " + val("email"),
      "Location: " + val("town") + ", " + val("state"), "", "(Sent from 100empire.com/book-social-media)");
    return L.join("\n");
  }

  function goPay(all) {
    var s = state(), amount = all ? s.period : s.monthly;
    var what = "Social media " + s.plan.name + " plan, " + (all ? s.months + " months" : "first month") + " (" + order.length + (order.length === 1 ? " platform)" : " platforms)");
    var notes = brief("Social media booking").replace(/\n\(Sent from[^\n]*$/, "").replace(/^Social media booking\n\n/, "");
    try {
      sessionStorage.setItem("100e-pay-prefill", JSON.stringify({ at: Date.now(), f: {
        name: val("name"), phone: val("phone"), email: val("email"), d_brand: val("org"), d_handles: platLines().join(", "),
        d_budget: val("budget"), d_state: val("state"), d_town: val("town"), notes: notes.slice(0, 1500) } }));
    } catch (e) { /* private mode: the pay page asks again */ }
    location.href = "/pay?amount=" + amount + "&service=social&for=" + encodeURIComponent(what.slice(0, 120));
  }

  /* ---------- events ---------- */
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "plat") {
      var i = order.indexOf(t.value);
      if (t.checked && i < 0) order.push(t.value);
      if (!t.checked && i >= 0) order.splice(i, 1);
      drawLinks();
      if (order.length) setErr("plat", "");
    }
    if (t.getAttribute && t.getAttribute("aria-invalid") === "true" && String(t.value).trim()) setErr(t.name, "");
    draw();
  });
  form.addEventListener("input", function (e) { if (e.target.name === "start") draw(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-go]") : null;
    if (!b || !check()) return;
    var go = b.getAttribute("data-go");
    if (go === "wa") window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(brief("Hello 100EMPIRE, I would like to book social media management.")), "_blank", "noopener");
    else goPay(go === "payall");
  });

  /* ?plan=growth&plat=facebook,instagram */
  try {
    var q = new URLSearchParams(location.search);
    var pr = q.get("plan") && form.querySelector('input[name="plan"][value="' + q.get("plan").replace(/[^a-z]/g, "") + '"]');
    if (pr) pr.checked = true;
    (q.get("plat") || "").split(",").forEach(function (k) {
      var c = form.querySelector('input[name="plat"][value="' + k.replace(/[^a-z]/g, "") + '"]');
      if (c && !c.checked) { c.checked = true; order.push(c.value); }
    });
  } catch (e) { /* old browsers */ }
  /* boxes the browser restored after going back */
  $$('input[name="plat"]:checked').forEach(function (c) { if (order.indexOf(c.value) < 0) order.push(c.value); });
  drawLinks();
  draw();
})();
