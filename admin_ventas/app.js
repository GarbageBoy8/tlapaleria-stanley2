// Datos de ejemplo para simular las ventas
const sampleSales = [
    {
        id: "V-001",
        date: "2023-10-15",
        customer: "Juan Pérez",
        products: "Laptop, Mouse",
        total: 1250.00,
        status: "completed"
    },
    {
        id: "V-002",
        date: "2023-10-14",
        customer: "María García",
        products: "Smartphone, Funda",
        total: 850.50,
        status: "completed"
    },
    {
        id: "V-003",
        date: "2023-10-13",
        customer: "Carlos López",
        products: "Tablet, Teclado",
        total: 620.75,
        status: "pending"
    },
    {
        id: "V-004",
        date: "2023-10-12",
        customer: "Ana Martínez",
        products: "Monitor, Cable HDMI",
        total: 320.00,
        status: "completed"
    },
    {
        id: "V-005",
        date: "2023-10-11",
        customer: "Luis Rodríguez",
        products: "Auriculares, Adaptador",
        total: 150.25,
        status: "cancelled"
    },
    {
        id: "V-006",
        date: "2023-10-10",
        customer: "Elena Sánchez",
        products: "Impresora, Cartuchos",
        total: 280.00,
        status: "completed"
    },
    {
        id: "V-007",
        date: "2023-10-09",
        customer: "Pedro Gómez",
        products: "Router, Cable Ethernet",
        total: 95.50,
        status: "pending"
    },
    {
        id: "V-008",
        date: "2023-10-08",
        customer: "Sofía Hernández",
        products: "Smartwatch, Banda",
        total: 210.00,
        status: "completed"
    },
    {
        id: "V-009",
        date: "2023-10-07",
        customer: "Miguel Torres",
        products: "Cámara, Trípode",
        total: 450.75,
        status: "completed"
    },
    {
        id: "V-010",
        date: "2023-10-06",
        customer: "Laura Díaz",
        products: "Altavoz, Cable AUX",
        total: 120.00,
        status: "cancelled"
    }
];

// Función para renderizar la tabla de ventas
function renderSalesTable(salesData) {
    const tableBody = document.getElementById('sales-table-body');
    if (!tableBody) return; // Evitar errores si no existe la tabla en esta página

    tableBody.innerHTML = '';

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
        }

        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>${sale.products}</td>
            <td>$${sale.total.toFixed(2)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-primary" onclick="viewSale('${sale.id}')">Ver</button>
                <button class="btn btn-secondary" onclick="editSale('${sale.id}')">Editar</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Funciones para las acciones de venta
function viewSale(saleId) {
    alert(`Ver detalles de la venta: ${saleId}`);
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
    alert('Actualizando datos...');
    cargarEstadisticas(); // Recargar también las estadísticas
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    // Cargar estadísticas reales
    cargarEstadisticas();

    // Renderizar la tabla con datos de ejemplo
    renderSalesTable(sampleSales);

    // Asignar eventos a los botones
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);
});

// Función para cargar estadísticas reales
async function cargarEstadisticas() {
    try {
        // Usar la URL base definida en config.js si existe, o la de producción
        const API_URL = 'https://tlapaleria-backend.onrender.com';

        const response = await fetch(`${API_URL}/api/admin/stats`);
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
            console.error('Error al cargar estadísticas');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}