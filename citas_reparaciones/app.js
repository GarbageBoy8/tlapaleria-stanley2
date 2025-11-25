document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cita');

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
            const response = await fetch(`${API_BASE_URL}/api/citas`, {
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

                // Generar PDF (llamando a la función global del script inline si existe)
                if (typeof genPDF === 'function') {
                    genPDF({
                        nombre,
                        telefono,
                        correo,
                        asunto,
                        fecha,
                        hora,
                        mensaje
                    });
                }

                // Limpiar formulario
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
});
