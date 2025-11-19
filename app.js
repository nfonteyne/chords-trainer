(() => {
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

  // DOM
  const elBpm = document.getElementById('bpm');
  const elBpc = document.getElementById('bpc');
  const elToggle = document.getElementById('toggle');
  const elStatus = document.getElementById('status');
  const elChord = document.getElementById('chord');
  const elRoots = document.getElementById('roots');

  // Root toggles
  const enabledRoots = new Set(ROOTS);
  for (const r of ROOTS) {
    const btn = document.createElement('button');
    btn.className = 'root-toggle active';
    btn.textContent = r;
    btn.dataset.root = r;
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

  // State
  let isRunning = false;
  let timer = null;

  // Selected chord types via checkboxes
  const selectedTypes = new Set();
  document.querySelectorAll('input[type="checkbox"][data-type]').forEach(cb => {
    if (cb.checked) selectedTypes.add(cb.dataset.type);
    cb.addEventListener('change', () => {
      if (cb.checked) selectedTypes.add(cb.dataset.type);
      else selectedTypes.delete(cb.dataset.type);
      if (isRunning) restart();
    });
  });

  // Controls
  elToggle.addEventListener('click', () => (isRunning ? stop() : start()));
  elBpm.addEventListener('change', () => { elBpm.value = clamp(+elBpm.value || 80, 20, 300); if (isRunning) restart(); });
  elBpc.addEventListener('change', () => { elBpc.value = clamp(+elBpc.value || 4, 1, 16); if (isRunning) restart(); });

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
  }

  function restart() { stop(); start(); }

  function showRandomChord() {
    const pool = buildPool();
    elChord.textContent = pool[Math.floor(Math.random() * pool.length)];
  }

  function buildPool() {
    const types = Array.from(selectedTypes);
    const roots = Array.from(enabledRoots);
    const pool = [];
    for (const r of roots) for (const t of types) pool.push(r + CHORD_TYPES[t]);
    return pool;
  }

  function updateStatus() {
    elStatus.textContent = `Running at ${elBpm.value} BPM, change every ${elBpc.value} beats`;
  }

  function beatsToMs(beats, bpm) { return Math.round((60000 / bpm) * beats); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
})();

