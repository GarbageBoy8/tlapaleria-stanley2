document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cita');
    const historialContainer = document.getElementById('tabla-citas-body');
    const mensajeSinCitas = document.getElementById('mensaje-sin-citas');

    // Verificar usuario logueado
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
        alert('Debes iniciar sesión para agendar una cita.');
        window.location.href = '../Inicio de Sesion/index.html';
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    // Pre-llenar datos si existen
    if (usuario.nombre) document.getElementById('nombre').value = usuario.nombre;
    if (usuario.correo) document.getElementById('correo').value = usuario.correo;

    // Cargar historial
    cargarHistorial(usuario.id);

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const asunto = document.getElementById('asunto').value.trim();
        const fecha = document.getElementById('fecha-cita').value;
        const hora = document.getElementById('hora-cita').value;
        const mensaje = document.querySelector('textarea[name="mensaje"]').value.trim();

        // Validaciones básicas
        if (!nombre || !telefono || !correo || !asunto || !fecha || !hora || !mensaje) {
            alert('Por favor completa todos los campos.');
            return;
        }

        // Validar fecha futura (frontend check)
        const fechaCita = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        if (fechaCita < ahora) {
            alert('La fecha y hora deben ser futuras.');
            return;
        }

        try {
            // Enviar al backend
            const response = await fetch(`${API_URL}/api/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_usuario: usuario.id,
                    fecha,
                    hora,
                    descripcion: `${asunto}: ${mensaje}`
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Cita agendada exitosamente.');

                // Generar PDF (llamando a la función global del script inline si existe, o re-implementando)
                if (typeof genPDF === 'function') {
                    genPDF();
                }

                // Recargar historial y limpiar formulario
                cargarHistorial(usuario.id);
                form.reset();
                // Restaurar datos de usuario
                document.getElementById('nombre').value = usuario.nombre;
                document.getElementById('correo').value = usuario.correo;
            } else {
                alert(`❌ Error: ${data.error}`);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al conectar con el servidor.');
        }
    });

    async function cargarHistorial(idUsuario) {
        try {
            const response = await fetch(`${API_URL}/api/citas/${idUsuario}`);
            if (!response.ok) throw new Error('Error al obtener citas');

            const citas = await response.json();

            historialContainer.innerHTML = '';

            if (citas.length === 0) {
                mensajeSinCitas.style.display = 'block';
                return;
            }

            mensajeSinCitas.style.display = 'none';

            citas.forEach(cita => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 1rem; border-bottom: 1px solid #ddd;">${formatearFecha(cita.fecha)}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid #ddd;">${cita.hora}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid #ddd;">${cita.descripcion}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid #ddd;">
                        <span style="padding: 0.5rem 1rem; border-radius: 20px; background: ${getColorEstado(cita.estado)}; color: white; font-size: 0.9rem;">
                            ${cita.estado}
                        </span>
                    </td>
                `;
                historialContainer.appendChild(row);
            });

        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }

    function formatearFecha(fechaString) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-MX', opciones);
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
