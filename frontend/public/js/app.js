document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('mode-toggle');

  // SÃ³ aplica o comportamento de tema nas telas que tÃªm botÃ£o de toggle
  if (!toggle) {
    return;
  }

  // Carrega tema salvo
  if (localStorage.getItem('theme') === 'dark') {
    body.setAttribute('data-bs-theme', 'dark');
    toggle.innerHTML = '<i class="bi bi-sun-fill me-2"></i> Modo Claro';
  }

  toggle.addEventListener('click', () => {
    if (body.getAttribute('data-bs-theme') === 'dark') {
      body.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
      toggle.innerHTML = '<i class="bi bi-moon-stars-fill me-2"></i> Modo Escuro';
    } else {
      body.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.innerHTML = '<i class="bi bi-sun-fill me-2"></i> Modo Claro';
    }
  });
});