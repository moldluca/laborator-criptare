// ===== UTIL =====

function flash(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 300);
}

// ===== CAESAR =====

function caesarEncrypt(text, shift) {
  shift = ((shift % 26) + 26) % 26;
  return text.split('').map(ch => {
    if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
    if (ch >= 'a' && ch <= 'z') return String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26) + 97);
    if (ch >= '0' && ch <= '9') return String.fromCharCode(((ch.charCodeAt(0) - 48 + shift % 10) % 10) + 48);
    return ch;
  }).join('');
}

function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - (shift % 26));
}

(function initCaesar() {
  const plainEl = document.getElementById('caesar-plain');
  const encEl   = document.getElementById('caesar-encrypted');
  let currentShift = 3;

  document.getElementById('caesar-presets').addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    document.querySelectorAll('#caesar-presets .preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentShift = parseInt(btn.dataset.shift, 10);
    encEl.value = caesarEncrypt(plainEl.value, currentShift);
    flash(encEl);
  });

  plainEl.addEventListener('input', () => {
    encEl.value = caesarEncrypt(plainEl.value, currentShift);
    flash(encEl);
  });

  encEl.addEventListener('input', () => {
    plainEl.value = caesarDecrypt(encEl.value, currentShift);
    flash(plainEl);
  });
})();

// ===== VIGENÈRE =====

function vigenereProcess(text, key, encrypt) {
  key = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!key) return text;
  let ki = 0;
  return text.split('').map(ch => {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const isLower = ch >= 'a' && ch <= 'z';
    const isDigit = ch >= '0' && ch <= '9';
    if (isUpper || isLower) {
      const base  = isUpper ? 65 : 97;
      const shift = key[ki % key.length].charCodeAt(0) - 65;
      const s     = encrypt ? shift : (26 - shift);
      ki++;
      return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
    }
    if (isDigit) {
      const shift = key[ki % key.length].charCodeAt(0) - 65;
      const s     = encrypt ? shift % 10 : (10 - shift % 10);
      ki++;
      return String.fromCharCode(((ch.charCodeAt(0) - 48 + s) % 10) + 48);
    }
    return ch;
  }).join('');
}

(function initVigenere() {
  const plainEl = document.getElementById('vigenere-plain');
  const encEl   = document.getElementById('vigenere-encrypted');
  const keyEl   = document.getElementById('vigenere-key');

  keyEl.addEventListener('input', () => {
    keyEl.value = keyEl.value.toUpperCase().replace(/[^A-Z]/g, '');
    encEl.value = vigenereProcess(plainEl.value, keyEl.value, true);
    flash(encEl);
  });

  plainEl.addEventListener('input', () => {
    encEl.value = vigenereProcess(plainEl.value, keyEl.value, true);
    flash(encEl);
  });

  encEl.addEventListener('input', () => {
    plainEl.value = vigenereProcess(encEl.value, keyEl.value, false);
    flash(plainEl);
  });
})();

// ===== SUBSTITUȚIE EXTINSĂ =====

