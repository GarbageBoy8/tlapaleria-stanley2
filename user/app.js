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

    // 4. Cargar historial de compras
    cargarHistorialCompras(usuarioActual.id);

    async function cargarHistorialCompras(idUsuario) {
        const listaCompras = document.getElementById('lista-compras');
        if (!listaCompras) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/pedidos/${idUsuario}`);

            if (response.ok) {
                const pedidos = await response.json();

                if (pedidos.length === 0) {
                    listaCompras.innerHTML = '<p>No has realizado ninguna compra aún.</p>';
                    return;
                }

                listaCompras.innerHTML = ''; // Limpiar mensaje de carga

                pedidos.forEach(pedido => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '15px';
                    li.style.borderBottom = '1px solid #eee';
                    li.style.paddingBottom = '10px';

                    const fecha = new Date(pedido.fecha).toLocaleDateString();
                    const total = parseFloat(pedido.total).toFixed(2);

                    let productosHtml = '';
                    pedido.productos.forEach(prod => {
                        productosHtml += `
                            <div style="display: flex; justify-content: space-between; font-size: 0.9em; color: #555;">
                                <span>${prod.cantidad}x ${prod.nombre}</span>
                                <span>$${parseFloat(prod.precio).toFixed(2)}</span>
                            </div>
                        `;
                    });

                    li.innerHTML = `
                        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
                            <span>Pedido #${pedido.id_pedido} (${fecha})</span>
                            <span class="item-price">$${total}</span>
                        </div>
                        <div class="detalles-pedido" style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
                            ${productosHtml}
                        </div>
                    `;

                    listaCompras.appendChild(li);
                });

            } else {
                console.error('Error al cargar historial');
                listaCompras.innerHTML = '<p>Error al cargar tus compras.</p>';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            listaCompras.innerHTML = '<p>Error de conexión.</p>';
        }
    }
});