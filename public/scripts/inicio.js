// scripts/inicio.js
const btnIniciar = document.getElementById('btnIniciar');
const selectIdioma = document.getElementById('idioma');

btnIniciar?.addEventListener('click', () => {
  const idioma = selectIdioma.value;
  localStorage.setItem('idiomaSeleccionado', idioma);
  window.location.href = '/juego';
});

//seleccionar nivel
const selectNivel = document.getElementById('nivel');

btnIniciar.addEventListener('click', () => {
  const idioma = selectIdioma.value;
  const nivel = selectNivel.value;

  localStorage.setItem('idiomaSeleccionado', idioma);
  localStorage.setItem('nivel', nivel);

  window.location.href = '/juego';
});
