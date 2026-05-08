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
