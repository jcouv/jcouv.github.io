(() => {
  'use strict';
  const c = 299792458;
  const $ = id => document.getElementById(id);
  const fields = [$('path'), $('rate'), $('distance')];
  const limits = [[0, 10000], [-10000, 10000], [0, 1000]];
  const format = (value, digits = 4) => {
    if (value === 0) return '0';
    if (Math.abs(value) < 0.0001 || Math.abs(value) >= 1e7) return value.toExponential(3);
    return value.toLocaleString('en-US', { maximumFractionDigits: digits });
  };
  function calculate(L, f, D) {
    const t = 2 * L / c;
    const theta = 2 * Math.PI * f * t;
    const alpha = 2 * theta;
    return { t, theta, alpha, x: D * Math.tan(alpha) };
  }
  function invalid(message) {
    $('input-error').textContent = message;
    $('input-error').hidden = false;
    ['angle', 'angle-extra', 'shift', 'time', 'mirror-angle'].forEach(id => $(id).textContent = '—');
    $('live-ray').setAttribute('visibility', 'hidden');
    $('live-spot').setAttribute('visibility', 'hidden');
    $('spot-label').textContent = 'Enter valid values to calculate';
    $('distance-label').textContent = 'D';
    $('scale-note').textContent = 'The diagram is paused until the inputs are valid.';
    $('bench-desc').textContent = 'No calculated ray is shown. ' + message;
  }
  function update() {
    const values = fields.map(input => input.valueAsNumber);
    const bad = values.map((v, i) => !Number.isFinite(v) || v < limits[i][0] || v > limits[i][1]);
    fields.forEach((input, i) => input.setAttribute('aria-invalid', String(bad[i])));
    $('rpm').textContent = Number.isFinite(values[1]) ? format(values[1] * 60, 2) + ' rpm' : '— rpm';
    if (bad.some(Boolean)) {
      invalid('Enter a path from 0 to 10,000 m, a rotation from −10,000 to 10,000 rev/s, and a screen distance from 0 to 1,000 m.');
      return;
    }
    const [L, f, D] = values;
    const { t, theta, alpha, x } = calculate(L, f, D);
    if (Math.abs(alpha) > 0.1) {
      invalid('This gives a deflection above 0.1 rad. Reduce the path or rotation rate to stay within this simplified model.');
      return;
    }
    $('input-error').hidden = true;
    $('angle').textContent = format(alpha * 1000) + ' mrad';
    $('angle-extra').textContent = format(alpha * 180 / Math.PI, 5) + '° · ' + format(alpha * 180 / Math.PI * 3600, 2) + ' arcsec';
    $('shift').textContent = format(x * 1000) + ' mm';
    $('time').textContent = format(t * 1e9, 3) + ' ns';
    $('mirror-angle').textContent = format(theta * 1000) + ' mrad';
    const mm = x * 1000;
    const scale = Math.max(1, Math.abs(mm));
    // This visual magnifies the transverse axis; it is never an angular scale drawing.
    const origin = 125;
    const end = origin + mm / scale * 72;
    $('bench').querySelector('line').setAttribute('y1', origin);
    $('bench').querySelector('line').setAttribute('y2', origin);
    $('live-ray').setAttribute('y1', origin);
    $('live-ray').setAttribute('y2', end);
    $('live-ray').setAttribute('visibility', 'visible');
    $('live-spot').setAttribute('cy', end);
    $('live-spot').setAttribute('visibility', 'visible');
    // Translate only the mirror, its centre and the zero mark to the visual baseline.
    const svg = $('bench');
    svg.querySelector('path').setAttribute('d', 'M61 144 L99 106');
    svg.querySelector('circle').setAttribute('cy', origin);
    const texts = svg.querySelectorAll('text');
    texts[0].setAttribute('y', '170');
    texts[1].setAttribute('y', '119');
    texts[texts.length - 1].textContent = '';
    $('spot-label').textContent = 'x = ' + (mm > 0 ? '+' : '') + format(mm) + ' mm';
    $('spot-label').setAttribute('y', end > origin ? end + 24 : end - 15);
    $('distance-label').textContent = 'D = ' + format(D) + ' m';
    $('scale-note').textContent = 'Illustration only; the transverse scale expands automatically. The drawn angle is exaggerated.';
    $('bench-desc').textContent = 'An unfolded ray travels from rotating mirror R to a screen ' + format(D) + ' metres away. The displacement is ' + format(mm) + ' millimetres, with beam deflection ' + format(alpha * 1000) + ' milliradians. The transverse scale is magnified.';
  }
  fields.forEach(field => field.addEventListener('input', update));
  $('controls').addEventListener('submit', event => event.preventDefault());
  $('reset').addEventListener('click', () => { fields.forEach((field, i) => field.value = [20, 400, 1][i]); update(); });
  update();
})();
