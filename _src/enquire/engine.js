/* 100EMPIRE — enquire.js: one enquiry form for the whole site.
   Built by _src/enquire/build.py — edit the files in _src/enquire, then run the build.
   Any WhatsApp link (wa.me/2347039934163) opens this form first, filled in from the link:
   the page's service, a package ("... the Gold package (₦700,000) under Weddings"), a course,
   a project, a frame order or a dog breed. The answers go to WhatsApp as one message.
   Links marked data-direct, and links inside the form, still go straight to WhatsApp.
   Without JavaScript (or without <dialog>) every link simply opens WhatsApp as before. */
(function () {
  "use strict";
  var DATA = /*DATA*/null;
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
    if (f.t === "note") return '<p class="eq-ref eq-wide"' + attrs + ">" + esc(f.l) + "</p>";
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
