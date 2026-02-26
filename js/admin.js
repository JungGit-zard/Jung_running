(function () {
  'use strict';

  const STORAGE = {
    OPTIONS: 'jg_options',
    HIGHSCORES: 'jg_highscores',
    COLLECTION: 'jg_collection'
  };

  const DEFAULT_OPTIONS = {
    bgmVolume: 0.7,
    sfxVolume: 0.8,
    bgmEnabled: true,
    sfxEnabled: true,
    fullscreen: false,
    graphicsQuality: 'high',
    clearDistance: 200
  };

  const DEFAULT_SCORES = [
    { name: 'AAA', score: 5000 },
    { name: 'AAA', score: 4000 },
    { name: 'AAA', score: 3000 },
    { name: 'AAA', score: 2000 },
    { name: 'AAA', score: 1000 }
  ];

  const state = {
    options: { ...DEFAULT_OPTIONS },
    highScores: [],
    collection: {}
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function toast(message) {
    const t = byId('toast');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      t.classList.remove('show');
    }, 1400);
  }

  function safeRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loadAll() {
    const loadedOptions = safeRead(STORAGE.OPTIONS, DEFAULT_OPTIONS);
    state.options = { ...DEFAULT_OPTIONS, ...loadedOptions };
    const loadedScores = safeRead(STORAGE.HIGHSCORES, DEFAULT_SCORES);
    state.highScores = Array.isArray(loadedScores) ? loadedScores : [...DEFAULT_SCORES];
    const loadedCollection = safeRead(STORAGE.COLLECTION, {});
    state.collection = loadedCollection && typeof loadedCollection === 'object' ? loadedCollection : {};
  }

  function renderOverview() {
    const discovered = Object.values(state.collection).filter(function (v) {
      return v && v.discovered;
    }).length;
    const cards = [
      ['High Score Rows', String(state.highScores.length)],
      ['Discovered Foods', String(discovered)],
      ['Clear Distance', state.options.clearDistance + 'm'],
      ['BGM', state.options.bgmEnabled ? 'ON' : 'OFF'],
      ['SFX', state.options.sfxEnabled ? 'ON' : 'OFF'],
      ['Graphics', String(state.options.graphicsQuality).toUpperCase()]
    ];
    byId('overviewCards').innerHTML = cards.map(function (card) {
      return '<article class="card"><div class="k">' + card[0] + '</div><div class="v">' + card[1] + '</div></article>';
    }).join('');
  }

  function renderOptionsForm() {
    const o = state.options;
    const html = [
      fieldToggle('BGM Enabled', 'bgmEnabled', o.bgmEnabled),
      fieldRange('BGM Volume', 'bgmVolume', Math.round(o.bgmVolume * 100), 0, 100, '%'),
      fieldToggle('SFX Enabled', 'sfxEnabled', o.sfxEnabled),
      fieldRange('SFX Volume', 'sfxVolume', Math.round(o.sfxVolume * 100), 0, 100, '%'),
      fieldNumber('Clear Distance (m)', 'clearDistance', o.clearDistance, 100, 1000, 50),
      fieldSelect('Graphics Quality', 'graphicsQuality', o.graphicsQuality, ['low', 'medium', 'high']),
      fieldToggle('Fullscreen', 'fullscreen', !!o.fullscreen)
    ];
    byId('optionsForm').innerHTML = html.join('');
  }

  function fieldToggle(label, key, checked) {
    return '<div class="field"><label for="' + key + '">' + label + '</label>' +
      '<input id="' + key + '" type="checkbox" ' + (checked ? 'checked' : '') + '></div>';
  }

  function fieldRange(label, key, value, min, max, suffix) {
    return '<div class="field"><label for="' + key + '">' + label + '</label>' +
      '<input id="' + key + '" type="range" min="' + min + '" max="' + max + '" value="' + value + '">' +
      '<div class="muted"><span id="' + key + '_value">' + value + '</span>' + suffix + '</div></div>';
  }

  function fieldNumber(label, key, value, min, max, step) {
    return '<div class="field"><label for="' + key + '">' + label + '</label>' +
      '<input id="' + key + '" type="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
  }

  function fieldSelect(label, key, value, options) {
    const opts = options.map(function (opt) {
      return '<option value="' + opt + '" ' + (opt === value ? 'selected' : '') + '>' + opt.toUpperCase() + '</option>';
    }).join('');
    return '<div class="field"><label for="' + key + '">' + label + '</label><select id="' + key + '">' + opts + '</select></div>';
  }

  function bindOptionLiveLabels() {
    ['bgmVolume', 'sfxVolume'].forEach(function (k) {
      const range = byId(k);
      const value = byId(k + '_value');
      if (!range || !value) return;
      range.addEventListener('input', function () {
        value.textContent = range.value;
      });
    });
  }

  function readOptionsFromForm() {
    const bgmVol = Number(byId('bgmVolume').value) / 100;
    const sfxVol = Number(byId('sfxVolume').value) / 100;
    return {
      ...state.options,
      bgmEnabled: !!byId('bgmEnabled').checked,
      sfxEnabled: !!byId('sfxEnabled').checked,
      fullscreen: !!byId('fullscreen').checked,
      graphicsQuality: byId('graphicsQuality').value,
      bgmVolume: clamp(bgmVol, 0, 1),
      sfxVolume: clamp(sfxVol, 0, 1),
      clearDistance: clamp(Math.round(Number(byId('clearDistance').value) / 50) * 50, 100, 1000)
    };
  }

  function renderScores() {
    const body = byId('scoreTableBody');
    body.innerHTML = state.highScores.map(function (row, idx) {
      const safeName = String(row.name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'AAA';
      const safeScore = Number(row.score) || 0;
      return '<tr data-index="' + idx + '">' +
        '<td>' + (idx + 1) + '</td>' +
        '<td><input type="text" class="score-name" value="' + safeName + '" maxlength="3"></td>' +
        '<td><input type="number" class="score-value" min="0" step="1" value="' + safeScore + '"></td>' +
        '<td><button type="button" class="btn btn-danger btn-row-delete">Delete</button></td>' +
        '</tr>';
    }).join('');
  }

  function collectScoresFromTable() {
    const rows = Array.from(byId('scoreTableBody').querySelectorAll('tr'));
    const out = rows.map(function (tr) {
      const nameInput = tr.querySelector('.score-name');
      const scoreInput = tr.querySelector('.score-value');
      const name = String(nameInput.value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A');
      const score = Math.max(0, Math.floor(Number(scoreInput.value) || 0));
      return { name: name, score: score };
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 20);
  }

  function renderCollection() {
    const list = byId('collectionList');
    const entries = Object.entries(state.collection).filter(function (entry) {
      return entry[1] && entry[1].discovered;
    }).sort(function (a, b) {
      return (b[1].count || 0) - (a[1].count || 0);
    });

    if (entries.length === 0) {
      list.innerHTML = '<li>No discovered items yet.</li>';
      return;
    }

    list.innerHTML = entries.map(function (entry) {
      const emoji = entry[0];
      const data = entry[1];
      const count = data.count || 0;
      const first = data.firstFound ? String(data.firstFound).slice(0, 10) : '-';
      const last = data.lastFound ? String(data.lastFound).slice(0, 10) : '-';
      return '<li>' + emoji + ' - count: ' + count + ' | first: ' + first + ' | last: ' + last + '</li>';
    }).join('');
  }

  function renderRaw() {
    const payload = {
      [STORAGE.OPTIONS]: state.options,
      [STORAGE.HIGHSCORES]: state.highScores,
      [STORAGE.COLLECTION]: state.collection
    };
    byId('rawJson').value = JSON.stringify(payload, null, 2);
  }

  function renderAll() {
    renderOverview();
    renderOptionsForm();
    renderScores();
    renderCollection();
    renderRaw();
    bindOptionLiveLabels();
  }

  function wireEvents() {
    byId('btnReload').addEventListener('click', function () {
      loadAll();
      renderAll();
      toast('Reloaded from localStorage');
    });

    byId('btnOptionsSave').addEventListener('click', function () {
      state.options = readOptionsFromForm();
      saveJson(STORAGE.OPTIONS, state.options);
      renderAll();
      toast('Options saved');
    });

    byId('btnOptionsDefault').addEventListener('click', function () {
      state.options = { ...DEFAULT_OPTIONS };
      saveJson(STORAGE.OPTIONS, state.options);
      renderAll();
      toast('Options reset');
    });

    byId('btnAddScore').addEventListener('click', function () {
      state.highScores.push({ name: 'AAA', score: 0 });
      renderScores();
    });

    byId('btnSortScore').addEventListener('click', function () {
      state.highScores = collectScoresFromTable();
      renderScores();
      toast('Scores sorted');
    });

    byId('btnClearScore').addEventListener('click', function () {
      state.highScores = [];
      saveJson(STORAGE.HIGHSCORES, state.highScores);
      renderAll();
      toast('Scores cleared');
    });

    byId('btnSaveScore').addEventListener('click', function () {
      state.highScores = collectScoresFromTable();
      saveJson(STORAGE.HIGHSCORES, state.highScores);
      renderAll();
      toast('Scores saved');
    });

    byId('scoreTableBody').addEventListener('click', function (e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains('btn-row-delete')) return;
      const tr = target.closest('tr');
      if (!tr) return;
      const idx = Number(tr.dataset.index);
      if (Number.isNaN(idx)) return;
      state.highScores.splice(idx, 1);
      renderScores();
    });

    byId('btnCollectionReset').addEventListener('click', function () {
      state.collection = {};
      saveJson(STORAGE.COLLECTION, state.collection);
      renderAll();
      toast('Collection reset');
    });

    byId('btnRawRefresh').addEventListener('click', function () {
      renderRaw();
      toast('JSON refreshed');
    });

    byId('btnRawSave').addEventListener('click', function () {
      try {
        const payload = JSON.parse(byId('rawJson').value);
        if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
        if (payload[STORAGE.OPTIONS]) {
          state.options = { ...DEFAULT_OPTIONS, ...payload[STORAGE.OPTIONS] };
          saveJson(STORAGE.OPTIONS, state.options);
        }
        if (Array.isArray(payload[STORAGE.HIGHSCORES])) {
          state.highScores = payload[STORAGE.HIGHSCORES];
          saveJson(STORAGE.HIGHSCORES, state.highScores);
        }
        if (payload[STORAGE.COLLECTION] && typeof payload[STORAGE.COLLECTION] === 'object') {
          state.collection = payload[STORAGE.COLLECTION];
          saveJson(STORAGE.COLLECTION, state.collection);
        }
        renderAll();
        toast('JSON applied');
      } catch (err) {
        toast('Invalid JSON');
      }
    });
  }

  loadAll();
  renderAll();
  wireEvents();
})();
