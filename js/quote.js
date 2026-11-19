/* 100EMPIRE — quote.js: the Dogs page quote form.
   Any link with data-quote="buy|stud|vax|health|consult|papers|care" (and optional data-breed)
   opens the form with that choice filled in. The answers become one WhatsApp message.
   If the browser cannot open the form, the link's own WhatsApp address is used instead. */
(function () {
  "use strict";
  var dlg = document.getElementById("quote");
  var form = document.getElementById("quoteForm");
  if (!dlg || !form || typeof dlg.showModal !== "function") return;

  var WA = "2347039934163";
  var NAMES = { buy: "Buy a puppy", stud: "Stud or breeding", vax: "Vaccination and deworming", health: "Health check",
    consult: "Breed consultation", papers: "Pedigree papers (COBA)", care: "Aftercare and training" };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var done = form.querySelector(".form-done"), pre = form.querySelector(".form-pre");
  var openBtn = form.querySelector(".form-open"), copyBtn = form.querySelector(".form-copy");
  var breedLabel = document.getElementById("qf-breed-label");
  var lastTrigger = null;

  function el(name) { return form.elements[name]; }
  function service() { var r = form.querySelector('input[name="service"]:checked'); return r ? r.value : "buy"; }

  function sync() {
    var s = service();
    form.querySelectorAll("[data-for]").forEach(function (box) {
      var on = (" " + box.getAttribute("data-for") + " ").indexOf(" " + s + " ") > -1;
      box.hidden = !on;
      box.querySelectorAll("input, select, textarea").forEach(function (f) { f.disabled = !on; });
    });
    if (breedLabel) breedLabel.textContent = (s === "buy" || s === "consult") ? "Breed you want" : "Your dog’s breed";
  }

  function setErr(f, msg) {
    var err = document.getElementById(f.getAttribute("aria-describedby"));
    var wrap = f.closest(".form-field");
    if (wrap) wrap.classList.toggle("has-error", !!msg);
    if (msg) { f.setAttribute("aria-invalid", "true"); if (err) err.textContent = msg; }
    else { f.removeAttribute("aria-invalid"); if (err) err.textContent = ""; }
  }
  ["breed", "state", "name"].forEach(function (n) {
    var f = el(n); if (!f) return;
    var clear = function () { if (f.getAttribute("aria-invalid")) setErr(f, ""); };
    f.addEventListener("input", clear); f.addEventListener("change", clear);
  });

  function open(svc, breed, trigger) {
    lastTrigger = trigger || null;
    done.hidden = true;
    var radio = form.querySelector('input[name="service"][value="' + (NAMES[svc] ? svc : "buy") + '"]');
    if (radio) radio.checked = true;
    if (breed) {
      var b = el("breed");
      for (var i = 0; i < b.options.length; i++) if (b.options[i].text === breed) { b.selectedIndex = i; break; }
    }
    sync();
    dlg.showModal();
    document.documentElement.classList.add("qd-open");
    var first = breed ? el("state") : form.querySelector('input[name="service"]:checked');
    if (first) first.focus({ preventScroll: true });
    form.scrollTop = 0; dlg.scrollTop = 0;
  }
  function close() { dlg.close(); }

  dlg.addEventListener("close", function () {
    document.documentElement.classList.remove("qd-open");
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  });
  form.querySelector(".qd-close").addEventListener("click", close);
  form.querySelectorAll('input[name="service"]').forEach(function (r) { r.addEventListener("change", sync); });

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("[data-quote]");
    if (!a) return;
    ev.preventDefault();
    open(a.getAttribute("data-quote"), a.getAttribute("data-breed"), a);
  });

  function val(n) { var f = el(n); return f && !f.disabled ? (f.value || "").trim() : ""; }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (el("company") && el("company").value) return; /* spam trap */
    var s = service(), first = null;
    function check(f, ok, msg) { setErr(f, ok ? "" : msg); if (!ok && !first) first = f; }
    if (s === "buy" || s === "stud") check(el("breed"), !!val("breed"), "Please choose a breed, or pick ‘Not sure’.");
    else setErr(el("breed"), "");
    check(el("state"), !!val("state"), "Please choose your state so we can plan delivery.");
    check(el("name"), val("name").length >= 2, "Please enter your name.");
    if (first) { first.focus(); return; }

    var lines = ["Hello 100EMPIRE, I would like a quote.", "", "Service: " + NAMES[s]];
    function add(label, n) { var v = val(n); if (v) lines.push(label + ": " + v); }
    add(s === "buy" || s === "consult" ? "Breed" : "My dog's breed", "breed");
    add("Sex", "sex"); add("My dog is", "dogsex");
    add("Age wanted", "agewant"); add("Pedigree papers", "paperswant"); add("Budget", "budget"); add("When", "when");
    add("My dog's age", "dogage"); add("My dog's age", "dogage2"); add("Has pedigree papers", "papers");
    add("Vaccinated", "vaccinated"); add("Looking for", "studwant");
    add("Number of dogs", "count"); add("Vaccines so far", "vaxhistory");
    add("Main purpose", "purpose"); add("Home", "home"); add("Owned a dog before", "experience");
    var where = val("state") + (val("area") ? ", " + val("area") : "");
    lines.push("Location: " + where);
    add("Delivery", "delivery");
    lines.push("Name: " + val("name"));
    if (val("notes")) lines.push("", val("notes"));
    var msg = lines.join("\n");
    var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    pre.textContent = msg;
    openBtn.href = url;
    done.hidden = false;
    window.open(url, "_blank", "noopener");
    done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  });

  if (copyBtn) copyBtn.addEventListener("click", function () {
    var t = copyBtn.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pre.textContent).then(function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = t; }, 1600); });
    }
  });

  sync();
})();
