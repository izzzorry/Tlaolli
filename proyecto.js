// === Config ===
const db = window.db; // Obtenemos la instancia de Firestore desde firebase-conf.js

// === Login ===
const loginIcon = document.getElementById("loginIcon");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.querySelector(".close");
const loginBtn = document.getElementById("loginBtn");
const status = document.getElementById("loginStatus");

let usuarioLogueado = false;

loginIcon.addEventListener("click", () => {
  if (usuarioLogueado) {
    usuarioLogueado = false;
    alert("Sesión cerrada");
    location.reload();
  } else {
    loginModal.style.display = "block";
  }
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  status.textContent = "";
});

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    status.textContent = "Completa los campos.";
    return;
  }

  try {
    const snapshot = await db.collection("Usuarios").get();
    let encontrado = false;

    snapshot.forEach(doc => {
      const user = doc.data();
      if (user.username === username && user.password === password) {
        encontrado = true;
      }
    });

    if (encontrado) {
      usuarioLogueado = true;
      loginModal.style.display = "none";
    } else {
      status.textContent = "❌ Usuario o contraseña incorrectos";
    }
  } catch (error) {
    console.error("Error al verificar login:", error);
  }
});

// === Subir a Cloudinary ===
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

// === Cargar personajes ===
async function cargarPersonajes() {
  const container = document.getElementById("Personajes-cards-container");
  container.innerHTML = "";

  try {
    const snapshot = await db.collection("Personajes").get();
    snapshot.forEach(docSnap => {
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

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando personajes:", error);
  }
}

// === Cargar novedades ===
async function cargarNovedades() {
  const container = document.querySelector("#about .box-container");
  container.innerHTML = "";

  try {
    const snapshot = await db.collection("Novedades").get();
    snapshot.forEach(docSnap => {
      const novedad = docSnap.data();
      const fecha = new Date(novedad.Fecha.toDate()).toLocaleDateString();
      const url = novedad.Referencia;
      const esVideo = /\.(mp4|webm|ogg)$/i.test(url);
      const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

      let mediaHTML = esVideo
        ? `<video src="${url}" controls width="100%"></video>`
        : esImagen
        ? `<img src="${url}" alt="${novedad.Titulo}" width="100%">`
        : `<p>[Contenido no soportado]</p>`;

      const box = document.createElement("div");
      box.classList.add("box");
      box.innerHTML = `
        <h3>${novedad.Titulo}</h3>
        ${mediaHTML}
        <p>${novedad.Descripcion}</p>
        <p>Por: ${novedad.Por}</p>
        <p>Fecha: ${fecha}</p>
      `;

      container.appendChild(box);
    });
  } catch (error) {
    console.error("Error cargando novedades:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPersonajes();
  cargarNovedades();
});