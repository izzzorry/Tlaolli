import { db } from '../config/firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';

let usuarioLogueado = false;
let personajeEditId = null;
let novedadEditId = null;

// === DOM Elements ===
const personajeModal = document.getElementById("personajeModal");
const closePersonajeBtn = document.querySelector(".close-personaje");
const guardarBtn = document.getElementById("guardarPersonaje");
const crearPersonajeBtn = document.getElementById("crearPersonajeBtn");

const loginBtn = document.getElementById("loginBtn");
const modal = document.getElementById("loginModal");
const status = document.getElementById("loginStatus");
const loginIcon = document.getElementById("loginIcon");
const closeLoginBtn = document.querySelector(".close");

const nombre = document.getElementById("nombre");
const genero = document.getElementById("genero");
const edad = document.getElementById("edad");
const comunidad = document.getElementById("comunidad");
const habilidades = document.getElementById("habilidades");
const debilidades = document.getElementById("debilidades");
const foto = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");

const novedadModal = document.getElementById("novedadModal");
const closeNovedadBtn = document.querySelector(".close-novedad");
const guardarNovedadBtn = document.getElementById("guardarNovedad");
const crearNovedadBtn = document.getElementById("crearNovedadBtn");

const tituloNovedad = document.getElementById("tituloNovedad");
const descripcionNovedad = document.getElementById("descripcionNovedad");
const autorNovedad = document.getElementById("autorNovedad");
const archivoNovedad = document.getElementById("archivoNovedad");
const previewImg = document.getElementById("previewNovedadImg");
const previewVideo = document.getElementById("previewNovedadVideo");

// === Función para subir a Cloudinary
async function uploadToCloudinary(file, presetName) {
  const url = 'https://api.cloudinary.com/v1_1/dj9nrp8r8/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', presetName);

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error("Error al subir archivo");

  const data = await res.json();
  return data.secure_url;
}

// === Login ===
loginIcon.addEventListener("click", () => {
  if (usuarioLogueado) {
    usuarioLogueado = false;
    alert("Sesión cerrada");
    location.reload();
  } else {
    modal.style.display = "block";
  }
});

closeLoginBtn.addEventListener("click", () => {
  modal.style.display = "none";
  status.textContent = "";
});

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    status.textContent = "Completa los campos.";
    return;
  }

  const querySnapshot = await getDocs(collection(db, "Usuarios"));
  let encontrado = false;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.username === username && data.password === password) {
      encontrado = true;
    }
  });

  if (encontrado) {
    usuarioLogueado = true;
    modal.style.display = "none";
  } else {
    status.textContent = "❌ Usuario o contraseña incorrectos";
  }
});

// === Personajes ===
function limpiarFormularioPersonaje() {
  nombre.value = "";
  genero.value = "";
  edad.value = "";
  comunidad.value = "";
  habilidades.value = "";
  debilidades.value = "";
  foto.value = "";
  previewFoto.src = "";
}

