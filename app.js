(() => {
  // Internal note names (always English internally)
  const ROOTS = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const CHORD_TYPES = {
    major: '',    // C
    minor: 'm',   // Cm
    dom7: '7',    // C7
    maj7: 'maj7', // Cmaj7
    min7: 'm7',   // Cm7
    sus2: 'sus2', // Csus2
    sus4: 'sus4', // Csus4
  };

  // Language + localization mapping
  let lang = 'en'; // 'en' or 'fr'
  const NOTE_FR = {
    C: 'Do', Db: 'Ré♭', D: 'Ré', Eb: 'Mi♭', E: 'Mi', F: 'Fa',
    Gb: 'Sol♭', G: 'Sol', Ab: 'La♭', A: 'La', Bb: 'Si♭', B: 'Si'
  };

  // Single source of truth for the currently active chord (EN symbol)
  let currentChord = null;

  // DOM refs
  const elBpm = document.getElementById('bpm');
  const elBpc = document.getElementById('bpc');
  const elToggle = document.getElementById('toggle');
  const elStatus = document.getElementById('status');
  const elChord = document.getElementById('chord');
  const elRoots = document.getElementById('roots');
  const elLang = document.getElementById('lang-toggle');

  // State
  let isRunning = false;
  let timer = null;
  const enabledRoots = new Set(ROOTS);
  const selectedTypes = new Set();

  // Initialize chord type checkboxes
  document.querySelectorAll('input[type="checkbox"][data-type]').forEach(cb => {
    if (cb.checked) selectedTypes.add(cb.dataset.type);
    cb.addEventListener('change', () => {
      if (cb.checked) selectedTypes.add(cb.dataset.type);
      else selectedTypes.delete(cb.dataset.type);
      if (isRunning) restart();
    });
  });

  // Build root toggle buttons once
  for (const r of ROOTS) {
    const btn = document.createElement('button');
    btn.className = 'root-toggle active';
    btn.textContent = r;        // will update on language change
    btn.dataset.root = r;       // keep EN root internally
    btn.addEventListener('click', () => {
      if (enabledRoots.has(r)) {
        enabledRoots.delete(r);
        btn.classList.remove('active');
      } else {
        enabledRoots.add(r);
        btn.classList.add('active');
      }
      if (isRunning) restart();
    });
    elRoots.appendChild(btn);
  }

  // Controls
  elToggle.addEventListener('click', () => (isRunning ? stop() : start()));
  elBpm.addEventListener('change', () => {
    elBpm.value = clamp(+elBpm.value || 80, 20, 300);
    if (isRunning) restart();
  });
  elBpc.addEventListener('change', () => {
    elBpc.value = clamp(+elBpc.value || 4, 1, 16);
    if (isRunning) restart();
  });

  elLang.addEventListener('click', () => {
    lang = (lang === 'en') ? 'fr' : 'en';
    elLang.textContent = (lang === 'en') ? 'EN' : 'FR';
    relabelRootButtons();
    renderChord(); // redisplay current chord in the new language
  });

  // Start/Stop/Restart
  function start() {
    if (!selectedTypes.size) return alert('Select at least one chord type.');
    if (!enabledRoots.size) return alert('Enable at least one root.');
    isRunning = true;
    elToggle.textContent = 'Stop';
    elToggle.classList.add('stop');
    updateStatus();
    showRandomChord();
    timer = setInterval(showRandomChord, beatsToMs(+elBpc.value, +elBpm.value));
  }

  function stop() {
    isRunning = false;
    elToggle.textContent = 'Start';
    elToggle.classList.remove('stop');
    elStatus.textContent = 'Stopped';
    clearInterval(timer); timer = null;
    currentChord = null;
    renderChord();
  }

  function restart() { stop(); start(); }

  // Core
  function showRandomChord() {
    const pool = buildPool();
    currentChord = pool[Math.floor(Math.random() * pool.length)];
    renderChord();
  }

  function buildPool() {
    const types = Array.from(selectedTypes);
    const roots = Array.from(enabledRoots);
    const pool = [];
    for (const r of roots) for (const t of types) pool.push(r + CHORD_TYPES[t]);
    return pool;
  }

  function renderChord() {
    elChord.textContent = currentChord ? localizeChord(currentChord) : '—';
  }

  function localizeChord(symbol) {
    if (lang === 'en') return symbol;
    // Match the longest possible root first (e.g., Db before D)
    const root = ROOTS.slice().sort((a, b) => b.length - a.length).find(r => symbol.startsWith(r));
    if (!root) return symbol;
    const localized = NOTE_FR[root] || root;
    return localized + symbol.slice(root.length);
  }

  function relabelRootButtons() {
    document.querySelectorAll('#roots .root-toggle').forEach(btn => {
      const r = btn.dataset.root; // EN
      btn.textContent = (lang === 'fr') ? (NOTE_FR[r] || r) : r;
    });
  }

  // Utils
  function updateStatus() {
    elStatus.textContent = `Running at ${elBpm.value} BPM, change every ${elBpc.value} beats`;
  }
  function beatsToMs(beats, bpm) { return Math.round((60000 / bpm) * beats); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  // Initial render
  renderChord();
})();

