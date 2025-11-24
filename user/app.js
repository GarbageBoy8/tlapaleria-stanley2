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

    // 2.5 Mostrar botón de admin si corresponde
    if (usuarioActual && usuarioActual.rol === 'admin') {
        const adminBtnContainer = document.getElementById('admin-panel-btn-container');
        if (adminBtnContainer) {
            adminBtnContainer.style.display = 'block';
        }
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

    // 4. Cargar historial de compras y citas (Secuencial para evitar saturar conexiones)
    async function cargarDatosPerfil() {
        if (usuarioActual && usuarioActual.id) {
            await cargarHistorialCompras(usuarioActual.id);
            await cargarHistorialCitas(usuarioActual.id);
        }
    }
    cargarDatosPerfil();

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
                const errorText = await response.text();
                console.error('Error al cargar historial:', response.status, errorText);
                listaCompras.innerHTML = `<p style="color: red;">Error ${response.status}: ${errorText || 'No se pudo cargar el historial'}</p>`;
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            listaCompras.innerHTML = `<p style="color: red;">Error de conexión: ${error.message}</p>`;
        }
    }

    async function cargarHistorialCitas(idUsuario) {
        const listaCitas = document.getElementById('lista-citas');
        if (!listaCitas) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/citas/${idUsuario}`);

            if (response.ok) {
                const citas = await response.json();

                if (citas.length === 0) {
                    listaCitas.innerHTML = '<p>No tienes citas agendadas.</p>';
                    return;
                }

                listaCitas.innerHTML = ''; // Limpiar mensaje de carga

                citas.forEach(cita => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '15px';
                    li.style.borderBottom = '1px solid #eee';
                    li.style.paddingBottom = '10px';
                    li.style.display = 'flex';
                    li.style.flexDirection = 'column';
                    li.style.gap = '5px';

                    const fecha = new Date(cita.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                    const estadoColor = getColorEstado(cita.estado);

                    li.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: bold; font-size: 1.1rem;">${cita.descripcion.split(':')[0]}</span>
                            <span style="padding: 4px 10px; border-radius: 15px; background: ${estadoColor}; color: white; font-size: 0.8rem;">
                                ${cita.estado}
                            </span>
                        </div>
                        <div style="color: #666; font-size: 0.9rem;">
                            <i class="fa-regular fa-calendar"></i> ${fecha} &nbsp;|&nbsp; 
                            <i class="fa-regular fa-clock"></i> ${cita.hora}
                        </div>
                        <div style="color: #888; font-size: 0.9rem; font-style: italic;">
                            ${cita.descripcion.split(':').slice(1).join(':').trim() || ''}
                        </div>
                    `;

                    listaCitas.appendChild(li);
                });

            } else {
                listaCitas.innerHTML = '<p>Error al cargar tus citas.</p>';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            listaCitas.innerHTML = '<p>Error de conexión.</p>';
        }
    }

    function getColorEstado(estado) {
        switch (estado.toLowerCase()) {
            case 'pendiente': return '#f39c12'; // Naranja
            case 'confirmada': return '#27ae60'; // Verde
            case 'cancelada': return '#c0392b'; // Rojo
            default: return '#7f8c8d'; // Gris
        }
    }
});