/* timeline.js — reads from the global `translations` / `currentLang`
   defined in the inline <script> in index.html                         */
(function () {
    'use strict';

    // Static metadata — year + major flag (not stored in translations)
    var ITEMS = [
        { id: 1,  year: '2009', major: true  },
        { id: 2,  year: '2016', major: true  },
        { id: 3,  year: '2017', major: false },
        { id: 4,  year: '2018', major: false },
        { id: 5,  year: '2019', major: false },
        { id: 6,  year: '2020', major: true  },
        { id: 7,  year: '2021', major: false },
        { id: 8,  year: '2022', major: true  },
        { id: 9,  year: '2023', major: true  },
        { id: 10, year: '2024', major: false },
        { id: 11, year: '2025', major: true  },
    ];

    // ── i18n helpers ─────────────────────────────────────────────────────────
    function t(lang, key) {
        /* translations is const in the inline script; accessible here via
           the shared global lexical environment of non-module <script> tags */
        return (translations && translations[lang] && translations[lang][key]) || '';
    }

    function getBullets(lang, id) {
        var bullets = [];
        for (var i = 1; i <= 6; i++) {
            var b = t(lang, 'tl' + id + '.b' + i);
            if (!b) break;
            bullets.push(b);
        }
        return bullets;
    }

    // ── Open / close helpers ─────────────────────────────────────────────────
    function openItem(item) {
        var btn  = item.querySelector('.tl-dot');
        var card = item.querySelector('.tl-card');
        item.classList.add('tl-open');
        if (btn)  btn.setAttribute('aria-expanded', 'true');
        if (card) card.setAttribute('aria-hidden', 'false');
    }

    function closeItem(item) {
        var btn  = item.querySelector('.tl-dot');
        var card = item.querySelector('.tl-card');
        item.classList.remove('tl-open');
        if (btn)  btn.setAttribute('aria-expanded', 'false');
        if (card) card.setAttribute('aria-hidden', 'true');
    }

    function closeAll() {
        document.querySelectorAll('#timeline-root .tl-item.tl-open')
            .forEach(closeItem);
    }

    // ── Per-dot event wiring ─────────────────────────────────────────────────
    function attachEvents(btn, item, card) {
        var open = function () { closeAll(); openItem(item); };
        var closeIfLeft = function (e) {
            if (!item.contains(e.relatedTarget)) closeItem(item);
        };

        // Hover (desktop)
        btn.addEventListener('mouseenter', open);
        btn.addEventListener('mouseleave', closeIfLeft);
        card.addEventListener('mouseleave', closeIfLeft);

        // Keyboard
        btn.addEventListener('focus', open);
        btn.addEventListener('blur',  closeIfLeft);

        // Click / tap — toggle; on mobile this is the primary interaction
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            item.classList.contains('tl-open') ? closeItem(item) : open();
        });
    }

    // ── Main render ──────────────────────────────────────────────────────────
    function renderTimeline(lang) {
        var titleEl    = document.getElementById('timeline-title');
        var subtitleEl = document.getElementById('timeline-subtitle');
        var root       = document.getElementById('timeline-root');
        if (!root) return;

        if (titleEl)    titleEl.textContent    = t(lang, 'nav.timeline');
        if (subtitleEl) subtitleEl.textContent = t(lang, 'tl.hint');

        root.innerHTML = '';
        var track = document.createElement('div');
        track.className = 'tl-track';

        ITEMS.forEach(function (meta, idx) {
            var title   = t(lang, 'tl' + meta.id + '.title');
            var period  = t(lang, 'tl' + meta.id + '.period');
            var desc    = t(lang, 'tl' + meta.id + '.desc');
            var bullets = getBullets(lang, meta.id);
            var cardId  = 'tl-card-' + meta.id;
            var pos     = idx % 2 === 0 ? 'tl-pos-above' : 'tl-pos-below';

            var item = document.createElement('div');
            item.className = 'tl-item' +
                (meta.major ? ' tl-major' : ' tl-minor') + ' ' + pos;

            // Card / tooltip
            var card = document.createElement('div');
            card.className = 'tl-card';
            card.id = cardId;
            card.setAttribute('role', 'tooltip');
            card.setAttribute('aria-hidden', 'true');

            var html = '<strong class="tl-card-title">' + title + '</strong>';
            if (period) html += '<span class="tl-card-period">' + period + '</span>';
            if (desc)   html += '<p class="tl-card-desc">' + desc + '</p>';
            if (bullets.length) {
                html += '<ul>' + bullets.map(function (b) {
                    return '<li>' + b + '</li>';
                }).join('') + '</ul>';
            }
            card.innerHTML = html;

            // Dot button (focusable)
            var btn = document.createElement('button');
            btn.className = 'tl-dot';
            btn.type = 'button';
            btn.setAttribute('aria-label', meta.year + ': ' + title);
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', cardId);

            // Year label
            var yearEl = document.createElement('span');
            yearEl.className = 'tl-year';
            yearEl.setAttribute('aria-hidden', 'true');
            yearEl.textContent = meta.year;

            item.appendChild(card);
            item.appendChild(btn);
            item.appendChild(yearEl);
            track.appendChild(item);

            attachEvents(btn, item, card);
        });

        root.appendChild(track);
    }

    // ── Bootstrap ────────────────────────────────────────────────────────────
    // currentLang is `let` from the inline script — accessible here
    renderTimeline(currentLang);

    // Re-render when user switches language (additive listener; safe alongside
    // the existing setLanguage() call on the same buttons)
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            renderTimeline(btn.dataset.lang);
        });
    });
}());