foto.addEventListener("change", () => {
  const file = foto.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewFoto.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

closePersonajeBtn.addEventListener("click", () => {
  personajeModal.style.display = "none";
  personajeEditId = null;
  limpiarFormularioPersonaje();
});

guardarBtn.addEventListener("click", async () => {
  const habilidadesArr = habilidades.value.split(",").map(h => h.trim());
  const debilidadesArr = debilidades.value.split(",").map(d => d.trim());
  let fotoURL = previewFoto.src;

  if (foto.files[0]) {
    try {
      fotoURL = await uploadToCloudinary(foto.files[0], "personaje");
    } catch (err) {
      alert("Error subiendo la foto");
      return;
    }
  }

  const data = {
    Nombre: nombre.value,
    Genero: genero.value,
    Edad: edad.value,
    Comunidad: comunidad.value,
    Habilidades: habilidadesArr,
    Debilidades: debilidadesArr,
    Foto: fotoURL
  };

  try {
    if (personajeEditId) {
      const docRef = doc(db, "Personajes", personajeEditId);
      await updateDoc(docRef, data);
    } else {
      await addDoc(collection(db, "Personajes"), data);
    }
    personajeModal.style.display = "none";
    location.reload();
  } catch (error) {
    alert("Error guardando el personaje");
  }
});

crearPersonajeBtn.addEventListener("click", () => {
  if (!usuarioLogueado) {
    alert("Debes iniciar sesión");
    return;
  }
  personajeEditId = null;
  document.getElementById("modalTitulo").textContent = "Crear Personaje";
  personajeModal.style.display = "flex";
});

// === Novedades ===
crearNovedadBtn.addEventListener("click", () => {
  if (!usuarioLogueado) {
    alert("Debes iniciar sesión");
    return;
  }

  novedadEditId = null;
  document.getElementById("modalTituloNovedad").textContent = "Crear Novedad";
  novedadModal.style.display = "flex";
});

archivoNovedad.addEventListener("change", () => {
  const file = archivoNovedad.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");

  previewImg.style.display = isVideo ? "none" : "block";
  previewVideo.style.display = isVideo ? "block" : "none";

  if (isVideo) {
    previewVideo.src = url;
  } else {
    previewImg.src = url;
  }
});

guardarNovedadBtn.addEventListener("click", async () => {
  const file = archivoNovedad.files[0];
  let mediaURL = "";

  if (file) {
    try {
      mediaURL = await uploadToCloudinary(file, "novedad");
    } catch (err) {
      alert("Error al subir archivo");
      return;
    }
  }

  const data = {
    Titulo: tituloNovedad.value,
    Descripcion: descripcionNovedad.value,
    Por: autorNovedad.value,
    Fecha: new Date(),
    Referencia: mediaURL
  };

  try {
    if (novedadEditId) {
      const ref = doc(db, "Novedades", novedadEditId);
      await updateDoc(ref, data);
    } else {
      await addDoc(collection(db, "Novedades"), data);
    }

    novedadModal.style.display = "none";
    location.reload();
  } catch (err) {
    alert("Error al guardar la novedad");
  }
});

closeNovedadBtn.addEventListener("click", () => {
  novedadModal.style.display = "none";
  novedadEditId = null;
  tituloNovedad.value = "";
  descripcionNovedad.value = "";
  autorNovedad.value = "";
  archivoNovedad.value = "";
  previewImg.style.display = "none";
  previewVideo.style.display = "none";
});

// === Cargar datos desde Firestore ===
async function cargarPersonajes() {
  const container = document.getElementById("Personajes-cards-container");
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "Personajes"));
  querySnapshot.forEach((docSnap) => {
    const personaje = docSnap.data();

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${personaje.Foto}" alt="${personaje.Nombre}">
      <h3>${personaje.Nombre}</h3>
      <p>Género: ${personaje.Genero}</p>
      <p>Edad: ${personaje.Edad}</p>
      <p>Comunidad: ${personaje.Comunidad}</p>
      <p><strong>Habilidades:</strong></p>
      <ul>${personaje.Habilidades.map(h => `<li>${h}</li>`).join('')}</ul>
      <p><strong>Debilidades:</strong></p>
      <ul>${personaje.Debilidades.map(d => `<li>${d}</li>`).join('')}</ul>
    `;

    if (usuarioLogueado) {
      card.addEventListener("click", () => {
        alert("Editar personaje");
      });
    }

    container.appendChild(card);
  });
}

async function cargarNovedades() {
  const container = document.querySelector("#about .box-container");
  container.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "Novedades"));

  querySnapshot.forEach((docSnap) => {
    const novedad = docSnap.data();
    const box = document.createElement("div");
    box.classList.add("box");

    const fecha = new Date(novedad.Fecha.toDate()).toLocaleDateString();
    const url = novedad.Referencia;
    const esVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

    let mediaHTML = "";
    if (esVideo) {
      mediaHTML = `<video src="${url}" controls width="100%"></video>`;
    } else if (esImagen) {
      mediaHTML = `<img src="${url}" alt="${novedad.Titulo}" width="100%">`;
    } else {
      mediaHTML = `<p>[Contenido no soportado]</p>`;
    }

    box.innerHTML = `
      <h3>${novedad.Titulo}</h3>
      ${mediaHTML}
      <p>${novedad.Descripcion}</p>
      <p>Por: ${novedad.Por}</p>
      <p>Fecha: ${fecha}</p>
    `;

    if (usuarioLogueado) {
      box.addEventListener("click", () => {
        alert("Editar novedad");
      });
    }

    container.appendChild(box);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPersonajes();
  cargarNovedades();
});
