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
  const shiftEl = document.getElementById('caesar-shift');
  const dispEl  = document.getElementById('caesar-shift-display');

  shiftEl.addEventListener('input', () => {
    dispEl.textContent = shiftEl.value;
    encEl.value = caesarEncrypt(plainEl.value, parseInt(shiftEl.value, 10));
    flash(encEl);
  });

  plainEl.addEventListener('input', () => {
    encEl.value = caesarEncrypt(plainEl.value, parseInt(shiftEl.value, 10));
    flash(encEl);
  });

  encEl.addEventListener('input', () => {
    plainEl.value = caesarDecrypt(encEl.value, parseInt(shiftEl.value, 10));
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

let substEnc = {};
let substDec = {};

function shuffleStr(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function generateSubstMapping() {
  const shuffled = shuffleStr(SUBST_SET);
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
  const plainEl    = document.getElementById('subst-plain');
  const encEl      = document.getElementById('subst-encrypted');
  const shuffleBtn = document.getElementById('subst-shuffle');

  generateSubstMapping();
  renderSubstTable();

  shuffleBtn.addEventListener('click', () => {
    generateSubstMapping();
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
