// 🛒 Sistema de Carrito conectado al Backend

document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES ---
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
    const contadorCarrito = document.querySelector('.container-user .number');
    const btnAbrirModal = document.querySelector('.fa-basket-shopping');
    const modal = document.getElementById('modal-carrito');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const contenedorItems = document.getElementById('carrito-items-container');
    const toast = document.getElementById('toast-notificacion');

    // Mapa de productos: nombre -> id_producto (se carga desde el backend)
    let mapaProductos = {};
    let usuarioActual = null;

    // Cargar usuario desde localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
    }

    // Cargar mapa de productos desde el backend
    cargarMapaProductos().then(() => {
        // Verificar que se cargaron productos
        if (Object.keys(mapaProductos).length === 0) {
            console.warn('⚠️ No se encontraron productos en la base de datos. Asegúrate de ejecutar insertar_productos.sql');
            mostrarToast('⚠️ No hay productos en la BD. Ejecuta el SQL de inserción.');
        } else {
            console.log('✅ Productos cargados correctamente:', Object.keys(mapaProductos).length, 'productos');
        }
    });

    // Si hay usuario logueado, cargar su carrito y actualizar enlace de perfil
    if (usuarioActual) {
        cargarCarritoUsuario();

        // Actualizar enlace del ícono de usuario
        const userLink = document.querySelector('.container-user a');
        if (userLink) {
            const currentHref = userLink.getAttribute('href');
            // Reemplazar "Inicio de Sesion" por "user" manteniendo la ruta relativa
            if (currentHref.includes('Inicio de Sesion')) {
                const newHref = currentHref.replace('Inicio de Sesion', 'user');
                userLink.setAttribute('href', newHref);
            }
        }
    } else {
        actualizarVistaDelCarrito([]);
    }

    // Evento para los botones de agregar 
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarProductoAlCarrito);
    });

    // Al hacer clic en el ícono de la canasta, se abre la modal
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            modal.style.display = 'flex';
            // Recargar carrito al abrir modal
            if (usuarioActual) {
                cargarCarritoUsuario();
            }
        });
    }

    // Al hacer clic en la 'x', se cierra la modal
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Cerrar la modal si se hace clic FUERA de la ventana
    if (modal) {
        modal.addEventListener('click', (evento) => {
            if (evento.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Carga el mapa de productos desde el backend
     * Esto permite mapear nombres de productos a sus IDs
     */
    async function cargarMapaProductos() {
        try {
            console.log('🔄 Intentando cargar productos desde:', `${API_BASE_URL}/productos`);
            const response = await fetch(`${API_BASE_URL}/productos`);

            if (response.ok) {
                const productos = await response.json();
                console.log('✅ Productos cargados desde BD:', productos);

                if (productos.length === 0) {
                    console.warn('⚠️ La base de datos está vacía. No hay productos insertados.');
                    mostrarToast('Bienvenido');
                    return;
                }

                // Crear mapa: nombre -> id_producto
                productos.forEach(prod => {
                    mapaProductos[prod.nombre] = prod.id_producto;
                });
                console.log('✅ Mapa de productos creado:', mapaProductos);
                console.log('📋 Productos disponibles:', Object.keys(mapaProductos));
            } else {
                console.error('❌ Error al cargar productos. Status:', response.status);
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                mostrarToast('❌ Error al cargar productos del servidor');
            }
        } catch (error) {
            console.error('❌ Error de conexión al cargar productos:', error);
            mostrarToast('❌ Error de conexión. Verifica que el backend esté funcionando.');
        }
    }

    /**
     * Carga el carrito del usuario desde el backend
     */
    async function cargarCarritoUsuario() {
        if (!usuarioActual) {
            actualizarVistaDelCarrito([]);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/carrito/${usuarioActual.id}`);
            if (response.ok) {
                const carrito = await response.json();
                actualizarVistaDelCarrito(carrito);
            } else {
                console.error('Error al cargar carrito');
                actualizarVistaDelCarrito([]);
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            actualizarVistaDelCarrito([]);
        }
    }

    /**
     * Agrega un producto al carrito en el backend
     */
    async function agregarProductoAlCarrito(evento) {
        // Verificar si hay usuario logueado
        if (!usuarioActual) {
            mostrarToast('⚠️ Debes iniciar sesión para agregar productos al carrito');
            setTimeout(() => {
                window.location.href = '../Inicio de Sesion/index.html';
            }, 2000);
            return;
        }

        const boton = evento.target;
        const card = boton.closest('.card-producto');
        const nombreElemento = card.querySelector('.producto-nombre');

        if (!nombreElemento) {
            mostrarToast('❌ Error: No se pudo encontrar el nombre del producto');
            console.error('Elemento .producto-nombre no encontrado');
            return;
        }

        const nombre = nombreElemento.innerText.trim();
        console.log('Nombre del producto obtenido del HTML:', nombre);
        console.log('Mapa de productos disponible:', Object.keys(mapaProductos));

        // Buscar el id_producto usando el mapa
        const id_producto = mapaProductos[nombre];

        if (!id_producto) {
            mostrarToast('❌ Error: Producto no encontrado en la base de datos');
            console.error('Producto no encontrado en el mapa. Nombre buscado:', nombre);
            console.error('Productos disponibles en BD:', Object.keys(mapaProductos));
            console.error('¿Coinciden exactamente? Verifica mayúsculas, minúsculas y espacios.');
            return;
        }

        console.log('ID del producto encontrado:', id_producto);

        try {
            const response = await fetch(`${API_BASE_URL}/carrito/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioActual.id,
                    id_producto: id_producto,
                    cantidad: 1
                })
            });

            const result = await response.json();

            if (response.ok) {
                mostrarToast(`✅ "${nombre}" se agregó al carrito`);
                // Recargar el carrito para mostrar los cambios
                cargarCarritoUsuario();
            } else {
                mostrarToast('❌ ' + (result.error || 'Error al agregar producto'));
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            mostrarToast('❌ Error de conexión con el servidor');
        }
    }

    /**
     * Actualiza la vista del carrito
     */
    function actualizarVistaDelCarrito(carrito) {
        if (!contenedorItems) return;

        contenedorItems.innerHTML = '';

        let totalAcumulado = 0;
        let totalAcumuladoConDescuento = 0;
        let totalItems = 0;

        // Detectar si estamos en la página de ofertas
        const esPaginaOfertas = window.location.pathname.includes('ofertas');
        const descuento = esPaginaOfertas ? 0.20 : 0; // 20% de descuento en ofertas

        // Si el carrito está vacío
        if (!carrito || carrito.length === 0) {
            contenedorItems.innerHTML = '<p>Tu carrito está vacío</p>';
            if (contadorCarrito) {
                contadorCarrito.innerText = '(0)';
            }
            return;
        }

        // Si hay productos, los recorremos
        carrito.forEach(prod => {
            const precioOriginal = parseFloat(prod.precio);
            const precioConDescuento = esPaginaOfertas ? precioOriginal * (1 - descuento) : precioOriginal;
            const subtotal = precioOriginal * prod.cantidad;
            const subtotalConDescuento = precioConDescuento * prod.cantidad;
            
            totalAcumulado += subtotal;
            totalAcumuladoConDescuento += subtotalConDescuento;
            totalItems += prod.cantidad;

            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto-en-carrito');
            
            // HTML para mostrar precio con o sin descuento
            let precioHTML = '';
            if (esPaginaOfertas) {
                precioHTML = `
                    <p style="display: flex; flex-direction: column; gap: 2px; align-items: flex-start;">
                        <span style="font-size: 0.85em; color: #999; text-decoration: line-through;">$${precioOriginal.toFixed(2)} x ${prod.cantidad}</span>
                        <span style="font-weight: 600; color: var(--primary-color, #06196F);">$${precioConDescuento.toFixed(2)} x ${prod.cantidad}</span>
                    </p>
                    <p style="color: #666; font-size: 0.9em;">
                        <span style="text-decoration: line-through; color: #999;">Subtotal: $${subtotal.toFixed(2)}</span><br>
                        <span style="font-weight: 600; color: #28a745;">Subtotal con descuento: $${subtotalConDescuento.toFixed(2)}</span>
                    </p>
                `;
            } else {
                precioHTML = `
                    <p>$${precioOriginal.toFixed(2)} x ${prod.cantidad}</p>
                    <p style="color: #666; font-size: 0.9em;">Subtotal: $${subtotal.toFixed(2)}</p>
                `;
            }

            productoDiv.innerHTML = `
                <div class="info-producto-carrito" style="flex: 1;">
                    <p><strong>${prod.nombre}</strong></p>
                    ${precioHTML}
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; align-items: center;">
                    <button class="btn-cantidad" data-id="${prod.id_producto}" data-accion="aumentar" style="width: 30px; height: 30px; border: 1px solid #ddd; background: #f0f0f0; cursor: pointer;">+</button>
                    <span style="min-width: 30px; text-align: center;">${prod.cantidad}</span>
                    <button class="btn-cantidad" data-id="${prod.id_producto}" data-accion="disminuir" style="width: 30px; height: 30px; border: 1px solid #ddd; background: #f0f0f0; cursor: pointer;">-</button>
                    <button class="btn-eliminar" data-id="${prod.id_producto}" style="margin-top: 5px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8em;">Eliminar</button>
                </div>
            `;

            contenedorItems.appendChild(productoDiv);
        });

        // Agregar eventos a los botones de cantidad y eliminar
        contenedorItems.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id_producto = parseInt(btn.getAttribute('data-id'));
                const accion = btn.getAttribute('data-accion');
                const producto = carrito.find(p => p.id_producto === id_producto);

                if (!producto) return;

                let nuevaCantidad = producto.cantidad;
                if (accion === 'aumentar') {
                    nuevaCantidad++;
                } else if (accion === 'disminuir' && nuevaCantidad > 1) {
                    nuevaCantidad--;
                } else if (accion === 'disminuir' && nuevaCantidad === 1) {
                    // Si la cantidad es 1 y se intenta disminuir, eliminar el producto
                    eliminarProductoDelCarrito(id_producto);
                    return;
                }

                await actualizarCantidadProducto(id_producto, nuevaCantidad);
            });
        });

        contenedorItems.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id_producto = parseInt(btn.getAttribute('data-id'));
                eliminarProductoDelCarrito(id_producto);
            });
        });

        // Actualizar contador del ícono
        if (contadorCarrito) {
            contadorCarrito.innerText = `(${totalItems})`;
        }

        // Añadir el total
        const totalDiv = document.createElement('div');
        totalDiv.classList.add('total-carrito');
        
        if (esPaginaOfertas) {
            const ahorro = totalAcumulado - totalAcumuladoConDescuento;
            totalDiv.innerHTML = `
                <div style="text-align: right;">
                    <p style="color: #999; text-decoration: line-through; margin: 5px 0; font-size: 0.9em;">Total original: $${totalAcumulado.toFixed(2)}</p>
                    <h3 style="color: #28a745; margin: 5px 0;">Total con descuento: $${totalAcumuladoConDescuento.toFixed(2)}</h3>
                    <p style="color: #666; font-size: 0.85em; margin: 5px 0;">Ahorras: $${ahorro.toFixed(2)}</p>
                </div>
            `;
        } else {
            totalDiv.innerHTML = `<h3>Total: $${totalAcumulado.toFixed(2)}</h3>`;
        }
        
        contenedorItems.appendChild(totalDiv);

        // Añadir botón de "Vaciar Carrito"
        const btnLimpiar = document.createElement('button');
        btnLimpiar.id = 'btn-limpiar-carrito';
        btnLimpiar.innerText = 'Vaciar Carrito';
        btnLimpiar.style.cssText = 'background-color: #d9534f; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 48%; margin-right: 4%;';
        btnLimpiar.addEventListener('click', vaciarCarrito);

        // Añadir botón de "Comprar Carrito"
        const btnComprar = document.createElement('button');
        btnComprar.id = 'btn-comprar-carrito';
        btnComprar.innerText = 'Comprar Carrito';
        btnComprar.style.cssText = 'background-color: #28a745; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 48%;';
        btnComprar.addEventListener('click', comprarCarrito);

        const containerBotones = document.createElement('div');
        containerBotones.style.display = 'flex';
        containerBotones.appendChild(btnLimpiar);
        containerBotones.appendChild(btnComprar);
        contenedorItems.appendChild(containerBotones);
    }

    /**
     * Procesa la compra del carrito
     */
    async function comprarCarrito() {
        if (!usuarioActual) return;

        if (!confirm('¿Confirmar compra de todos los productos del carrito?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/comprar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioActual.id
                })
            });

            const result = await response.json();

            if (response.ok) {
                mostrarToast('🎉 ¡Compra realizada con éxito!');
                alert('¡Gracias por tu compra! Tu pedido ha sido registrado.');
                cargarCarritoUsuario();
            } else {
                mostrarToast('❌ ' + (result.error || 'Error al procesar la compra'));
            }
        } catch (error) {
            console.error('Error al procesar compra:', error);
            mostrarToast('❌ Error de conexión');
        }
    }

    /**
     * Actualiza la cantidad de un producto en el carrito
     */
    async function actualizarCantidadProducto(id_producto, nuevaCantidad) {
        if (!usuarioActual) return;

        try {
            const response = await fetch(`${API_BASE_URL}/carrito/actualizar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioActual.id,
                    id_producto: id_producto,
                    cantidad: nuevaCantidad
                })
            });

            if (response.ok) {
                cargarCarritoUsuario();
            } else {
                const result = await response.json();
                mostrarToast('❌ ' + (result.error || 'Error al actualizar cantidad'));
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            mostrarToast('❌ Error de conexión');
        }
    }

    /**
     * Elimina un producto del carrito
     */
    async function eliminarProductoDelCarrito(id_producto) {
        if (!usuarioActual) return;

        try {
            const response = await fetch(`${API_BASE_URL}/carrito/eliminar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioActual.id,
                    id_producto: id_producto
                })
            });

            if (response.ok) {
                mostrarToast('✅ Producto eliminado del carrito');
                cargarCarritoUsuario();
            } else {
                const result = await response.json();
                mostrarToast('❌ ' + (result.error || 'Error al eliminar producto'));
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            mostrarToast('❌ Error de conexión');
        }
    }

    /**
     * Vacía el carrito completo
     */
    async function vaciarCarrito() {
        if (!usuarioActual) return;

        if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/carrito/vaciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioActual.id
                })
            });

            if (response.ok) {
                mostrarToast('✅ Carrito vaciado');
                cargarCarritoUsuario();
            } else {
                const result = await response.json();
                mostrarToast('❌ ' + (result.error || 'Error al vaciar carrito'));
            }
        } catch (error) {
            console.error('Error al vaciar carrito:', error);
            mostrarToast('❌ Error de conexión');
        }
    }

    /**
     * Muestra la notificación toast con un mensaje
     */
    function mostrarToast(mensaje) {
        if (!toast) return;

        toast.innerText = mensaje;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Escuchar cambios en localStorage para detectar login/logout
    window.addEventListener('storage', (e) => {
        if (e.key === 'usuario') {
            if (e.newValue) {
                usuarioActual = JSON.parse(e.newValue);
                cargarCarritoUsuario();
            } else {
                usuarioActual = null;
                actualizarVistaDelCarrito([]);
            }
        }
    });

    // También verificar si el usuario cambió en la misma pestaña
    setInterval(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
            const nuevoUsuario = JSON.parse(usuarioGuardado);
            if (!usuarioActual || nuevoUsuario.id !== usuarioActual.id) {
                usuarioActual = nuevoUsuario;
                cargarCarritoUsuario();
            }
        } else if (usuarioActual) {
            usuarioActual = null;
            actualizarVistaDelCarrito([]);
        }
    }, 1000);
});
