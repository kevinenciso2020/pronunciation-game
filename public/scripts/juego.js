// juego.js corregido y funcional con niveles, reconocimiento y botón de reinicio

const palabraMostrar = document.getElementById('palabraMostrar'); 
const traduccionPalabra = document.getElementById('traduccionPalabra');
const imagenPalabra = document.getElementById('imagenPalabra');
const btnEscuchar = document.getElementById('btnEscuchar');
const btnHablar = document.getElementById('btnHablar');
const btnRegresar = document.getElementById('btnRegresar');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnReiniciar = document.getElementById('btnReiniciar');
const puntajeTexto = document.getElementById('puntaje');

let nivelActual = 1;
let indicePalabra = 0;
let palabrasNivel = [];
let datosJSON = {};
let palabrasAdivinadas = 0;
let idiomaActual = localStorage.getItem('idiomaSeleccionado');
let voces = [];
let puntaje = 0;

// Cargar voces del navegador
function cargarVoces() {
  voces = speechSynthesis.getVoices();
}
speechSynthesis.onvoiceschanged = cargarVoces;

// Cargar el JSON y empezar el juego
fetch('/data/palabras.json')
  .then(res => res.json())
  .then(data => {
    datosJSON = data;
    const guardado = localStorage.getItem('nivel');
    nivelActual = guardado ? parseInt(guardado) : 1;
    iniciarNivel(nivelActual);
  });

// Iniciar el nivel
function iniciarNivel(nivel) {
  const nivelData = datosJSON.niveles[nivel];
  if (!nivelData || !nivelData.palabras[idiomaActual]) {
    alert("No hay palabras disponibles para este idioma en este nivel.");
    return;
  }

  palabrasNivel = [...nivelData.palabras[idiomaActual]];
  indicePalabra = 0;
  palabrasAdivinadas = 0;

  document.getElementById("nivelActual").innerText = `Nivel: ${nivel}`;
  puntajeTexto.textContent = `Puntaje: ${puntaje}`;

  mostrarPalabra();
}


// Mostrar palabra actual
function mostrarPalabra() {
  const palabra = palabrasNivel[indicePalabra];
  if (!palabra) return;
  imagenPalabra.src = `/assets/imagenes/${palabra.imagen}`;
  traduccionPalabra.innerText = palabra.traduccion;
  palabraMostrar.innerText = palabra.palabra;
}

// Botón escuchar
btnEscuchar?.addEventListener('click', () => {
  const palabra = palabrasNivel[indicePalabra];
  if (!palabra) return;

  const utter = new SpeechSynthesisUtterance(palabra.palabra);
  const voz = voces.find(v => v.lang.startsWith(idiomaActual)) || voces[0];
  utter.voice = voz;
  speechSynthesis.speak(utter);
});

// Botón pronunciar
btnHablar?.addEventListener('click', () => {
  const palabra = palabrasNivel[indicePalabra];
  if (!palabra) return;

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = idiomaActual === 'zh' ? 'zh-CN' :
                     idiomaActual === 'ru' ? 'ru-RU' :
                     idiomaActual === 'fr' ? 'fr-FR' :
                     idiomaActual === 'en' ? 'en-US' : 'es-ES';

  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  recognition.start();

  recognition.onresult = (event) => {
    const dicho = event.results[0][0].transcript.trim().toLowerCase().replace(/[.,!?¡¿']/g, "");
    const esperado = palabra.palabra.trim().toLowerCase().replace(/[.,!?¡¿']/g, "");
    const distancia = distanciaLevenshtein(dicho, esperado);

    if (dicho === esperado || distancia <= 1) {
      puntaje++;
      puntajeTexto.textContent = `Puntaje: ${puntaje}`;
      alert('¡Correcto! ✅');
      palabraCorrecta();
    } else {
      alert(`Incorrecto 😢. Dijiste: "${dicho}", se esperaba: "${esperado}"`);
    }
  };

  recognition.onerror = (event) => {
    alert('Error al reconocer la voz: ' + event.error);
  };
});

// Botón siguiente palabra
btnSiguiente?.addEventListener('click', () => {
  indicePalabra++;
  if (indicePalabra >= palabrasNivel.length) {
    alert('Ya no hay más palabras en este nivel');
    return;
  }
  mostrarPalabra();
});

// Botón regresar al inicio
btnRegresar?.addEventListener('click', () => {
  window.location.href = '/';
});

// Botón reiniciar nivel
btnReiniciar?.addEventListener('click', () => {
  indicePalabra = 0;
  palabrasAdivinadas = 0;
  puntaje = 0;
  iniciarNivel(nivelActual);
});

// Avanzar al siguiente nivel automáticamente
function palabraCorrecta() {
  palabrasAdivinadas++;
  indicePalabra++;

  if (palabrasAdivinadas >= palabrasNivel.length) {
    nivelActual++;
    localStorage.setItem('nivel', nivelActual);
    alert(`¡Nivel ${nivelActual - 1} completado! Vamos al siguiente.`);
    iniciarNivel(nivelActual);
  } else {
    mostrarPalabra();
  }
}

// Calcular distancia de Levenshtein
function distanciaLevenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
