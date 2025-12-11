// URL Base de la API
const API_BASE_URL = 'https://tlapaleria-backend.onrender.com';

// Variable global para almacenar las ventas cargadas
let ventasData = [];

// Función para renderizar la tabla de ventas
function renderSalesTable(salesData) {
    const tableBody = document.getElementById('sales-table-body');
    if (!tableBody) return; // Evitar errores si no existe la tabla en esta página

    // Guardar datos en variable global para acceder desde viewSale
    ventasData = salesData;

    tableBody.innerHTML = '';

    if (salesData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay ventas registradas</td></tr>';
        return;
    }

    salesData.forEach(sale => {
        const row = document.createElement('tr');

        // Determinar la clase de estado
        let statusClass = '';
        let statusText = '';

        switch (sale.status) {
            case 'completed':
                statusClass = 'completed';
                statusText = 'Completado';
                break;
            case 'pending':
                statusClass = 'pending';
                statusText = 'Pendiente';
                break;
            case 'cancelled':
                statusClass = 'cancelled';
                statusText = 'Cancelado';
                break;
            default:
                statusClass = 'completed';
                statusText = 'Completado';
        }

        // Formatear fecha
        const fecha = new Date(sale.date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        row.innerHTML = `
            <td>#${sale.id}</td>
            <td>${fecha}</td>
            <td>${sale.customer}</td>
            <td>${sale.products}</td>
            <td>$${parseFloat(sale.total).toFixed(2)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-primary" onclick="viewSale('${sale.id}')">Ver</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Función para ver detalles de la venta
function viewSale(saleId) {
    // Buscar la venta en los datos cargados
    const venta = ventasData.find(v => v.id == saleId);

    if (!venta) {
        alert('No se encontraron los detalles de la venta.');
        return;
    }

    // Formatear fecha
    const fecha = new Date(venta.date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Determinar estado
    let estadoTexto = 'Completado';
    if (venta.status === 'pending') estadoTexto = 'Pendiente';
    if (venta.status === 'cancelled') estadoTexto = 'Cancelado';

    // Mostrar detalles completos
    const mensaje = `
    ═══════════════════════════════
    DETALLES DE LA VENTA #${venta.id}


👤 Cliente: ${venta.customer}

📅 Fecha: ${fecha}

📦 Productos: ${venta.products}

💰 Total: $${parseFloat(venta.total).toFixed(2)}

📋 Estado: ${estadoTexto}
═══════════════════════════════`;

    alert(mensaje);
}

function editSale(saleId) {
    alert(`Editar venta: ${saleId}`);
}

// Función para exportar datos
function exportData() {
    alert('Exportando datos de ventas...');
}

// Función para actualizar datos
function refreshData() {
    cargarEstadisticas();
    cargarHistorialVentas();
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', async function () {
    // Cargar datos reales secuencialmente para no saturar conexiones
    await cargarEstadisticas();
    await cargarHistorialVentas();

    // Asignar eventos a los botones
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);
});

// Función para cargar estadísticas reales
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
        if (response.ok) {
            const data = await response.json();

            const totalVentasElement = document.getElementById('total-ventas');
            const totalProductosElement = document.getElementById('total-productos');
            const totalUsuariosElement = document.getElementById('total-usuarios');

            if (totalVentasElement) {
                totalVentasElement.textContent = `$${parseFloat(data.ventas_totales || 0).toFixed(2)}`;
            }

            if (totalProductosElement) {
                totalProductosElement.textContent = data.productos_vendidos || 0;
            }

            if (totalUsuariosElement) {
                totalUsuariosElement.textContent = data.total_usuarios || 0;
            }
        } else {
            console.error('Error al cargar estadísticas:', await response.text());
        }
    } catch (error) {
        console.error('Error de conexión (stats):', error);
    }
}

// Función para cargar historial de ventas real
async function cargarHistorialVentas() {
    const tableBody = document.getElementById('sales-table-body');
    if (!tableBody) return; // Solo ejecutar si estamos en la página de ventas

    try {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando ventas...</td></tr>';

        const response = await fetch(`${API_BASE_URL}/api/admin/ventas`);
        if (response.ok) {
            const data = await response.json();

            // Mapear datos de la API al formato de la tabla
            const salesData = data.map(item => ({
                id: item.id_pedido,
                date: item.fecha,
                customer: item.cliente,
                products: item.productos,
                total: item.total,
                status: item.estado || 'completed'
            }));

            renderSalesTable(salesData);
        } else {
            const errorText = await response.text();
            console.error('Error al cargar historial de ventas:', errorText);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Error: ${errorText}</td></tr>`;
        }
    } catch (error) {
        console.error('Error de conexión (ventas):', error);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: red;">Error de conexión</td></tr>';
    }
}
