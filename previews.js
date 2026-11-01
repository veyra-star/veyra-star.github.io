(() => {
  const widgets = [...document.querySelectorAll('.record-widget')];
  widgets.forEach(widget => {
    const audio = widget.querySelector('audio');
    const button = widget.querySelector('.record-button');
    const state = widget.querySelector('.record-state');
    const error = widget.querySelector('.record-error');
    const disc = widget.querySelector('.record-disc');
    const title = button.getAttribute('aria-label').replace(/^Play | preview$/g, '');
    const limit = Number(audio.dataset.preview);
    const fadeDuration = 2;
    let frame;
    let motion;
    if (disc.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      motion = disc.animate([
        { transform: 'translateX(0) rotate(0deg)' },
        { transform: 'translateX(-60px) rotate(-2160deg)' }
      ], { duration: limit * 1000, easing: 'linear', fill: 'both' });
      motion.pause();
      motion.currentTime = 0;
    }
    const update = () => {
      const playing = !audio.paused;
      widget.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + title + ' preview');
      state.textContent = playing ? '❚❚' : '▶';
    };
    const fade = () => {
      if (audio.paused) return;
      const remaining = limit - audio.currentTime;
      if (remaining <= 0) { audio.pause(); return; }
      audio.volume = Math.max(0, Math.min(1, remaining / fadeDuration));
      frame = requestAnimationFrame(fade);
    };
    button.addEventListener('click', async () => {
      error.textContent = '';
      if (!audio.paused) { audio.pause(); return; }
      widgets.forEach(other => { if (other !== widget) other.querySelector('audio').pause(); });
      if (audio.currentTime >= limit) audio.currentTime = 0;
      try { await audio.play(); } catch { error.textContent = 'Audio unavailable in this browser.'; }
    });
    audio.addEventListener('play', () => { if (motion) { motion.currentTime = Math.min(limit, audio.currentTime) * 1000; motion.play(); } update(); cancelAnimationFrame(frame); fade(); });
    audio.addEventListener('pause', () => { if (motion) { motion.pause(); if (audio.currentTime >= limit || audio.ended) motion.currentTime = limit * 1000; } cancelAnimationFrame(frame); audio.volume = 1; update(); });
    audio.addEventListener('timeupdate', () => { if (audio.currentTime >= limit) audio.pause(); });
    audio.addEventListener('ended', () => { if (motion) { motion.pause(); motion.currentTime = limit * 1000; } });
    audio.addEventListener('error', () => { error.textContent = 'Audio unavailable in this browser.'; });
  });
})();
