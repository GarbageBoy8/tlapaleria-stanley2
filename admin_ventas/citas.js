document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('citas-table-body');
    // El botón refresh puede que ya no exista si eliminamos toda la barra de filtros, 
    // pero si dejamos un botón de actualizar en otro lado, lo usamos.
    // En el HTML anterior, el botón estaba DENTRO de los filtros.
    // Si el usuario pidió quitar filtros, asumimos carga automática.

    // Cargar citas al iniciar
    cargarCitas();

    async function cargarCitas() {
        try {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando...</td></tr>';

            console.log("Intentando cargar citas desde:", `${API_BASE_URL}/api/admin/citas`);

            const response = await fetch(`${API_BASE_URL}/api/admin/citas`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            let citas = await response.json();

            renderTable(citas);
        } catch (error) {
            console.error('Error detallado:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
        }
    }

    function renderTable(citas) {
        tableBody.innerHTML = '';

        if (citas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron citas.</td></tr>';
            return;
        }

        citas.forEach(cita => {
            const tr = document.createElement('tr');

            const fecha = new Date(cita.fecha).toLocaleDateString('es-MX');
            const estadoColor = getColorEstado(cita.estado);

            // Botón de acción principal según estado
            let accionBtn = '';
            if (cita.estado === 'pendiente') {
                accionBtn = `<button class="btn-action btn-resuelto" onclick="cambiarEstado(${cita.id_cita}, 'resuelto')" style="background-color: #2980b9; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Marcar Resuelto</button>`;
            } else if (cita.estado === 'resuelto') {
                accionBtn = `<span style="color: green;"><i class="fa-solid fa-check"></i> Completado</span>`;
            } else {
                accionBtn = `<span>${cita.estado}</span>`;
            }

            tr.innerHTML = `
                <td>#${cita.id_cita}</td>
                <td>${fecha}</td>
                <td>${cita.hora}</td>
                <td>
                    <div style="font-weight: bold;">${cita.cliente}</div>
                    <div style="font-size: 0.8em; color: #666;">${cita.correo}</div>
                </td>
                <td>${cita.descripcion}</td>
                <td>
                    <span style="padding: 5px 10px; border-radius: 15px; background-color: ${estadoColor}; color: white; font-size: 0.85em;">
                        ${cita.estado}
                    </span>
                </td>
                <td>
                    ${accionBtn}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.cambiarEstado = async (idCita, nuevoEstado) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/citas/${idCita}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                alert('Estado actualizado correctamente');
                cargarCitas(); // Recargar tabla
            } else {
                alert('Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };

    function getColorEstado(estado) {
        switch (estado.toLowerCase()) {
            case 'pendiente': return '#f39c12'; // Naranja
            case 'confirmada': return '#27ae60'; // Verde
            case 'resuelto': return '#2980b9'; // Azul
            case 'cancelada': return '#c0392b'; // Rojo
            default: return '#7f8c8d'; // Gris
        }
    }
});
