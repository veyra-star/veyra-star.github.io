(() => {
  const targets = document.querySelectorAll('.listen-sparkle');
  if (!targets.length || !('AudioContext' in window || 'webkitAudioContext' in window)) return;
  let context; let enabled = false; let lastPlayed = 0;
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'sound-toggle';
  toggle.textContent = 'Sound off ✧'; toggle.setAttribute('aria-pressed', 'false');
  document.body.append(toggle);
  function sparkle() {
    if (!enabled || !context || context.state !== 'running') return;
    const now = context.currentTime;
    if (now - lastPlayed < .55) return;
    lastPlayed = now;
    const master = context.createGain(); master.gain.value = .045; master.connect(context.destination);
    [1568, 2093, 2637].forEach((frequency, i) => {
      const oscillator = context.createOscillator(); const envelope = context.createGain();
      const at = now + i * .055;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, at);
      envelope.gain.setValueAtTime(.0001, at); envelope.gain.exponentialRampToValueAtTime(.42 - i * .08, at + .012); envelope.gain.exponentialRampToValueAtTime(.0001, at + .23);
      oscillator.connect(envelope); envelope.connect(master); oscillator.start(at); oscillator.stop(at + .24);
    });
    setTimeout(() => master.disconnect(), 800);
  }
  toggle.addEventListener('click', async () => {
    if (!enabled) {
      try { context ||= new (window.AudioContext || window.webkitAudioContext)(); await context.resume(); enabled = context.state === 'running'; }
      catch { enabled = false; }
      toggle.textContent = enabled ? 'Sound on ✧' : 'Sound off ✧';
      toggle.setAttribute('aria-pressed', String(enabled));
      if (enabled) sparkle();
    } else { enabled = false; toggle.textContent = 'Sound off ✧'; toggle.setAttribute('aria-pressed', 'false'); }
  });
  targets.forEach(target => {
    target.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') sparkle(); });
    target.addEventListener('focus', sparkle);
    target.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') sparkle(); });
  });
})();
