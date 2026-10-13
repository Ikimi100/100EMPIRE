/* ==========================================================================
   100EMPIRE — pay.js (Pay online page)
   Checks the form, opens Flutterwave's secure checkout, then asks our own
   /api/verify function to confirm the payment with Flutterwave before
   showing a receipt. The secret key never reaches the browser.
   ========================================================================== */
(function () {
  "use strict";
  var d = document;
  var form = d.querySelector("[data-pay]");
  if (!form) return;

  var WA = "2347039934163";
  var $ = function (s) { return form.querySelector(s); };
  var field = function (n) { return form.elements.namedItem(n); };
  var totalEl = $("[data-pay-total]"), btn = $("[data-pay-btn]"), setup = $("[data-pay-setup]"), result = $(".pay-result");
  var publicKey = form.getAttribute("data-public-key") || "";
  var flwLoading = null;

  function naira(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function waLink(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function mode() { var r = form.querySelector('input[name="mode"]:checked'); return r ? r.value : "package"; }
  function selected() { var s = field("item"); return s.selectedIndex > 0 ? s.options[s.selectedIndex] : null; }
  function amountOf(v) { var n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function qty() { var o = selected(); if (!o || !o.hasAttribute("data-qty")) return 1; var q = parseInt(field("qty").value, 10); return Math.min(500, Math.max(1, isNaN(q) ? 1 : q)); }

  function total() {
    if (mode() === "package") { var o = selected(); return o ? Number(o.getAttribute("data-amount")) * qty() : 0; }
    return amountOf(field("amount").value);
  }
  function describe() {
    if (mode() === "package") { var o = selected(); if (!o) return ""; var q = qty(); return (q > 1 ? q + " x " : "") + o.getAttribute("data-label"); }
    return "Quote or deposit: " + field("for").value.trim();
  }
  function render() {
    var m = mode();
    form.classList.toggle("is-quote", m === "quote");
    var o = selected();
    form.classList.toggle("has-qty", m === "package" && !!o && o.hasAttribute("data-qty"));
    var t = total();
    totalEl.textContent = naira(t);
    btn.innerHTML = btn.innerHTML.replace(/^[^<]*/, t ? "Pay " + naira(t) + " securely" : "Pay securely");
  }

  function setError(name, msg) {
    var el = field(name), box = d.getElementById("payForm-" + name + "-err");
    if (box) box.textContent = msg || "";
    if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    return !msg;
  }
  function validate() {
    var bad = [];
    if (mode() === "package") {
      if (!setError("item", selected() ? "" : "Choose the package you are paying for.")) bad.push("item");
      setError("amount", ""); setError("for", "");
    } else {
      var a = amountOf(field("amount").value);
      if (!setError("amount", a >= 1000 ? (a > 20000000 ? "For amounts above ₦20,000,000, ask for bank details on WhatsApp." : "") : "Enter the amount on your quote (at least ₦1,000).")) bad.push("amount");
      if (!setError("for", field("for").value.trim().length >= 3 ? "" : "Say what the payment is for, for example the quote or deposit.")) bad.push("for");
      setError("item", "");
    }
    if (!setError("name", field("name").value.trim().length >= 2 ? "" : "Enter your name.")) bad.push("name");
    var ph = field("phone").value.replace(/\D/g, "");
    if (!setError("phone", ph.length >= 10 && ph.length <= 15 ? "" : "Enter your WhatsApp or phone number.")) bad.push("phone");
    if (!setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field("email").value.trim()) ? "" : "Enter an email address for the receipt.")) bad.push("email");
    return bad;
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

  function showResult(html, good) {
    result.innerHTML = html;
    result.hidden = false;
    result.classList.toggle("is-bad", !good);
    result.focus();
  }

  function receipt(info, desc, amount, ref) {
    var msg = "Hello 100EMPIRE, I have paid " + naira(amount) + " online for " + desc + ". Reference: " + ref + ".";
    return '<p class="form-done-h">' + info.title + "</p><p>" + info.text + "</p>" +
      '<dl class="pay-receipt"><div><dt>Amount</dt><dd>' + naira(amount) + "</dd></div>" +
      "<div><dt>For</dt><dd>" + esc(desc) + "</dd></div>" +
      "<div><dt>Reference</dt><dd>" + esc(ref) + "</dd></div></dl>" +
      '<div class="e-btns"><a class="btn btn-primary" href="' + esc(waLink(msg)) + '" target="_blank" rel="noopener">Send the reference on WhatsApp</a></div>';
  }

  function verify(resp, ctx) {
    var q = "transaction_id=" + encodeURIComponent(resp.transaction_id) + "&tx_ref=" + encodeURIComponent(ctx.ref) +
      (ctx.item ? "&item=" + encodeURIComponent(ctx.item) + "&qty=" + ctx.qty : "&amount=" + ctx.amount);
    showResult('<p class="form-done-h">Checking your payment…</p><p>Confirming with Flutterwave. Please keep this page open.</p>', true);
    fetch("/api/verify?" + q, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
      .then(function (r) {
        if (r.body && r.body.ok) {
          showResult(receipt({ title: "Payment confirmed", text: "Thank you, " + esc(ctx.name.split(" ")[0]) + ". Flutterwave has confirmed this payment and will email your receipt." }, ctx.desc, r.body.amount || ctx.amount, ctx.ref), true);
          form.classList.add("is-paid");
        } else if (r.status === 503) {
          showResult(receipt({ title: "Payment sent", text: "Flutterwave reported this payment as " + esc(resp.status || "complete") + ". I will confirm it from my Flutterwave account. Send me the reference so I can match it to your job." }, ctx.desc, ctx.amount, ctx.ref), true);
        } else {
          showResult(receipt({ title: "Payment not confirmed yet", text: "Flutterwave has not confirmed this payment. If money left your account, send me the reference on WhatsApp and I will check it straight away." }, ctx.desc, ctx.amount, ctx.ref), false);
        }
      })
      .catch(function () {
        showResult(receipt({ title: "Could not check the payment", text: "The connection dropped while checking. If your payment went through, Flutterwave will email a receipt. Send me the reference on WhatsApp." }, ctx.desc, ctx.amount, ctx.ref), false);
      });
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
        meta: { item: ctx.item || "quote", qty: ctx.qty },
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

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad.length) { var f = field(bad[0]); if (f && f.focus) f.focus(); return; }
    if (!publicKey) { setup.hidden = false; setup.focus && setup.focus(); return; }
    var o = selected();
    pay({
      ref: "100E-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      amount: total(), desc: describe(), item: mode() === "package" && o ? o.value : "", qty: qty(),
      name: field("name").value.trim(), email: field("email").value.trim(), phone: field("phone").value.trim()
    });
  });

  // Links like pay.html?item=graphic-design--single or pay.html?amount=50000&for=Logo%20deposit
  try {
    var p = new URLSearchParams(location.search);
    if (p.get("item")) {
      var sel = field("item");
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === p.get("item")) sel.selectedIndex = i;
      if (p.get("qty")) field("qty").value = p.get("qty");
    } else if (p.get("amount")) {
      form.querySelector('input[value="quote"]').checked = true;
      field("amount").value = amountOf(p.get("amount")).toLocaleString("en-NG");
      if (p.get("for")) field("for").value = p.get("for").slice(0, 120);
    }
  } catch (e) { /* old browsers: no preselect */ }
  render();

  // The public key comes from the page, or from Vercel's settings through /api/config
  function ready(ok) { form.classList.toggle("is-setup", !ok); setup.hidden = ok; }
  if (publicKey) ready(true);
  else if (location.protocol.indexOf("http") === 0) {
    fetch("/api/config", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { if (j && j.publicKey) { publicKey = j.publicKey; ready(true); } else ready(false); })
      .catch(function () { ready(false); });
  } else ready(false);
})();
