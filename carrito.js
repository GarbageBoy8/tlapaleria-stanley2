
document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES GLOBALES ---
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
    const contadorCarrito = document.querySelector('.container-user .number'); 
    
   
    // El ícono de la canasta, que ABRIRÁ la modal
    const btnAbrirModal = document.querySelector('.fa-basket-shopping'); 
    
    // La modal (el fondo oscuro)
    const modal = document.getElementById('modal-carrito');
    
    // El botón 'x' para CERRAR la modal
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    
    // El 'div' DENTRO de la modal donde irán los productos
    const contenedorItems = document.getElementById('carrito-items-container');
    // ================================================================

    const toast = document.getElementById('toast-notificacion');

    // El carrito empieza vacío 
    let carrito = []; 
    
    // Actualizamos la vista (mostrará "vacío" al inicio)
    actualizarVistaDelCarrito();

    // Evento para los botones de agregar 
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarProductoAlCarrito);
    });

   
    // Al hacer clic en el ícono de la canasta, se abre la modal
    btnAbrirModal.addEventListener('click', () => {
        modal.style.display = 'flex'; // Usamos 'flex' por el centrado del CSS
    });

    // Al hacer clic en la 'x', se cierra la modal
    btnCerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Opcional: Cerrar la modal si se hace clic FUERA de la ventana
    modal.addEventListener('click', (evento) => {
        // Si el clic fue directamente en el fondo oscuro...
        if (evento.target === modal) {
            modal.style.display = 'none';
        }
    });
    // ================================================================


    /**
     * Función para agregar un producto al carrito.
     * 
     */
    function agregarProductoAlCarrito(evento) {
        const boton = evento.target;
        const card = boton.closest('.card-producto');
        const nombre = card.querySelector('.producto-nombre').innerText;
        const precioTexto = card.querySelector('.precio').innerText;
        const imagenSrc = card.querySelector('.producto-imagen img').src;
        const precio = parseFloat(precioTexto.replace('$', '').replace(',', ''));

        const producto = {
            id: nombre.toLowerCase().replace(/\s+/g, '-'),
            nombre: nombre,
            precio: precio,
            imagen: imagenSrc,
            cantidad: 1
        };

        const productoExistente = carrito.find(prod => prod.id === producto.id);
    
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push(producto);
        }

        mostrarToast(`"${nombre}" se agregó al carrito`);
        actualizarVistaDelCarrito();

    }

    /**
     * Actualiza el contador, el desplegable y el total.
     */
    function actualizarVistaDelCarrito() {
       
        //  limpiamos el contenedor DENTRO de la modal
        contenedorItems.innerHTML = ''; 
      

        let totalAcumulado = 0;
        let totalItems = 0;

        // Si el carrito está vacío
        if (carrito.length === 0) {
            // Ponemos el mensaje en el contenedor de la modal
            contenedorItems.innerHTML = '<p>Tu carrito está vacío</p>';
            contadorCarrito.innerText = '(0)'; // El contador del ícono
            return; 
        }

        // Si hay productos, los recorremos
        carrito.forEach(prod => {
            totalAcumulado += prod.precio * prod.cantidad;
            totalItems += prod.cantidad;

            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto-en-carrito'); 
            productoDiv.innerHTML = `
                <img src="${prod.imagen}" alt="${prod.nombre}" width="50">
                <div class="info-producto-carrito">
                    <p>${prod.nombre}</p>
                    <p>${prod.cantidad} x $${prod.precio.toFixed(2)}</p>
                </div>
            `;
          
            // ================================================================
            contenedorItems.appendChild(productoDiv);
            // ================================================================
        });

        // Actualizamos el contador del ícono (esto no cambia)
        contadorCarrito.innerText = `(${totalItems})`;

        // Añadimos el total
        const totalDiv = document.createElement('div');
        totalDiv.classList.add('total-carrito');
        totalDiv.innerHTML = `<h3>Total: $${totalAcumulado.toFixed(2)}</h3>`;
        
       
        contenedorItems.appendChild(totalDiv);
      
        // Añadir botón de "Limpiar Carrito" 
        const btnLimpiar = document.createElement('button');
        btnLimpiar.id = 'btn-limpiar-carrito'; 
        btnLimpiar.innerText = 'Vaciar Carrito';
        btnLimpiar.addEventListener('click', limpiarCarrito);
        
       
        contenedorItems.appendChild(btnLimpiar);
      
    }

    /**
     * Vacía el carrito en memoria y actualiza la vista.
     * 
     */
    function limpiarCarrito() {
        carrito = [];
        actualizarVistaDelCarrito();
    }


    /**
     * Muestra la notificación toast con un mensaje.
     */
    function mostrarToast(mensaje) {
        // 1. Pone el mensaje en el div
        // (Buscamos la variable 'toast' que definiste arriba)
        toast.innerText = mensaje;
        
        // 2. Añade la clase 'show' para que aparezca
        toast.classList.add('show');

        // 3. Después de 3 segundos (3000ms), quita la clase
        setTimeout(function(){ 
            toast.classList.remove('show'); 
        }, 3000);
    }
    // ================================================================


}); 