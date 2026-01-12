// 📦 Sistema de Inventario - Admin Panel
const API_BASE_URL = 'https://tlapaleria-backend.onrender.com';

// Variable para almacenar productos
let productosData = [];
let modoEdicion = false;

// Inicializar página
document.addEventListener('DOMContentLoaded', function () {
    cargarProductos();
});

/**
 * Cargar todos los productos desde el backend
 */
async function cargarProductos() {
    const tableBody = document.getElementById('productos-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando productos...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/productos`);

        if (response.ok) {
            productosData = await response.json();
            renderizarTabla(productosData);
        } else {
            const errorText = await response.text();
            console.error('Error al cargar productos:', errorText);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Error: ${errorText}</td></tr>`;
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error de conexión con el servidor</td></tr>';
    }
}

/**
 * Renderizar tabla de productos
 */
function renderizarTabla(productos) {
    const tableBody = document.getElementById('productos-table-body');
    tableBody.innerHTML = '';

    if (productos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay productos registrados</td></tr>';
        return;
    }

    productos.forEach(producto => {
        const row = document.createElement('tr');

        // Determinar clase de stock
        let stockClass = '';
        if (producto.stock <= 0) {
            stockClass = 'status cancelled';
        } else if (producto.stock <= 5) {
            stockClass = 'status pending';
        } else {
            stockClass = 'status completed';
        }

        row.innerHTML = `
            <td>#${producto.id_producto}</td>
            <td>${producto.nombre}</td>
            <td>$${parseFloat(producto.precio).toFixed(2)}</td>
            <td><span class="${stockClass}">${producto.stock}</span></td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${producto.descripcion || '-'}</td>
            <td>
                <button class="btn btn-primary" onclick="editarProducto(${producto.id_producto})" style="margin-right: 5px;">✏️ Editar</button>
                <button class="btn" onclick="eliminarProducto(${producto.id_producto})" style="background-color: #e74c3c; color: white;">🗑️ Eliminar</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Abrir modal para agregar nuevo producto
 */
function abrirModalAgregar() {
    modoEdicion = false;
    document.getElementById('modal-titulo').textContent = '➕ Agregar Producto';
    document.getElementById('producto-id').value = '';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-precio').value = '';
    document.getElementById('producto-stock').value = '0';
    document.getElementById('producto-descripcion').value = '';
    document.getElementById('modal-producto').style.display = 'flex';
}

/**
 * Abrir modal para editar producto existente
 */
function editarProducto(id) {
    const producto = productosData.find(p => p.id_producto === id);
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }

    modoEdicion = true;
    document.getElementById('modal-titulo').textContent = '✏️ Editar Producto';
    document.getElementById('producto-id').value = producto.id_producto;
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-precio').value = producto.precio;
    document.getElementById('producto-stock').value = producto.stock;
    document.getElementById('producto-descripcion').value = producto.descripcion || '';
    document.getElementById('modal-producto').style.display = 'flex';
}

/**
 * Cerrar modal
 */
function cerrarModal() {
    document.getElementById('modal-producto').style.display = 'none';
}

/**
 * Guardar producto (crear o editar)
 */
async function guardarProducto(event) {
    event.preventDefault();

    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('producto-nombre').value.trim();
    const precio = parseFloat(document.getElementById('producto-precio').value);
    const stock = parseInt(document.getElementById('producto-stock').value);
    const descripcion = document.getElementById('producto-descripcion').value.trim();

    if (!nombre || isNaN(precio)) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    const datos = { nombre, precio, stock, descripcion };

    try {
        let response;

        if (modoEdicion && id) {
            // Editar producto existente
            response = await fetch(`${API_BASE_URL}/api/admin/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            // Crear nuevo producto
            response = await fetch(`${API_BASE_URL}/api/admin/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }

        const result = await response.json();

        if (response.ok) {
            alert(modoEdicion ? '✅ Producto actualizado exitosamente' : '✅ Producto agregado exitosamente');
            cerrarModal();
            cargarProductos();
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo guardar el producto'));
        }
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('❌ Error de conexión con el servidor');
    }
}

/**
 * Eliminar producto
 */
async function eliminarProducto(id) {
    const producto = productosData.find(p => p.id_producto === id);
    const nombreProducto = producto ? producto.nombre : 'este producto';

    if (!confirm(`¿Estás seguro de eliminar "${nombreProducto}"?\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/productos/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Producto eliminado exitosamente');
            cargarProductos();
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo eliminar el producto'));
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('❌ Error de conexión con el servidor');
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function (event) {
    const modal = document.getElementById('modal-producto');
    if (event.target === modal) {
        cerrarModal();
    }
});
