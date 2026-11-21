/* ==========================================================================
   100EMPIRE — tools.js
   Free tools: puppy vaccination calculator, wedding budget planner and
   frame size preview. Everything runs in the browser; nothing is sent to us.
   ========================================================================== */
(function () {
  "use strict";
  var d = document;

  /* ---------- shared helpers ---------- */
  function naira(n) { return "₦" + Math.round(n || 0).toLocaleString("en-NG"); }
  function num(v) { var n = parseInt(String(v || "").replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function waShare(text) { return "https://wa.me/?text=" + encodeURIComponent(text); }
  var MS_DAY = 86400000;
  function today() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function addDays(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }
  function addMonths(dt, n) { return new Date(dt.getFullYear(), dt.getMonth() + n, dt.getDate()); }
  function iso(dt) { var m = dt.getMonth() + 1, dd = dt.getDate(); return dt.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (dd < 10 ? "0" : "") + dd; }
  function parseISO(v) { var p = String(v || "").split("-"); if (p.length !== 3) return null; var dt = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(dt) ? null : dt; }
  function fmt(dt, opts) {
    try { return dt.toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch (e) { return iso(dt); }
  }
  function short(dt) { return fmt(dt, { day: "numeric", month: "short", year: "numeric" }); }

  /* Print a clean black-on-white sheet using the receipt print styles */
  function printSheet(title, sections, foot) {
    var old = d.getElementById("printReceipt");
    if (old) old.parentNode.removeChild(old);
    var box = d.createElement("div");
    box.id = "printReceipt";
    var h = '<div class="pr-head"><b>100EMPIRE</b><span>' + esc(title) + "</span></div>";
    sections.forEach(function (s) {
      h += '<p class="pay-rc-h">' + esc(s.h) + '</p><dl class="pay-receipt">' +
        s.rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
    });
    h += '<p class="pr-foot">' + esc(foot) + "<br>www.100empire.com · +234 703 993 4163</p>";
    box.innerHTML = h;
    d.body.appendChild(box);
    d.documentElement.classList.add("print-receipt");
    var after = function () { d.documentElement.classList.remove("print-receipt"); window.removeEventListener("afterprint", after); };
    window.addEventListener("afterprint", after);
    setTimeout(function () { window.print(); }, 50);
  }

  /* ======================================================================
     1. Puppy vaccination calculator
     ====================================================================== */
  function initVax(root) {
    var form = root.querySelector("[data-vax-form]"), out = root.querySelector("[data-vax-out]"), err = root.querySelector("[data-vax-err]");
    var dobEl = form.elements.namedItem("dob"), nameEl = form.elements.namedItem("name");
    var now = today();
    dobEl.max = iso(now);
    dobEl.min = iso(addMonths(now, -60));
    var current = null;

    function schedule(dob) {
      var items = [
        { from: addDays(dob, 14), what: "First deworming", note: "Then repeated regularly through puppyhood and every few months for adults. Your vet sets how often." },
        { from: addDays(dob, 42), to: addDays(dob, 56), what: "Core vaccine, 1st dose", note: "Distemper, hepatitis (adenovirus) and parvovirus. Given at 6–8 weeks." },
        { from: addDays(dob, 70), to: addDays(dob, 84), what: "Core vaccine, 2nd dose", note: "At 10–12 weeks. Leptospirosis can start here if your vet advises it." },
        { from: addDays(dob, 98), to: addDays(dob, 112), cal: addDays(dob, 112), what: "Final puppy dose and rabies",
          note: "At 14–16 weeks. The final core dose is given at 16 weeks or older, from " + short(addDays(dob, 112)) + ". Rabies is a core vaccine in Nigeria." },
        { from: addMonths(dob, 6), to: addMonths(dob, 12), what: "Booster", note: "At 6–12 months. Closes any gap left by the puppy course." },
        { from: addMonths(dob, 42), what: "Adult core booster", around: true,
          note: "Core vaccines no more often than every 3 years after the 6–12 month booster. Rabies and leptospirosis as your vet advises." }
      ];
      var t = today(), nextSet = false;
      items.forEach(function (it) {
        var end = it.to || addDays(it.from, 7);
        if (t > end) it.state = "past";
        else if (t >= it.from) it.state = "now";
        else if (!nextSet) { it.state = "next"; nextSet = true; }
        else it.state = "later";
        if (it.state === "now") nextSet = true;
      });
      return items;
    }

    function age(dob) {
      var days = Math.round((today() - dob) / MS_DAY);
      if (days < 7) return days + (days === 1 ? " day" : " days") + " old";
      if (days < 112) { var w = Math.floor(days / 7); return w + (w === 1 ? " week" : " weeks") + " old"; }
      var m = Math.floor(days / 30.44);
      if (m < 24) return m + " months old";
      return Math.floor(m / 12) + " years old";
    }

    function when(it) {
      if (it.around) return "From " + short(it.from);
      if (!it.to) return short(it.from);
      return short(it.from) + " – " + short(it.to);
    }

    var TAG = { past: "Passed", now: "Due now", next: "Next", later: "Coming" };

    function render(dob, name) {
      var items = schedule(dob), who = name ? name + "’s" : "Your puppy’s";
      current = { dob: dob, name: name, items: items };
      var h = '<h2 class="tl-h">' + esc(who) + " dates</h2>" +
        '<p class="tl-hint" style="margin:-.5rem 0 1rem">Born ' + esc(fmt(dob)) + " · " + esc(age(dob)) + " today</p>";
      h += '<ol class="vxc">' + items.map(function (it) {
        return '<li class="is-' + it.state + '"><div class="vxc-date">' + esc(when(it)) + (it.around ? "<small>around this date</small>" : "") +
          '</div><div class="vxc-what"><b>' + esc(it.what) + "</b><span>" + esc(it.note) + '</span></div><span class="vxc-tag is-' + it.state + '">' + TAG[it.state] + "</span></li>";
      }).join("") + "</ol>";
      if (items.some(function (it) { return it.state === "past"; })) {
        h += '<p class="tl-hint" style="margin-bottom:1rem">For dates that have passed, check they are written on the vaccination card. If a dose was missed, ask your vet whether to continue or restart the course.</p>';
      }
      h += '<div class="tl-btns"><button class="e-btn e-btn--gold" type="button" data-vax-ics>Add to my calendar</button>' +
        '<a class="e-btn e-btn--ghost" data-direct target="_blank" rel="noopener" href="' + esc(waShare(text())) + '">Send to WhatsApp</a>' +
        '<button class="e-btn e-btn--ghost" type="button" data-vax-pdf>Save as PDF</button>' +
        '<a class="e-btn e-btn--ghost" data-quote="vax" href="https://wa.me/2347039934163?text=' + encodeURIComponent("Hello 100EMPIRE, I would like to book a vaccination for my puppy.") + '" target="_blank" rel="noopener">Book a vaccination</a></div>' +
        '<p class="tl-note">A guide based on the 2024 WSAVA vaccination guidelines. Your vet confirms the exact plan for each dog.</p>';
      out.innerHTML = h;
      store("100e-vax", { dob: iso(dob), name: name });
    }

    function text() {
      if (!current) return "";
      var L = [(current.name ? current.name + "’s" : "My puppy’s") + " vaccination dates", "Born " + short(current.dob), ""];
      current.items.forEach(function (it) { L.push("• " + when(it) + ": " + it.what); });
      L.push("", "Your vet confirms the exact plan.", "Made with the free calculator at https://www.100empire.com/puppy-vaccination-calculator");
      return L.join("\n");
    }

    function icsText() {
      var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
      function day(dt) { return iso(dt).replace(/-/g, ""); }
      function clean(s) { return String(s).replace(/\\/g, "\\\\").replace(/[,;]/g, function (c) { return "\\" + c; }).replace(/\n/g, "\\n"); }
      var who = current.name || "Puppy";
      var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//100EMPIRE//Puppy vaccinations//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
      current.items.forEach(function (it, i) {
        if (it.state === "past") return;
        var at = it.cal || it.from;
        if (at < today()) at = today();
        L.push("BEGIN:VEVENT", "UID:" + day(current.dob) + "-" + i + "-" + who.replace(/\W/g, "") + "@100empire.com", "DTSTAMP:" + stamp,
          "DTSTART;VALUE=DATE:" + day(at), "DTEND;VALUE=DATE:" + day(addDays(at, 1)),
          "SUMMARY:" + clean(who + ": " + it.what),
          "DESCRIPTION:" + clean(when(it) + ". " + it.note + " Your vet confirms the exact plan. From 100empire.com/puppy-vaccination-calculator"),
          "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:" + clean(who + ": " + it.what + " tomorrow"), "END:VALARM", "END:VEVENT");
      });
      L.push("END:VCALENDAR");
      return L.join("\r\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var dob = parseISO(dobEl.value);
      err.textContent = "";
      if (!dob) { err.textContent = "Enter your puppy’s date of birth."; dobEl.focus(); return; }
      if (dob > today()) { err.textContent = "The date of birth can’t be in the future."; dobEl.focus(); return; }
      if (dob < addMonths(today(), -60)) { err.textContent = "This calculator is for puppies and young dogs under 5 years. Ask your vet for an adult plan."; dobEl.focus(); return; }
      render(dob, nameEl.value.trim().slice(0, 40));
      try { out.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (x) { /* old browsers */ }
    });

    out.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-vax-ics], [data-vax-pdf]") : null;
      if (!t || !current) return;
      if (t.hasAttribute("data-vax-ics")) {
        var blob = new Blob([icsText()], { type: "text/calendar;charset=utf-8" });
        var a = d.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = (current.name || "puppy").replace(/[^\w-]+/g, "-").toLowerCase() + "-vaccinations.ics";
        d.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 1000);
        return;
      }
      printSheet("Vaccination dates", [
        { h: (current.name || "Puppy") + " · born " + short(current.dob), rows: current.items.map(function (it) { return [when(it), it.what + ". " + it.note]; }) }
      ], "A guide based on the 2024 WSAVA vaccination guidelines. Your vet confirms the exact plan for each dog.");
    });

    var saved = store("100e-vax");
    if (saved && saved.dob && parseISO(saved.dob)) {
      dobEl.value = saved.dob; nameEl.value = saved.name || "";
      render(parseISO(saved.dob), saved.name || "");
    }
  }

  /* ======================================================================
     2. Wedding budget planner
     ====================================================================== */
  function initBudget(root) {
    var KEY = "100e-wedding-budget";
    var PHOTO = [["Basic, photos only", 150000], ["Premium, photo and video", 350000], ["Gold, full day", 700000], ["Diamond, full day + preparations", 1200000], ["Elite, multi-day (from)", 2500000]];
    var STAT = [["Digital suite", 45000], ["Classic suite, print and digital", 95000], ["Luxury suite", 180000]];
    var DEFAULTS = [
      ["Venue or hall"], ["Food and catering"], ["Drinks"], ["Photography and video", "photo"], ["Decoration and flowers"],
      ["Canopies, chairs and rentals"], ["Bride’s dress, hair and makeup"], ["Groom’s outfit"], ["Aso ebi and family outfits"], ["Rings"],
      ["Traditional wedding list and gifts"], ["Cake"], ["Invitations and stationery", "stat"], ["MC, DJ or live band"], ["Ushers and security"],
      ["Transport and cars"], ["Souvenirs"], ["Wedding planner"], ["Honeymoon"], ["Unexpected costs"]
    ];
    var rowsEl = root.querySelector("[data-bp-rows]"), budgetEl = root.querySelector("[data-bp-budget]"), guestsEl = root.querySelector("[data-bp-guests]");
    var state = store(KEY);
    var uid = 0;
    function fresh() { return { budget: 0, guests: 0, rows: DEFAULTS.map(function (r) { return { id: ++uid, name: r[0], kind: r[1] || "", est: 0, paid: 0 }; }) }; }
    if (!state || !state.rows) state = fresh();
    state.rows.forEach(function (r) { r.id = ++uid; });

    function money(v) { return v ? Number(v).toLocaleString("en-NG") : ""; }
    function rowHTML(r) {
      var pick = "";
      var list = r.kind === "photo" ? PHOTO : r.kind === "stat" ? STAT : null;
      if (list) {
        pick = '<select class="tl-in" data-pick aria-label="Fill with a 100EMPIRE price"><option value="">Fill with a 100EMPIRE price…</option>' +
          list.map(function (o) { return '<option value="' + o[1] + '">' + esc(o[0]) + " · " + naira(o[1]) + "</option>"; }).join("") + "</select>";
      }
      return '<tr data-id="' + r.id + '"><td><input class="tl-in" data-k="name" type="text" maxlength="60" value="' + esc(r.name) + '" aria-label="Item">' + pick + "</td>" +
        '<td data-l="Estimate (₦)"><input class="tl-in" data-k="est" type="text" inputmode="numeric" value="' + money(r.est) + '" placeholder="0" aria-label="Estimate for ' + esc(r.name) + '"></td>' +
        '<td data-l="Paid (₦)"><input class="tl-in" data-k="paid" type="text" inputmode="numeric" value="' + money(r.paid) + '" placeholder="0" aria-label="Paid for ' + esc(r.name) + '"></td>' +
        '<td><button class="bp-x" type="button" data-del aria-label="Remove ' + esc(r.name) + '">×</button></td></tr>';
    }
    function drawRows() { rowsEl.innerHTML = state.rows.map(rowHTML).join(""); }
    function sums() {
      var t = 0, p = 0, due = 0;
      state.rows.forEach(function (r) { t += r.est; p += r.paid; due += Math.max(r.est - r.paid, 0); });
      return { total: t, paid: p, due: due };
    }
    function drawSum() {
      var s = sums();
      root.querySelector("[data-bp-total]").textContent = naira(s.total);
      root.querySelector("[data-bp-paid]").textContent = naira(s.paid);
      root.querySelector("[data-bp-due]").textContent = naira(s.due);
      var left = root.querySelector("[data-bp-left]");
      if (state.budget) {
        var l = state.budget - s.total;
        left.textContent = l >= 0 ? naira(l) : "Over by " + naira(-l);
        left.classList.toggle("is-over", l < 0);
      } else { left.textContent = "–"; left.classList.remove("is-over"); }
      root.querySelector("[data-bp-pg]").textContent = state.guests && s.total ? naira(s.total / state.guests) : "–";
      root.querySelector("[data-bp-bar]").style.width = (s.total ? Math.min(100, s.paid / s.total * 100) : 0) + "%";
      store(KEY, { budget: state.budget, guests: state.guests, rows: state.rows.map(function (r) { return { name: r.name, kind: r.kind, est: r.est, paid: r.paid }; }) });
    }
    function find(tr) { var id = +tr.getAttribute("data-id"); for (var i = 0; i < state.rows.length; i++) if (state.rows[i].id === id) return i; return -1; }

    budgetEl.value = money(state.budget); guestsEl.value = state.guests || "";
    drawRows(); drawSum();

    budgetEl.addEventListener("input", function () { state.budget = num(budgetEl.value); drawSum(); });
    guestsEl.addEventListener("input", function () { state.guests = num(guestsEl.value); drawSum(); });
    [budgetEl].forEach(function (el) { el.addEventListener("blur", function () { el.value = money(num(el.value)); }); });

    rowsEl.addEventListener("input", function (e) {
      var el = e.target, tr = el.closest("tr"); if (!tr) return;
      var r = state.rows[find(tr)], k = el.getAttribute("data-k"); if (!r) return;
      if (k === "name") r.name = el.value; else if (k === "est" || k === "paid") r[k] = num(el.value);
      drawSum();
    });
    rowsEl.addEventListener("change", function (e) {
      var el = e.target;
      if (el.hasAttribute("data-pick") && el.value) {
        var tr = el.closest("tr"), r = state.rows[find(tr)];
        r.est = +el.value; tr.querySelector('[data-k="est"]').value = money(r.est); el.value = ""; drawSum();
      }
    });
    rowsEl.addEventListener("focusout", function (e) {
      var el = e.target, k = el.getAttribute && el.getAttribute("data-k");
      if (k === "est" || k === "paid") el.value = money(num(el.value));
    });
    rowsEl.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-del]") : null; if (!b) return;
      var tr = b.closest("tr"), i = find(tr); if (i < 0) return;
      state.rows.splice(i, 1); tr.parentNode.removeChild(tr); drawSum();
    });
    root.querySelector("[data-bp-add]").addEventListener("click", function () {
      var r = { id: ++uid, name: "", kind: "", est: 0, paid: 0 };
      state.rows.push(r);
      rowsEl.insertAdjacentHTML("beforeend", rowHTML(r));
      var inp = rowsEl.querySelector('tr[data-id="' + r.id + '"] input'); if (inp) inp.focus();
      drawSum();
    });

    function lines() {
      var s = sums(), L = ["Our wedding budget"];
      if (state.budget) L.push("Budget: " + naira(state.budget));
      if (state.guests) L.push("Guests: " + state.guests);
      L.push("Estimated total: " + naira(s.total), "Paid so far: " + naira(s.paid), "Still to pay: " + naira(s.due));
      if (state.guests && s.total) L.push("Cost per guest: " + naira(s.total / state.guests));
      L.push("");
      state.rows.forEach(function (r) { if (r.est || r.paid) L.push("• " + (r.name || "Item") + ": " + naira(r.est) + (r.paid ? " (paid " + naira(r.paid) + ")" : "")); });
      L.push("", "Made with the free planner at https://www.100empire.com/wedding-budget-planner");
      return L;
    }
    root.querySelector("[data-bp-share]").addEventListener("click", function () {
      window.open(waShare(lines().join("\n")), "_blank", "noopener");
    });
    root.querySelector("[data-bp-pdf]").addEventListener("click", function () {
      var s = sums();
      var top = [["Estimated total", naira(s.total)], ["Paid so far", naira(s.paid)], ["Still to pay", naira(s.due)]];
      if (state.budget) top.unshift(["Budget", naira(state.budget)]);
      if (state.guests) top.push(["Guests", String(state.guests)], ["Cost per guest", s.total ? naira(s.total / state.guests) : "–"]);
      printSheet("Wedding budget", [
        { h: "Summary", rows: top },
        { h: "Items", rows: state.rows.filter(function (r) { return r.est || r.paid; }).map(function (r) { return [r.name || "Item", naira(r.est) + (r.paid ? " · paid " + naira(r.paid) : "")]; }) }
      ], "Made with the free wedding budget planner at 100empire.com/wedding-budget-planner");
    });
    var resetBtn = root.querySelector("[data-bp-reset]"), armed = null;
    resetBtn.addEventListener("click", function () {
      if (!armed) {
        resetBtn.textContent = "Tap again to clear";
        armed = setTimeout(function () { armed = null; resetBtn.textContent = "Start again"; }, 4000);
        return;
      }
      clearTimeout(armed); armed = null; resetBtn.textContent = "Start again";
      state = fresh(); budgetEl.value = ""; guestsEl.value = ""; drawRows(); drawSum();
    });
  }

  /* ======================================================================
     3. Frame size preview
     ====================================================================== */
  function initFrame(root) {
    var PRICES = [["8x10\"", 8000, 10000, 15000], ["10x12\"", 10000, 15000, 20000], ["12x16\"", 17000, 20000, 25000], ["16x20\"", 20000, 25000, 40000],
      ["20x24\"", 30000, 35000, 50000], ["24x30\"", 40000, 45000, 60000], ["30x34\"", 50000, 55000, 70000], ["34x40\"", 70000, 75000, 90000],
      ["40x50\"", 90000, 95000, 150000], ["5x7ft", 150000, 170000, 200000], ["7x9ft", 190000, 200000, 250000]];
    var TYPES = { border: 1, borderless: 2, acrylic: 3 }, NAMES = { border: "Border frame", borderless: "Borderless frame", acrylic: "Acrylic frame" };
    var WALL_W = 180, WALL_H = 135, FLOOR = 10, SOFA_W = 84, SOFA_H = 34, PERSON_H = 68, PERSON_W = 20;
    var sizeSel = root.querySelector("[data-fp-size]"), wall = root.querySelector("[data-fp-wall]"), frame = root.querySelector("[data-fp-frame]");
    var sofa = root.querySelector("[data-fp-sofa]"), person = root.querySelector("[data-fp-person]"), floor = root.querySelector("[data-fp-floor]");
    var priceEl = root.querySelector("[data-fp-price]"), order = root.querySelector("[data-fp-order]"), ask = root.querySelector("[data-fp-ask]");
    var scaleEl = root.querySelector("[data-fp-scale]"), note = root.querySelector("[data-fp-note]"), fileEl = root.querySelector("[data-fp-file]");
    var imgURL = null;

    function inches(key) {
      var ft = /ft$/.test(key), p = key.replace(/["ft]/g, "").split("x");
      var a = +p[0] * (ft ? 12 : 1), b = +p[1] * (ft ? 12 : 1);
      return [Math.min(a, b), Math.max(a, b)];
    }
    function label(key) { return key.replace("x", " × ").replace('"', " in").replace("ft", " ft"); }
    sizeSel.innerHTML = PRICES.map(function (p, i) { return '<option value="' + i + '"' + (p[0] === '16x20"' ? " selected" : "") + ">" + label(p[0]) + "</option>"; }).join("");

    function val(name) { var r = root.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ""; }

    function draw() {
      var type = val("fpType") || "border", dir = val("fpDir") || "portrait", p = PRICES[+sizeSel.value || 0];
      var wh = inches(p[0]), fw = dir === "landscape" ? wh[1] : wh[0], fh = dir === "landscape" ? wh[0] : wh[1];
      var W = wall.clientWidth || 600, s = W / WALL_W, H = WALL_H * s;
      var base = FLOOR * s;
      floor.style.height = base + "px";
      var withSofa = fh <= 60 && fw <= 110;
      sofa.style.display = withSofa ? "" : "none";
      var sofaX = WALL_W * 0.4 - SOFA_W / 2;
      sofa.style.width = SOFA_W * s + "px"; sofa.style.height = SOFA_H * s + "px";
      sofa.style.left = sofaX * s + "px"; sofa.style.bottom = base + "px";
      var cx = withSofa ? WALL_W * 0.4 : WALL_W * 0.42;
      var bottom = withSofa ? Math.max(SOFA_H + 9, 57 - fh / 2) : 14;
      if (bottom + fh > WALL_H - FLOOR - 4) bottom = Math.max(6, WALL_H - FLOOR - 4 - fh);
      var px = PERSON_W * s;
      person.style.width = px + "px"; person.style.height = PERSON_H * s + "px"; person.style.bottom = base + "px";
      var personX = Math.max(cx + fw / 2 + 10, withSofa ? sofaX + SOFA_W + 14 : 0);
      person.style.left = Math.min(personX, WALL_W - PERSON_W - 4) * s + "px";
      frame.style.width = fw * s + "px"; frame.style.height = fh * s + "px";
      frame.style.left = (cx - fw / 2) * s + "px"; frame.style.bottom = base + bottom * s + "px";
      frame.style.borderWidth = type === "border" ? Math.max(3, (fh >= 60 ? 2.6 : 1.3) * s) + "px" : "0";
      frame.className = "fp-frame is-" + type;
      wall.style.height = H + "px";
      var price = p[TYPES[type]];
      priceEl.textContent = naira(price);
      order.href = "/pay?item=frames--" + type + "--" + p[0].replace('"', "");
      ask.href = "https://wa.me/2347039934163?text=" + encodeURIComponent("Hello 100EMPIRE, I would like to order 1 x " + NAMES[type] + " (" + p[0] + "). Estimate: " + naira(price) + ".");
      scaleEl.textContent = "Wall 4.6 m wide";
      note.textContent = "Drawn to scale: " + label(p[0]) + " " + dir + ", on a wall 4.6 m wide" + (withSofa ? ", above a 2.1 m sofa," : ",") + " next to a 1.7 m person.";
      wall.setAttribute("role", "img");
      wall.setAttribute("aria-label", "Preview of a " + label(p[0]) + " " + NAMES[type].toLowerCase() + " on a wall" + (withSofa ? " above a sofa" : ""));
    }

    function setPhoto(url, isSample) {
      frame.innerHTML = '<img alt="' + (isSample ? "Sample photo" : "Your photo") + '" src="' + url + '">';
    }

    fileEl.addEventListener("change", function () {
      var f = fileEl.files && fileEl.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      if (imgURL) URL.revokeObjectURL(imgURL);
      imgURL = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () {
        var dir = im.naturalWidth > im.naturalHeight ? "landscape" : "portrait";
        var r = root.querySelector('input[name="fpDir"][value="' + dir + '"]'); if (r) r.checked = true;
        setPhoto(imgURL, false); draw();
      };
      im.src = imgURL;
    });
    root.addEventListener("change", function (e) { if (e.target !== fileEl) draw(); });
    setPhoto("/assets/img/photos/weddings-s.webp", true);
    draw();
    if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(wall.parentNode);
    else window.addEventListener("resize", draw);
  }

  var v = d.querySelector('[data-tool="vax"]'); if (v) initVax(v);
  var b = d.querySelector('[data-tool="budget"]'); if (b) initBudget(b);
  var f = d.querySelector('[data-tool="frame"]'); if (f) initFrame(f);
})();
