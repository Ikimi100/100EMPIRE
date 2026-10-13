/* 100EMPIRE — paylink.js: builds pay.html links and a WhatsApp message for a customer. */
(function () {
  "use strict";
  var form = document.querySelector("[data-paylink]");
  if (!form) return;
  var site = form.getAttribute("data-site") || "https://www.100empire.com";
  var f = function (n) { return form.elements.namedItem(n); };
  var linkEl = form.querySelector("[data-pl-link]"), msgEl = form.querySelector("[data-pl-msg]");
  var waBtn = form.querySelector("[data-pl-wa]"), copyBtn = form.querySelector("[data-pl-copy]"), openBtn = form.querySelector("[data-pl-open]");
  var current = "", currentMsg = "";
  function mode() { var r = form.querySelector('input[name="mode"]:checked'); return r ? r.value : "quote"; }
  function amountOf(v) { var n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function naira(n) { return "₦" + Math.round(n).toLocaleString("en-NG"); }
  function phone(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.indexOf("234") === 0) return d;
    if (d.charAt(0) === "0" && d.length === 11) return "234" + d.slice(1);
    return d.length >= 10 ? d : "";
  }
  function setEnabled(on) {
    [waBtn, openBtn].forEach(function (a) { a.setAttribute("aria-disabled", String(!on)); a.classList.toggle("is-off", !on); });
    copyBtn.disabled = !on;
  }
  function build() {
    var m = mode(), url = "", what = "", total = 0;
    form.classList.toggle("is-quote", m === "quote");
    var sel = f("item"), o = sel.selectedIndex > 0 ? sel.options[sel.selectedIndex] : null;
    form.classList.toggle("has-qty", m === "package" && !!o && o.hasAttribute("data-qty"));
    if (m === "quote") {
      total = amountOf(f("amount").value);
      what = f("for").value.trim();
      if (total >= 1000 && what.length >= 3) url = site + "/pay.html?amount=" + total + "&for=" + encodeURIComponent(what);
    } else if (o) {
      var q = o.hasAttribute("data-qty") ? Math.min(500, Math.max(1, parseInt(f("qty").value, 10) || 1)) : 1;
      total = Number(o.getAttribute("data-amount")) * q;
      what = (q > 1 ? q + " x " : "") + o.getAttribute("data-label");
      url = site + "/pay.html?item=" + encodeURIComponent(o.value) + (q > 1 ? "&qty=" + q : "");
    }
    current = url;
    if (!url) {
      linkEl.textContent = m === "quote" ? "Fill in the amount (at least ₦1,000) and what it is for." : "Choose a package.";
      msgEl.textContent = ""; setEnabled(false); return;
    }
    var name = f("cname").value.trim();
    currentMsg = "Hello" + (name ? " " + name : "") + ", here is your secure payment link for " + what + " (" + naira(total) + "): " + url +
      "\nYou can pay by card, bank transfer or USSD. Thank you, 100EMPIRE.";
    linkEl.textContent = url; msgEl.textContent = currentMsg;
    var ph = phone(f("cphone").value);
    waBtn.href = "https://wa.me/" + ph + "?text=" + encodeURIComponent(currentMsg);
    openBtn.href = url;
    setEnabled(true);
  }
  [waBtn, openBtn].forEach(function (a) { a.addEventListener("click", function (e) { if (a.getAttribute("aria-disabled") === "true") e.preventDefault(); }); });
  copyBtn.addEventListener("click", function () {
    var done = function (t) { copyBtn.textContent = t; setTimeout(function () { copyBtn.textContent = "Copy link"; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(current).then(function () { done("Copied"); }, function () { done("Select and copy"); });
    else done("Select and copy");
  });
  form.addEventListener("input", build);
  form.addEventListener("change", build);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  build();
})();
