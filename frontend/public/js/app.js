document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('mode-toggle');

  const getSavedTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch (_) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem('theme', theme);
    } catch (_) {
      // ignora ambientes em que localStorage não está disponível
    }
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    body.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

    if (toggle) {
      toggle.innerHTML = isDark
        ? '<i class="bi bi-sun-fill me-2"></i> Modo Claro'
        : '<i class="bi bi-moon-stars-fill me-2"></i> Modo Escuro';
    }
  };

  // aplica o tema salvo em qualquer página
  const savedTheme = getSavedTheme();
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  // páginas sem botão de tema não precisam de listener
  if (!toggle) {
    return;
  }

  toggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
});
