// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function () {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    // Configurar evento para cada botón de navegación
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSection = this.getAttribute('data-section');

            // Remover clase active de todos los botones y secciones
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Agregar clase active al botón clickeado y sección correspondiente
            this.classList.add('active');
            document.getElementById(`${targetSection}-section`).classList.add('active');
        });
    });

    // --- Lógica de Usuario Real y Logout ---

    // 1. Obtener usuario del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    let usuarioActual = null;

    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
    } else {
        // Si no hay usuario, redirigir al login (seguridad básica)
        window.location.href = '../Inicio de Sesion/index.html';
        return;
    }

    // 2. Mostrar nombre del usuario
    const displayNameElement = document.getElementById("display-name");
    if (displayNameElement && usuarioActual) {
        displayNameElement.textContent = usuarioActual.nombre;
    }

    // 3. Lógica del botón de Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function () {
            // Borrar usuario del localStorage
            localStorage.removeItem('usuario');
            // Redirigir al inicio
            window.location.href = '../index.html';
        });
    }

    // --- Lógica para el icono de inicial (opcional) ---
    const userIcon = document.getElementById("profilePageIcon");
    if (userIcon) {
        // Si quieres mostrar la inicial en el círculo grande
        // userIcon.querySelector('img').style.display = 'none'; 
        // userIcon.textContent = usuarioActual.nombre.charAt(0).toUpperCase();
    }
});