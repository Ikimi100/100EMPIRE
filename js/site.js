/* =====================================================================
   100EMPIRE — site behaviour (every page). Small and dependency-free.
   Header · menu · showreel hero · reel rail · reveals · photo slots ·
   quote builder · frame estimator · work filter · copy buttons
   ===================================================================== */
(function () {
    'use strict';
    var d = document, root = d.documentElement;
    root.classList.add('js');
    var WA = '2347039934163';
    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

    function ready(fn) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn); else fn(); }
    function $(s, c) { return (c || d).querySelector(s); }
    function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
    function naira(n) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
    function waLink(msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); }

    ready(function () {
        /* ---------- Header: transparent over the hero, solid bar on scroll ---------- */
        var header = $('[data-eh]');
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
                root.classList.toggle('wa-on', window.scrollY > window.innerHeight * 0.55);
                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* ---------- Current page ---------- */
        var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (here.indexOf('.') === -1) here = (here || 'index') + '.html';
        $$('[data-nav] a').forEach(function (a) {
            var target = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
            if (target && target === here) a.setAttribute('aria-current', 'page');
        });

        /* ---------- Full-screen menu ---------- */
        var menu = $('#emMenu');
        var openBtn = $('[data-menu-open]');
        var closeBtn = menu ? $('[data-menu-close]', menu) : null;
        var lastFocus = null;
        function focusables() { return $$('a[href], button:not([disabled])', menu); }
        function openMenu() {
            if (!menu) return;
            lastFocus = d.activeElement;
            menu.hidden = false;
            requestAnimationFrame(function () { menu.classList.add('is-open'); root.classList.add('is-locked'); });
            if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
            setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
        }
        function closeMenu() {
            if (!menu || menu.hidden) return;
            menu.classList.remove('is-open');
            root.classList.remove('is-locked');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
            setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce.matches ? 0 : 420);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        if (openBtn) openBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (menu) {
            menu.addEventListener('click', function (e) {
                var a = e.target.closest ? e.target.closest('a') : null;
                if (a) closeMenu();
            });
            menu.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
                if (e.key !== 'Tab') return;
                var f = focusables(); if (!f.length) return;
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
            });
        }

        /* ---------- Home hero: opening, reel, timecode, scene, parallax ---------- */
        var hx = $('[data-hx]');
        if (hx) {
            requestAnimationFrame(function () { setTimeout(function () { hx.classList.add('is-ready'); }, 40); });
            var slides = $$('.hx-slide', hx);
            var sceneN = $('[data-scene-n]', hx), sceneName = $('[data-scene]', hx), tc = $('[data-tc]', hx);
            var cur = 0, heroVisible = true, timer = null;
            var saveData = navigator.connection && navigator.connection.saveData;
            var narrow = window.innerWidth < 760;
            function srcFor(el) {
                var u = el.getAttribute('data-img') || '';
                return narrow ? u.replace(/([?&])w=\d+/, '$1w=1280') : u;
            }
            function load(el, cb) {
                if (!el.hasAttribute('data-img')) { cb(); return; }
                var u = srcFor(el), im = new Image();
                try { u = new URL(u, location.href).href; } catch (e) { }
                im.onload = function () { el.style.setProperty('--img', 'url("' + u + '")'); el.removeAttribute('data-img'); cb(); };
                im.onerror = function () { el.removeAttribute('data-img'); el.classList.add('is-broken'); cb(); };
                im.src = u;
            }
            function show(i) {
                slides[cur].classList.remove('is-on');
                cur = i;
                slides[cur].classList.add('is-on');
                if (sceneN) sceneN.textContent = (cur < 9 ? '0' : '') + (cur + 1);
                if (sceneName) sceneName.textContent = slides[cur].getAttribute('data-name') || '';
            }
            function next() {
                var n = cur, tries = 0;
                do { n = (n + 1) % slides.length; tries++; } while (slides[n].classList.contains('is-broken') && tries < slides.length);
                load(slides[n], function () { if (!slides[n].classList.contains('is-broken')) show(n); });
            }
            function play() { if (!timer && slides.length > 1 && heroVisible && !d.hidden) timer = setInterval(next, 5600); }
            function stop() { clearInterval(timer); timer = null; }
            if (!reduce.matches && !saveData) {
                setTimeout(function () { load(slides[1] || slides[0], function () { }); }, 1800);
                play();
                d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else play(); });
            }
            /* film timecode (HH:MM:SS:FF at 24 fps) */
            var t0 = Date.now(), tcTimer = null;
            function pad(n) { return (n < 10 ? '0' : '') + n; }
            function tick() {
                var ms = Date.now() - t0, s = Math.floor(ms / 1000), f = Math.floor((ms % 1000) / 1000 * 24);
                tc.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(f);
            }
            function tcPlay() { if (tc && !tcTimer && !reduce.matches) tcTimer = setInterval(tick, 1000 / 24); }
            function tcStop() { clearInterval(tcTimer); tcTimer = null; }
            tcPlay();
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (en) {
                    heroVisible = en[0].isIntersecting;
                    if (heroVisible) { play(); tcPlay(); } else { stop(); tcStop(); }
                }).observe(hx);
            }
            /* parallax: the name drifts slower than the page */
            if (!reduce.matches) {
                var pTick = false;
                window.addEventListener('scroll', function () {
                    if (pTick || !heroVisible) return;
                    pTick = true;
                    requestAnimationFrame(function () { hx.style.setProperty('--py', Math.min(window.scrollY, hx.offsetHeight)); pTick = false; });
                }, { passive: true });
            }
        }
        /* legacy hero */
        var hero = $('.e-hero');
        if (hero) setTimeout(function () { hero.classList.add('is-ready'); }, 60);

        /* ---------- Reel rail: arrows, mouse drag, filter chips ---------- */
        $$('[data-rail]').forEach(function (rail) {
            var sec = rail.closest('section') || d;
            var prev = $('[data-rail-prev]', sec), nxt = $('[data-rail-next]', sec);
            function step() {
                var c = $('.rc:not([hidden])', rail);
                if (!c) return rail.clientWidth * 0.8;
                var w = c.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 12);
                return w * Math.max(1, Math.floor(rail.clientWidth / w));
            }
            function edges() {
                var max = rail.scrollWidth - rail.clientWidth - 2;
                if (prev) prev.disabled = rail.scrollLeft <= 2;
                if (nxt) nxt.disabled = rail.scrollLeft >= max;
            }
            var beh = reduce.matches ? 'auto' : 'smooth';
            if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: beh }); });
            if (nxt) nxt.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: beh }); });
            rail.addEventListener('scroll', function () { requestAnimationFrame(edges); }, { passive: true });
            window.addEventListener('resize', edges);
            edges();
            /* drag with a mouse (touch already swipes natively) */
            var down = false, moved = false, sx = 0, sl = 0;
            rail.addEventListener('pointerdown', function (e) {
                if (e.pointerType !== 'mouse' || e.button !== 0) return;
                down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft;
            });
            window.addEventListener('pointermove', function (e) {
                if (!down) return;
                var dx = e.clientX - sx;
                if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('is-drag'); }
                if (moved) { rail.scrollLeft = sl - dx; e.preventDefault(); }
            });
            window.addEventListener('pointerup', function () {
                if (!down) return;
                down = false;
                if (moved) rail.classList.remove('is-drag');
            });
            rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
            rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
            /* filter chips */
            var chips = $$('[data-rf]', sec);
            chips.forEach(function (c) {
                c.addEventListener('click', function () {
                    var f = c.getAttribute('data-rf');
                    chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
                    $$('.rc', rail).forEach(function (card) { card.hidden = !(f === 'all' || card.getAttribute('data-group') === f); });
                    rail.scrollTo({ left: 0, behavior: 'auto' });
                    edges();
                });
            });
        });

        /* ---------- Gentle settle-in for sections (content is visible at rest) ---------- */
        var rs = $$('[data-r]');
        if ('IntersectionObserver' in window && !reduce.matches) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
            }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
            rs.forEach(function (el) { io.observe(el); });
        } else {
            rs.forEach(function (el) { el.classList.add('in'); });
        }

        /* ---------- Photo slots: drop a real photo into /img and it replaces the illustration ---------- */
        $$('[data-photo]').forEach(function (el) {
            var src = el.getAttribute('data-photo');
            if (!src) return;
            var img = new Image();
            var abs = src;
            try { abs = new URL(src, location.href).href; } catch (e) { }
            img.onload = function () { el.style.setProperty('--photo', 'url("' + abs + '")'); el.classList.add('has-photo'); };
            img.src = src;
        });

        /* ---------- Copy buttons ---------- */
        $$('[data-copy]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var text = btn.getAttribute('data-copy');
                var done = function () { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1600); };
                var fail = function () { var t = btn.textContent; btn.textContent = 'Select & copy'; setTimeout(function () { btn.textContent = t; }, 2000); };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done, fail);
                } else { fail(); }
            });
        });

        /* ---------- Quote builder (contact page): writes a WhatsApp message ---------- */
        var qf = $('#quoteForm');
        if (qf) {
            var out = $('#quoteOut'), pre = $('#quotePre'), go = $('#quoteGo'), mail = $('#quoteMail'), cp = $('#quoteCopy');
            var params = new URLSearchParams(location.search);
            var pre_s = params.get('service');
            if (pre_s) { var sel = $('#q-service'); if (sel) { $$('option', sel).forEach(function (o) { if (o.value === pre_s) sel.value = pre_s; }); } }
            qf.addEventListener('submit', function (e) {
                e.preventDefault();
                var v = function (id) { var el = $('#' + id); return el ? el.value.trim() : ''; };
                var lines = ['Hello 100EMPIRE, I would like a quote.', ''];
                if (v('q-name')) lines.push('Name: ' + v('q-name'));
                if (v('q-phone')) lines.push('Phone: ' + v('q-phone'));
                lines.push('Service: ' + (v('q-service') || 'Not sure yet'));
                if (v('q-budget')) lines.push('Budget: ' + v('q-budget'));
                if (v('q-date')) lines.push('Date needed: ' + v('q-date'));
                if (v('q-location')) lines.push('Location: ' + v('q-location'));
                if (v('q-details')) { lines.push(''); lines.push(v('q-details')); }
                var msg = lines.join('\n');
                pre.textContent = msg;
                go.href = waLink(msg);
                if (mail) mail.href = 'mailto:hello@100empire.com?subject=' + encodeURIComponent('Quote request: ' + (v('q-service') || '100EMPIRE')) + '&body=' + encodeURIComponent(msg);
                if (cp) cp.setAttribute('data-copy-live', msg);
                out.hidden = false;
                out.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'center' });
            });
            if (cp) cp.addEventListener('click', function () {
                var text = cp.getAttribute('data-copy-live') || '';
                var t = cp.textContent;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () { cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = t; }, 1600); }, function () {
                        var r = d.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
                    });
                }
            });
        }

        /* ---------- Frame estimator ---------- */
        var est = $('#frameEst');
        if (est) {
            var data = JSON.parse(est.getAttribute('data-prices'));
            var typeBtns = $$('[data-ftype]', est), sizeSel = $('#f-size', est), qty = $('#f-qty', est);
            var frame = $('.e-est-frame', est), label = $('.e-est-frame span', est), total = $('#f-total', est), each = $('#f-each', est), order = $('#f-order', est);
            var type = 'border';
            var names = { border: 'Border frame', borderless: 'Borderless frame', acrylic: 'Acrylic frame' };
            function dims(s) {
                var m = s.match(/([\d.]+)\s*x\s*([\d.]+)\s*(ft)?/i); if (!m) return [8, 10];
                var a = parseFloat(m[1]), b = parseFloat(m[2]); if (m[3]) { a *= 12; b *= 12; } return [a, b];
            }
            function render() {
                var i = sizeSel.selectedIndex, row = data[i], q = Math.max(1, parseInt(qty.value, 10) || 1);
                var price = row[type];
                var dm = dims(row.size), w = dm[0], h = dm[1];
                var scale = Math.min(86, 26 + Math.sqrt(w * h) * 0.62);
                frame.style.width = scale + '%';
                frame.style.aspectRatio = w + ' / ' + h;
                frame.setAttribute('data-type', type);
                label.textContent = row.size;
                each.textContent = naira(price) + ' each';
                total.textContent = naira(price * q);
                order.href = waLink('Hello 100EMPIRE, I would like to order ' + q + ' x ' + names[type] + ' (' + row.size + '). Estimate: ' + naira(price * q) + '.');
                typeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ftype') === type)); });
            }
            typeBtns.forEach(function (b) { b.addEventListener('click', function () { type = b.getAttribute('data-ftype'); render(); }); });
            sizeSel.addEventListener('change', render);
            qty.addEventListener('input', render);
            render();
        }

        /* ---------- Work filter ---------- */
        var wf = $('[data-filter]');
        if (wf) {
            var chips = $$('[data-f]', wf), items = $$('[data-cat]');
            chips.forEach(function (c) {
                c.addEventListener('click', function () {
                    var f = c.getAttribute('data-f');
                    chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
                    items.forEach(function (it) { it.hidden = !(f === 'all' || (' ' + it.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1); });
                });
            });
        }

        /* ---------- Year ---------- */
        $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
    });
})();
