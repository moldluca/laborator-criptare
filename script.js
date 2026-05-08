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
