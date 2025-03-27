import { db } from './config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const container = document.getElementById('cards-container');

async function cargarPerfiles() {
  const querySnapshot = await getDocs(collection(db, "Perfiles"));

  querySnapshot.forEach((doc) => {
    const perfil = doc.data();

    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <img src="${perfil.Foto}" alt="${perfil.Nombre}">
      <h3>${perfil.Nombre}</h3>
      <p>Rol: ${perfil.Rol}</p>
      <div class="icons">
        <a href="${perfil.Github}" target="_blank" class="fab fa-github"></a>
        <a href="${perfil.Linkedin}" target="_blank" class="fab fa-linkedin"></a>
      </div>
    `;

    container.appendChild(card);
  });
}

const loginIcon = document.getElementById("loginIcon");
const modal = document.getElementById("loginModal");
const closeBtn = modal.querySelector(".close");
const loginBtn = document.getElementById("loginBtn");
const status = document.getElementById("loginStatus");

// Mostrar modal
loginIcon.addEventListener("click", () => {
  modal.style.display = "block";
});

// Cerrar modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  status.textContent = "";
});

// Verificar login
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
    status.textContent = "✅ ¡Inicio de sesión exitoso!";
    // Aquí puedes redirigir o mostrar contenido extra
    modal.style.display = "none";
  } else {
    status.textContent = "❌ Usuario o contraseña incorrectos";
  }
});

cargarPerfiles();
