const titulo = "PLATAFORMA DE INTEROPERABILIDAD DEL ESTADO - EP";
const typingTitle = document.getElementById('typingTitle');
let index = 0;

function type() {
  if (index < title.length) {
    typingTitle.innerHTML += title.charAt(index);
    index++;
    setTimeout(type, 50); // Velocidad de escritura en milisegundos
  }
}

type();
