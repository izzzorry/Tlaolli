// main.js completo con verificación de inicialización de Firebase

// === Firebase SDK v9 desde CDN con compatibilidad ===
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5RfGB1H6olHubSyO4ARAr-UPnFGCh8Kc",
  authDomain: "videogames-366f5.firebaseapp.com",
  projectId: "videogames-366f5",
  storageBucket: "videogames-366f5.appspot.com",
  messagingSenderId: "1022961712480",
  appId: "1:1022961712480:web:a05260cbf26fcc5db3b205"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// === Elementos del DOM ===
const container = document.getElementById('cards-container');
const loginIcon = document.getElementById("loginIcon");
const modal = document.getElementById("loginModal");
const closeBtn = modal.querySelector(".close");
const loginBtn = document.getElementById("loginBtn");
const status = document.getElementById("loginStatus");

const editModal = document.getElementById("editModal");
const closeEditBtn = document.querySelector(".close-edit");
const saveChangesBtn = document.getElementById("saveChanges");

const editNombre = document.getElementById("editNombre");
const editRol = document.getElementById("editRol");
const editGithub = document.getElementById("editGithub");
const editLinkedin = document.getElementById("editLinkedin");
const editFoto = document.getElementById("editFoto");
const previewImg = document.getElementById("previewImg");

let perfilEditId = null;
let usuarioLogueado = false;

// === Subir imagen a Cloudinary ===
async function uploadToCloudinary(file) {
  const url = 'https://api.cloudinary.com/v1_1/dj9nrp8r8/image/upload';
  const preset = 'perfil_unsigned';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error("Error al subir imagen a Cloudinary");
  const data = await response.json();
  return data.secure_url;
}

// === Cargar perfiles desde Firestore ===
async function cargarPerfiles() {
  const snapshot = await getDocs(collection(db, "Perfiles"));
  snapshot.forEach((docSnap) => {
    const perfil = docSnap.data();
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <img src="${perfil.Foto}" alt="${perfil.Nombre}">
      <h3>${perfil.Nombre}</h3>
      <p>Rol: ${perfil.Rol}</p>
      <div class="icons">
        ${perfil.Github ? `<a href="${perfil.Github}" target="_blank" class="fab fa-github"></a>` : ''}
        ${perfil.Linkedin ? `<a href="${perfil.Linkedin}" target="_blank" class="fab fa-linkedin"></a>` : ''}
      </div>
    `;

    card.addEventListener("click", () => {
      if (!usuarioLogueado) return;
      perfilEditId = docSnap.id;
      editNombre.value = perfil.Nombre;
      editRol.value = perfil.Rol;
      editGithub.value = perfil.Github;
      editLinkedin.value = perfil.Linkedin;
      previewImg.src = perfil.Foto;
      editModal.style.display = "block";
    });

    container.appendChild(card);
  });
}

// === Guardar cambios al perfil ===
saveChangesBtn.addEventListener("click", async () => {
  const perfilRef = doc(db, "Perfiles", perfilEditId);
  let nuevaFotoURL = previewImg.src;

  if (editFoto.files[0]) {
    try {
      nuevaFotoURL = await uploadToCloudinary(editFoto.files[0]);
    } catch (err) {
      alert("Error al subir la imagen");
      return;
    }
  }

  const updatedData = {
    Nombre: editNombre.value,
    Rol: editRol.value,
    Github: editGithub.value,
    Linkedin: editLinkedin.value,
    Foto: nuevaFotoURL
  };

  try {
    await updateDoc(perfilRef, updatedData);
    alert("✅ Perfil actualizado correctamente");
    editModal.style.display = "none";
    location.reload();
  } catch (err) {
    alert("❌ Error al guardar en la base de datos");
  }
});

// === Eventos ===
closeEditBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

loginIcon.addEventListener("click", () => {
  if (usuarioLogueado) {
    usuarioLogueado = false;
    alert("Has cerrado sesión");
    location.reload();
  } else {
    modal.style.display = "block";
  }
});

closeBtn.addEventListener("click", () => {
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

  const snapshot = await getDocs(collection(db, "Usuarios"));
  let encontrado = false;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.username === username && data.password === password) {
      encontrado = true;
    }
  });

  if (encontrado) {
    usuarioLogueado = true;
    modal.style.display = "none";
    status.textContent = "✅ ¡Inicio de sesión exitoso!";
  } else {
    status.textContent = "❌ Usuario o contraseña incorrectos";
  }
});

// === Inicializar ===
document.addEventListener("DOMContentLoaded", () => {
  cargarPerfiles();
});
