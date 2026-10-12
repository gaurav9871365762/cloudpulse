/* ============================================================
   TOTP ENGINE — RFC 6238 / RFC 4226 · HMAC-SHA1 · 6 digits · 30s
============================================================ */
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input) {
  const clean = String(input).replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = BASE32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}
function rotl(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }

function sha1(bytes) {
  const ml = bytes.length * 8;
  const total = Math.ceil((bytes.length + 9) / 64) * 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(total - 8, Math.floor(ml / 4294967296));
  dv.setUint32(total - 4, ml >>> 0);

  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE,
      h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const w = new Uint32Array(80);

  for (let i = 0; i < total; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4);
    for (let j = 16; j < 80; j++) w[j] = rotl(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);

    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20)      { f = (b & c) | (~b & d);            k = 0x5A827999; }
      else if (j < 40) { f = b ^ c ^ d;                     k = 0x6ED9EBA1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d);   k = 0x8F1BBCDC; }
      else             { f = b ^ c ^ d;                     k = 0xCA62C1D6; }
      const temp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const out = new Uint8Array(20);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0); odv.setUint32(4, h1); odv.setUint32(8, h2);
  odv.setUint32(12, h3); odv.setUint32(16, h4);
  return out;
}
function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0); out.set(b, a.length);
  return out;
}
function hmacSha1(key, msg) {
  const BLOCK = 64;
  let k = key;
  if (k.length > BLOCK) k = sha1(k);
  const padded = new Uint8Array(BLOCK); padded.set(k);
  const oKey = new Uint8Array(BLOCK), iKey = new Uint8Array(BLOCK);
  for (let i = 0; i < BLOCK; i++) {
    oKey[i] = padded[i] ^ 0x5c;
    iKey[i] = padded[i] ^ 0x36;
  }
  return sha1(concatBytes(oKey, sha1(concatBytes(iKey, msg))));
}
function totpAt(secretBytes, counter, digits = 6) {
  const buf = new Uint8Array(8);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, Math.floor(counter / 4294967296));
  dv.setUint32(4, counter >>> 0);
  const mac = hmacSha1(secretBytes, buf);
  const offset = mac[19] & 0x0f;
  const binary = ((mac[offset] & 0x7f) << 24) |
                 (mac[offset + 1] << 16) |
                 (mac[offset + 2] << 8) |
                 mac[offset + 3];
  return String(binary % Math.pow(10, digits)).padStart(digits, '0');
}

/* Must match the secret in routes.py */
const SECRET_BYTES = base32Decode('JBSWY3DPEHPK3PXP');
const PERIOD = 30, DIGITS = 6;

function currentCounter() { return Math.floor(Date.now() / 1000 / PERIOD); }
function currentCode()    { return totpAt(SECRET_BYTES, currentCounter(), DIGITS); }
function secondsRemaining() {
  return Math.ceil(PERIOD - ((Date.now() / 1000) % PERIOD));
}

/* ============================================================
   LIVE DEMO DISPLAY + OTP INPUT HANDLING
============================================================ */
const totpCodeEl = document.getElementById('totpCode');
const ringNumEl  = document.getElementById('ringNum');
const codeGroup  = document.getElementById('codeGroup');

if (totpCodeEl && ringNumEl) {
  let last = '';
  function render() {
    const code = currentCode();
    const secs = secondsRemaining();
    if (code !== last) {
      last = code;
      totpCodeEl.textContent = code.slice(0,3) + ' ' + code.slice(3);
    }
    ringNumEl.textContent = secs;
    ringNumEl.classList.toggle('warn', secs <= 5);
  }
  setInterval(render, 200);
  render();
}

if (codeGroup) {
  const inputs = Array.from(codeGroup.querySelectorAll('.code-input'));
  const hidden = document.getElementById('codeValue');
  const form   = document.getElementById('verifyForm');

  function syncHidden() {
    hidden.value = inputs.map(i => i.value).join('');
  }

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1);
      input.classList.toggle('filled', input.value !== '');
      syncHidden();
      if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      if (hidden.value.length === DIGITS) form.submit();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        e.preventDefault();
        inputs[idx - 1].value = '';
        inputs[idx - 1].classList.remove('filled');
        inputs[idx - 1].focus();
        syncHidden();
      }
      if (e.key === 'ArrowLeft'  && idx > 0) { e.preventDefault(); inputs[idx-1].focus(); }
      if (e.key === 'ArrowRight' && idx < 5) { e.preventDefault(); inputs[idx+1].focus(); }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const digits = (e.clipboardData || window.clipboardData)
        .getData('text').replace(/\D/g, '').slice(0, DIGITS);
      digits.split('').forEach((d, i) => {
        if (inputs[i]) {
          inputs[i].value = d;
          inputs[i].classList.add('filled');
        }
      });
      syncHidden();
      inputs[Math.min(digits.length, DIGITS - 1)].focus();
      if (digits.length === DIGITS) form.submit();
    });
  });
}