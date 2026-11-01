(() => {
  const widgets = [...document.querySelectorAll('.record-widget')];
  widgets.forEach(widget => {
    const audio = widget.querySelector('audio');
    const button = widget.querySelector('.record-button');
    const state = widget.querySelector('.record-state');
    const error = widget.querySelector('.record-error');
    const title = button.getAttribute('aria-label').replace(/^Play | preview$/g, '');
    const limit = Number(audio.dataset.preview);
    const fadeDuration = 2;
    let frame;
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
      if (remaining <= 0) { audio.pause(); audio.currentTime = 0; return; }
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
    audio.addEventListener('play', () => { update(); cancelAnimationFrame(frame); fade(); });
    audio.addEventListener('pause', () => { cancelAnimationFrame(frame); audio.volume = 1; update(); });
    audio.addEventListener('timeupdate', () => { if (audio.currentTime >= limit) { audio.pause(); audio.currentTime = 0; } });
    audio.addEventListener('error', () => { error.textContent = 'Audio unavailable in this browser.'; });
  });
})();
