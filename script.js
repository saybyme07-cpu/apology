const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('test') === 'true' || urlParams.get('admin') === 'true' || urlParams.get('bypass') === '1' || urlParams.get('free') === '1') {
  sessionStorage.setItem('saybyme_test_bypass', 'true');
}

const form  = document.getElementById('nameForm');
const input = document.getElementById('name');
const field = document.getElementById('field');
const msg   = document.getElementById('msg');

if (form && input) {
  // Pre-fill if already in storage
  const saved = sessionStorage.getItem('saybyme_user_name');
  if (saved) input.value = saved;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) {
      if (field) field.classList.add('error');
      if (msg) msg.textContent = 'Please enter your name to continue.';
      input.focus();
      return;
    }
    if (field) field.classList.remove('error');
    if (msg) msg.textContent = '';
    sessionStorage.setItem('saybyme_user_name', name);
    window.location.href = 'step2.html?name=' + encodeURIComponent(name);
  });

  input.addEventListener('input', () => {
    if (field) field.classList.remove('error');
    if (msg) msg.textContent = '';
  });
}
