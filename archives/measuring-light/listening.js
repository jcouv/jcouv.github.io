(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dial = $('mirror-dial');
  const toggle = $('sound-toggle');
  const result = $('tuning-result');
  const reveal = $('reveal-tuning');
  const volume = $('tone-volume');
  const referenceHz = 400;
  const stepHz = 0.04;
  let targetPosition;
  let context;
  let voice;
  let playing = false;
  let operation = 0;
  const frequency = () => referenceHz + (Number(dial.value) - targetPosition) * stepHz;
  function hideResult() {
    result.hidden = true;
    result.replaceChildren();
    reveal.textContent = 'Reveal my result';
    reveal.setAttribute('aria-expanded', 'false');
  }
  function randomAttempt() {
    targetPosition = 300 + Math.floor(Math.random() * 401);
    const offset = 150 + Math.floor(Math.random() * 101);
    dial.value = targetPosition + (Math.random() < 0.5 ? -offset : offset);
    hideResult();
    updateTone();
  }
  function updateTone() {
    hideResult();
    if (voice) voice.mirror.frequency.setTargetAtTime(frequency(), context.currentTime, 0.025);
    // The accessible value deliberately describes a knob position, not the hidden frequency.
    dial.setAttribute('aria-valuetext', 'Air-flow position ' + Math.round(Number(dial.value) / 10) + ' percent; frequency hidden');
    $('tone-lower').disabled = Number(dial.value) <= 0;
    $('tone-higher').disabled = Number(dial.value) >= 1000;
  }
  function setPlaying(on) {
    playing = on;
    toggle.textContent = on ? 'Stop sound' : 'Play both tones';
    toggle.setAttribute('aria-pressed', String(on));
    $('sound-status').textContent = on ? 'Both tones playing · listen for beats' : 'Sound is off';
  }
  function stop() {
    operation++;
    const previous = voice;
    voice = null;
    setPlaying(false);
    if (!previous) return;
    const now = context.currentTime;
    previous.gain.gain.cancelScheduledValues(now);
    previous.gain.gain.setTargetAtTime(0, now, 0.012);
    previous.reference.stop(now + 0.08);
    previous.mirror.stop(now + 0.08);
    previous.mirror.onended = () => {
      previous.reference.disconnect();
      previous.mirror.disconnect();
      previous.gain.disconnect();
    };
  }
  async function start() {
    const token = ++operation;
    toggle.disabled = true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('unsupported');
      context ||= new AudioContext();
      await context.resume();
      if (token !== operation || document.hidden) return;
      if (context.state !== 'running') throw new Error('blocked');
      const gain = context.createGain();
      const reference = context.createOscillator();
      const mirror = context.createOscillator();
      reference.type = mirror.type = 'sine';
      reference.frequency.value = referenceHz;
      mirror.frequency.value = frequency();
      gain.gain.value = 0;
      reference.connect(gain);
      mirror.connect(gain);
      gain.connect(context.destination);
      const now = context.currentTime;
      reference.start(now);
      mirror.start(now);
      gain.gain.setTargetAtTime(Number(volume.value) / 100 * 0.15, now, 0.025);
      voice = {gain, reference, mirror};
      setPlaying(true);
    } catch {
      setPlaying(false);
      $('sound-status').textContent = 'Audio could not start. Try Play again in a browser that supports Web Audio.';
    } finally {
      toggle.disabled = false;
    }
  }
  toggle.addEventListener('click', () => playing ? stop() : start());
  dial.addEventListener('input', updateTone);
  for (const [id, delta] of [['tone-lower', -1], ['tone-higher', 1]]) {
    $(id).addEventListener('click', () => {
      dial.value = Math.max(0, Math.min(1000, Number(dial.value) + delta));
      updateTone();
    });
  }
  volume.addEventListener('input', () => {
    $('volume-value').textContent = volume.value + '%';
    if (voice) voice.gain.gain.setTargetAtTime(Number(volume.value) / 100 * 0.15, context.currentTime, 0.025);
  });
  reveal.addEventListener('click', () => {
    if (!result.hidden) { hideResult(); return; }
    const hz = frequency();
    const error = hz - referenceHz;
    const beat = Math.abs(error);
    const matched = beat <= 0.1 + Number.EPSILON;
    const title = document.createElement('strong');
    title.textContent = matched ? 'Matched within 0.10 Hz.' : 'Not matched yet—keep listening.';
    const reading = document.createElement('p');
    reading.textContent = 'Mirror: ' + hz.toFixed(2) + ' Hz · Reference: 400.00 Hz · Error: ' + (error > 0 ? '+' : '') + error.toFixed(2) + ' Hz';
    const explanation = document.createElement('p');
    explanation.textContent = beat < 0.001 ? 'No frequency-difference beats: both tones are at 400 Hz.' : 'Beat rate: ' + beat.toFixed(2) + ' per second—one swell every ' + (1 / beat).toFixed(2) + ' seconds. The mirror tone is ' + (error > 0 ? 'too high.' : 'too low.');
    const note = document.createElement('small');
    note.textContent = 'Success in this exercise means within ±0.10 Hz (0.025%). This is a practice threshold, not a claim about historical accuracy. Moving the dial hides the result again.';
    result.replaceChildren(title, reading, explanation, note);
    result.hidden = false;
    reveal.textContent = 'Hide my result';
    reveal.setAttribute('aria-expanded', 'true');
  });
  $('new-tuning').addEventListener('click', () => { stop(); randomAttempt(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  randomAttempt();
})();