const SUBST_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`\'"';

function seededShuffle(str, seed) {
  const arr = str.split('');
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

const SUBST_PRESETS = [
  seededShuffle(SUBST_SET, 42),
  seededShuffle(SUBST_SET, 1337),
  seededShuffle(SUBST_SET, 9999),
];

let substEnc = {};
let substDec = {};

function loadSubstMapping(index) {
  const shuffled = SUBST_PRESETS[index];
  substEnc = {};
  substDec = {};
  for (let i = 0; i < SUBST_SET.length; i++) {
    const from = SUBST_SET[i];
    const to   = shuffled[i];
    substEnc[from] = to;
    substEnc[from.toLowerCase()] = to;
    substDec[to] = from;
    substDec[to.toLowerCase()] = from;
  }
}

function substEncrypt(text) {
  return text.split('').map(ch => (substEnc[ch] !== undefined ? substEnc[ch] : ch)).join('');
}

function substDecrypt(text) {
  return text.split('').map(ch => (substDec[ch] !== undefined ? substDec[ch] : ch)).join('');
}

function escHtml(ch) {
  return ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSubstTable() {
  const el = document.getElementById('subst-table');
  el.innerHTML = SUBST_SET.split('').map(ch => {
    const to = substEnc[ch] || '?';
    return `<div class="subst-pair">
      <div class="from">${escHtml(ch)}</div>
      <div>↓</div>
      <div class="to">${escHtml(to)}</div>
    </div>`;
  }).join('');
}

(function initSubst() {
  const plainEl = document.getElementById('subst-plain');
  const encEl   = document.getElementById('subst-encrypted');

  loadSubstMapping(0);
  renderSubstTable();

  document.getElementById('subst-presets').addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (!btn) return;
    document.querySelectorAll('#subst-presets .preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadSubstMapping(parseInt(btn.dataset.preset, 10));
    renderSubstTable();
    encEl.value = substEncrypt(plainEl.value);
    flash(encEl);
  });

  plainEl.addEventListener('input', () => {
    encEl.value = substEncrypt(plainEl.value);
    flash(encEl);
  });

  encEl.addEventListener('input', () => {
    plainEl.value = substDecrypt(encEl.value);
    flash(plainEl);
  });
})();

// ===== CODUL MORSE =====

const MORSE_ENC = {
  A:'.-',   B:'-...',  C:'-.-.',  D:'-..',   E:'.',    F:'..-.',
  G:'--.',  H:'....', I:'..',    J:'.---',  K:'-.-',  L:'.-..',
  M:'--',   N:'-.',   O:'---',   P:'.--.',  Q:'--.-', R:'.-.',
  S:'...',  T:'-',    U:'..-',   V:'...-',  W:'.--',  X:'-..-',
  Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-', ',':'--..--', '?':'..--..', '!':'-.-.--',
  '(':'-.--.', ')':'-.--.-', ':':'---...',  ';':'-.-.-.',
  '=':'-...-',  '+':'.-.-.', '-':'-....-',  '_':'..--.-',
  '"':'.-..-.', '$':'...-..-', '@':'.--.-.'
};

const MORSE_DEC = Object.fromEntries(Object.entries(MORSE_ENC).map(([k, v]) => [v, k]));

function textToMorse(text) {
  return text.toUpperCase().split(' ').map(word =>
    word.split('').map(ch => MORSE_ENC[ch] || ch).join(' ')
  ).join(' / ');
}

function morseToText(morse) {
  return morse.split(' / ').map(word =>
    word.trim().split(' ').map(code => MORSE_DEC[code] || code).join('')
  ).join(' ');
}

(function initMorse() {
  const plainEl = document.getElementById('morse-plain');
  const encEl   = document.getElementById('morse-encrypted');

  plainEl.addEventListener('input', () => {
    encEl.value = textToMorse(plainEl.value);
    flash(encEl);
  });

  encEl.addEventListener('input', () => {
    plainEl.value = morseToText(encEl.value);
    flash(plainEl);
  });
})();

// ===== CHEI SECRETE =====

(function initSecret() {
  const nameEl    = document.getElementById('secret-name');
  const answerEl  = document.getElementById('secret-answer');
  const submitBtn = document.getElementById('secret-submit');
  const feedback  = document.getElementById('secret-feedback');

  submitBtn.addEventListener('click', async () => {
    const name   = nameEl.value.trim();
    const answer = answerEl.value.trim();

    if (!name) {
      feedback.textContent = '⚠️ Introdu mai întâi numele tău!';
      feedback.className = 'secret-feedback warn';
      return;
    }
    if (!answer) {
      feedback.textContent = '⚠️ Introdu parola descoperită!';
      feedback.className = 'secret-feedback warn';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Se trimite...';
    feedback.textContent = '';
    feedback.className = 'secret-feedback';

    try {
      const res = await fetch('https://crocoai.perpetuummobile.tech/api/criptare/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, answer })
      });
      const data = await res.json();

      if (data.correct) {
        feedback.innerHTML = '🎉 Felicitări! Ai descifrat codul!<br><br>Mesajul secret:<br><strong>„Construim viitorul câte o piesă de lego pe rând."</strong><br><br>Vino să mi-l spui pentru o surpriză! 🎁';
        feedback.className = 'secret-feedback correct';
        submitBtn.textContent = '✅ Trimis!';
      } else {
        feedback.textContent = '❌ Nu e corect. Mai încearcă!';
        feedback.className = 'secret-feedback wrong';
        submitBtn.disabled = false;
        submitBtn.textContent = '🔑 Trimite răspunsul';
      }
    } catch (e) {
      feedback.textContent = '⚠️ Eroare de conexiune. Încearcă din nou.';
      feedback.className = 'secret-feedback warn';
      submitBtn.disabled = false;
      submitBtn.textContent = '🔑 Trimite răspunsul';
    }
  });
})();
