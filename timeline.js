/* timeline.js — reads from the global `translations` / `currentLang`
   defined in the inline <script> in index.html                         */
(function () {
    'use strict';

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
        { id: 10, year: '2024', major: true  },
        { id: 11, year: '2025', major: true  },
        { id: 12, year: '2026', major: false },
    ];

    var selectedIndex = 0;

    // ── i18n helpers ─────────────────────────────────────────────────────────
    function t(lang, key) {
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

    // ── Panel render ─────────────────────────────────────────────────────────
    function renderPanel(lang) {
        var panel = document.getElementById('tl-panel');
        if (!panel) return;

        var meta    = ITEMS[selectedIndex];
        var title   = t(lang, 'tl' + meta.id + '.title');
        var period  = t(lang, 'tl' + meta.id + '.period');
        var desc    = t(lang, 'tl' + meta.id + '.desc');
        var bullets = getBullets(lang, meta.id);

        var html = '<strong class="tl-panel-title">' + title + '</strong>';
        if (period) html += '<span class="tl-panel-period">' + period + '</span>';
        if (desc)   html += '<p class="tl-panel-desc">' + desc + '</p>';
        if (bullets.length) {
            html += '<ul>' + bullets.map(function (b) {
                return '<li>' + b + '</li>';
            }).join('') + '</ul>';
        }
        panel.innerHTML = html;
    }

    // ── Select a dot ─────────────────────────────────────────────────────────
    function selectDot(idx, lang) {
        selectedIndex = idx;
        document.querySelectorAll('#timeline-root .tl-dot').forEach(function (d, i) {
            d.classList.toggle('tl-dot-active', i === idx);
            d.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
        });
        renderPanel(lang);
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
            var title = t(lang, 'tl' + meta.id + '.title');

            var item = document.createElement('div');
            item.className = 'tl-item' + (meta.major ? ' tl-major' : ' tl-minor');

            var btn = document.createElement('button');
            btn.className = 'tl-dot' + (idx === selectedIndex ? ' tl-dot-active' : '');
            btn.type = 'button';
            btn.setAttribute('aria-label', meta.year + ': ' + title);
            btn.setAttribute('aria-pressed', idx === selectedIndex ? 'true' : 'false');

            var yearEl = document.createElement('span');
            yearEl.className = 'tl-year';
            yearEl.setAttribute('aria-hidden', 'true');
            yearEl.textContent = meta.year;

            btn.addEventListener('mouseenter', function () { selectDot(idx, lang); });
            btn.addEventListener('focus',      function () { selectDot(idx, lang); });
            btn.addEventListener('click',      function () { selectDot(idx, lang); });

            item.appendChild(btn);
            item.appendChild(yearEl);
            track.appendChild(item);
        });

        root.appendChild(track);
        renderPanel(lang);
    }

    // ── Bootstrap ────────────────────────────────────────────────────────────
    renderTimeline(currentLang);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            renderTimeline(btn.dataset.lang);
        });
    });
}());
