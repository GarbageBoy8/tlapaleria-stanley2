// Espera a que todo el contenido HTML se haya cargado
document.addEventListener("DOMContentLoaded", function() {
    
    // --- Simulación de inicio de sesión ---
    // (En un caso real, estos datos vendrían de tu base de datos)
    const usuarioActual = {
        id: 123,
        nombre: "Ana López",
        email: "ana.lopez@ejemplo.com"
    };
    // ---------------------------------------

    // 1. Obtenemos el elemento del saludo
    const displayNameElement = document.getElementById("display-name");

    // 2. Verificamos que exista y le ponemos el nombre
    if (displayNameElement) {
        displayNameElement.textContent = usuarioActual.nombre;
    }

    // --- Lógica para el icono de inicial (en tu página principal) ---
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
        // Tomamos la primera letra del nombre
        const inicial = usuarioActual.nombre.charAt(0).toUpperCase();
        userIcon.textContent = inicial;
    }
});