// 📦 Dependencias principales
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

// 🔧 Cargar variables de entorno (.env)
dotenv.config();

const app = express();

// ✅ Configuración de CORS para permitir tu frontend de Vercel
app.use(cors({
  origin: [
    'https://tlapaleria-stanley.vercel.app',  // dominio principal en Vercel
    'https://tlapaleria-stanley2.vercel.app', // dominio alternativo en Vercel
    'http://localhost:3000',                   // opcional: para pruebas locales
    'http://127.0.0.1:8080',                   // Frontend local
    'http://localhost:8080'                   // Alternativa local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// 🧠 Función para crear pool de MySQL (reutilizable en caso de error)
let db;
function createPool() {
  db = mysql.createPool({
    host: process.env.DB_HOST,         // Host de Clever Cloud
    user: process.env.DB_USER,         // Usuario
    password: process.env.DB_PASSWORD, // Contraseña
    database: process.env.DB_NAME,     // Nombre de la base de datos
    port: process.env.DB_PORT || 3306, // Puerto
    port: process.env.DB_PORT || 3306, // Puerto
    connectionLimit: 5,                // Reducido a 5 para evitar saturar plan gratuito
    waitForConnections: true,          // Espera si no hay conexiones disponibles
    queueLimit: 0,                     // Sin límite de cola
    enableKeepAlive: true,             // Mantener conexiones vivas
    keepAliveInitialDelay: 0           // Sin retardo inicial
  });

  console.log('🔁 Pool de conexiones MySQL creado');

  // 🚨 Manejador de errores del pool
  db.on('error', (err) => {
    console.error('⚠️ Error en el pool MySQL:', err.code);
    if (
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ECONNRESET' ||
      err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
    ) {
      console.log('♻️ Reiniciando pool de MySQL...');
      createPool();
    }
  });
}

// 🧩 Crear el pool por primera vez
createPool();

// 🚀 Probar conexión inicial
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
  } else {
    console.log('✅ Conexión establecida correctamente con MySQL en Clever Cloud');
    connection.release();
  }
});

// 💓 Mantener conexión viva (ping cada 5 minutos)
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('⚠️ Error en ping a MySQL:', err.code);
    } else {
      console.log('💓 Conexión MySQL activa (ping exitoso)');
    }
  });
}, 5 * 60 * 1000); // cada 5 min

// 📥 Ruta para registrar usuarios
app.post("/register", (req, res) => {
  console.log("📥 Datos recibidos en registro:", req.body);
  const { nombre, usuario, correo, password } = req.body;

  if (!nombre?.trim() || !usuario?.trim() || !correo?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Faltan datos o hay campos vacíos" });
  }

  const sql = `
    INSERT INTO crtusuarios (nombre, usuario, correo, password)
    VALUES (?, ?, ?, ?)
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Error al obtener conexión:", err);
      return res.status(500).json({ error: "Error de conexión con la base de datos" });
    }

    connection.query(sql, [nombre, usuario, correo, password], (err, result) => {
      connection.release(); // ✅ Liberar conexión

      if (err) {
        console.error("❌ Error al insertar en la base de datos:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "El usuario o correo ya existe" });
        }
        return res.status(500).json({ error: "Error al guardar en la base de datos" });
      }

      console.log("✅ Usuario insertado con ID:", result.insertId);
      res.status(201).json({
        message: "✅ Usuario guardado correctamente",
        id: result.insertId,
      });
    });
  });
});

// ================================================================
// 📥 Ruta para verificar inicio de sesión (MODIFICADA)
// ================================================================
app.post('/verify', (req, res) => {
  console.log("📥 Intento de inicio de sesión:", req.body);
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Seleccionamos solo los datos que necesitamos, NUNCA la contraseña
  // AHORA INCLUIMOS EL ROL
  const sql = 'SELECT id, nombre, usuario, correo, rol FROM crtusuarios WHERE usuario = ? AND password = ?';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    connection.query(sql, [usuario, password], (err, results) => {
      connection.release(); // ✅ Liberar conexión

      if (err) {
        console.error('❌ Error en la consulta:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (results.length > 0) {
        console.log(`✅ Inicio de sesión exitoso: ${usuario}`);
        res.json({
          success: true,
          usuario: results[0] // Incluye 'rol'
        });
      } else {
        console.warn(`⚠️ Fallo de inicio de sesión: ${usuario}`);
        res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }
    });
  });
});


// ================================================================
// 🛒 RUTAS DEL CARRITO DE COMPRAS (AÑADIDAS)
// ================================================================

/**
 * 1. OBTENER el carrito de un usuario
 * Se usa un JOIN para traer los datos del producto (nombre, precio, descripcion)
 */
app.get('/carrito/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      c.id_producto,
      c.cantidad,
      p.nombre,
      p.precio,
      p.descripcion
    FROM carrito c
    JOIN productos p ON c.id_producto = p.id_producto
    WHERE c.id_usuario = ?
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [id_usuario], (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error en la consulta GET carrito:', err);
        return res.status(500).json({ error: 'Error interno' });
      }
      res.json(results);
    });
  });
});

/**
 * 2. AGREGAR un producto al carrito
 * Usa "ON DUPLICATE KEY UPDATE" para sumar la cantidad si el producto ya existe.
 */
app.post('/carrito/agregar', (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  if (!id_usuario || !id_producto || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos (usuario, producto, cantidad)' });
  }

  // Esta consulta inserta O actualiza si la llave (id_usuario, id_producto) ya existe
  const sql = `
    INSERT INTO carrito (id_usuario, id_producto, cantidad)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [id_usuario, id_producto, cantidad], (err, result) => {
      connection.release();
      if (err) {
        console.error('❌ Error al agregar al carrito:', err);
        return res.status(500).json({ error: 'Error al agregar' });
      }
      res.status(201).json({ message: 'Producto agregado al carrito', affectedRows: result.affectedRows });
    });
  });
});

/**
 * 3. ACTUALIZAR cantidad de un producto en el carrito
 */
app.put('/carrito/actualizar', (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  if (!id_usuario || !id_producto || cantidad === undefined) {
    return res.status(400).json({ error: 'Faltan datos (usuario, producto, cantidad)' });
  }

  const sql = 'UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [cantidad, id_usuario, id_producto], (err, result) => {
      connection.release();
      if (err) {
        console.error('❌ Error al actualizar carrito:', err);
        return res.status(500).json({ error: 'Error al actualizar' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }
      res.json({ message: 'Cantidad actualizada exitosamente' });
    });
  });
});

/**
 * 4. ELIMINAR un producto específico del carrito
 */
app.delete('/carrito/eliminar', (req, res) => {
  const { id_usuario, id_producto } = req.body;

  if (!id_usuario || !id_producto) {
    return res.status(400).json({ error: 'Faltan datos (usuario, producto)' });
  }

  const sql = 'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [id_usuario, id_producto], (err, result) => {
      connection.release();
      if (err) {
        console.error('❌ Error al eliminar del carrito:', err);
        return res.status(500).json({ error: 'Error al eliminar' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }
      res.json({ message: 'Producto eliminado del carrito' });
    });
  });
});

/**
 * 5. VACIAR el carrito de un usuario
 */
app.post('/carrito/vaciar', (req, res) => {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario' });
  }

  const sql = 'DELETE FROM carrito WHERE id_usuario = ?';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [id_usuario], (err, result) => {
      connection.release();
      if (err) {
        console.error('❌ Error al vaciar carrito:', err);
        return res.status(500).json({ error: 'Error al vaciar' });
      }
      res.json({ message: 'Carrito vaciado exitosamente' });
    });
  });
});

/**
 * 6. OBTENER todos los productos (para mapear nombres a IDs)
 */
app.get('/productos', (req, res) => {
  const sql = 'SELECT id_producto, nombre, precio, descripcion FROM productos';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [], (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error en la consulta GET productos:', err);
        return res.status(500).json({ error: 'Error interno' });
      }
      res.json(results);
    });
  });
});


// ================================================================
// 🛍️ RUTAS DE COMPRA Y PEDIDOS (NUEVAS)
// ================================================================

/**
 * 7. PROCESAR COMPRA (POST /api/comprar)
 * - Obtiene items del carrito
 * - Calcula total
 * - Crea pedido en tabla 'pedidos'
 * - Mueve items a 'detalles_pedido'
 * - Vacía el carrito
 */
app.post('/api/comprar', (req, res) => {
  const { id_usuario } = req.body;

  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario' });
  }

  db.getConnection(async (err, connection) => {
    if (err) {
      console.error('❌ Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    try {
      // 1. Iniciar transacción
      await connection.promise().beginTransaction();

      // 2. Obtener items del carrito con precios actuales
      const [items] = await connection.promise().query(`
        SELECT c.id_producto, c.cantidad, p.precio 
        FROM carrito c 
        JOIN productos p ON c.id_producto = p.id_producto 
        WHERE c.id_usuario = ?
      `, [id_usuario]);

      if (items.length === 0) {
        connection.release();
        return res.status(400).json({ error: 'El carrito está vacío' });
      }

      // 3. Calcular total
      const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

      // 4. Crear pedido
      const [pedidoResult] = await connection.promise().query(`
        INSERT INTO pedidos (id_usuario, total) VALUES (?, ?)
      `, [id_usuario, total]);

      const id_pedido = pedidoResult.insertId;

      // 5. Insertar detalles
      const detallesValues = items.map(item => [id_pedido, item.id_producto, item.cantidad, item.precio]);
      await connection.promise().query(`
        INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) 
        VALUES ?
      `, [detallesValues]);

      // 6. Vaciar carrito
      await connection.promise().query('DELETE FROM carrito WHERE id_usuario = ?', [id_usuario]);

      // 7. Confirmar transacción
      await connection.promise().commit();
      connection.release();

      console.log(`✅ Compra exitosa para usuario ${id_usuario}. Pedido #${id_pedido}`);
      res.status(201).json({ message: 'Compra realizada con éxito', id_pedido });

    } catch (error) {
      // Revertir cambios si algo falla
      await connection.promise().rollback();
      connection.release();
      console.error('❌ Error en transacción de compra:', error);
      res.status(500).json({ error: 'Error al procesar la compra' });
    }
  });
});

/**
 * 8. OBTENER HISTORIAL DE PEDIDOS (GET /api/pedidos/:id_usuario)
 * - Retorna los pedidos y sus productos agrupados
 */
app.get('/api/pedidos/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      p.id_pedido, 
      p.fecha, 
      p.total,
      dp.cantidad, 
      dp.precio_unitario, 
      prod.nombre as nombre_producto
    FROM pedidos p
    JOIN detalles_pedido dp ON p.id_pedido = dp.id_pedido
    JOIN productos prod ON dp.id_producto = prod.id_producto
    WHERE p.id_usuario = ?
    ORDER BY p.fecha DESC
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión', details: err.message });
    }

    connection.query(sql, [id_usuario], (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error al obtener pedidos:', err);
        return res.status(500).json({ error: 'Error al obtener historial', details: err.message });
      }

      // Agrupar resultados por pedido
      const pedidosMap = new Map();

      results.forEach(row => {
        if (!pedidosMap.has(row.id_pedido)) {
          pedidosMap.set(row.id_pedido, {
            id_pedido: row.id_pedido,
            fecha: row.fecha,
            total: row.total,
            productos: []
          });
        }
        pedidosMap.get(row.id_pedido).productos.push({
          nombre: row.nombre_producto,
          cantidad: row.cantidad,
          precio: row.precio_unitario
        });
      });

      const historial = Array.from(pedidosMap.values());
      res.json(historial);
    });
  });
});

/**
 * 9. OBTENER HISTORIAL DE VENTAS PARA ADMIN (GET /api/admin/ventas)
 * - Retorna todas las ventas con detalles de usuario y productos
 */
app.get('/api/admin/ventas', (req, res) => {
  // Consulta plana sin GROUP BY para evitar errores de sql_mode
  const sql = `
    SELECT 
      p.id_pedido,
      p.fecha,
      p.total,
      u.nombre as cliente,
      'completed' as estado,
      prod.nombre as nombre_producto,
      dp.cantidad
    FROM pedidos p
    JOIN crtusuarios u ON p.id_usuario = u.id
    JOIN detalles_pedido dp ON p.id_pedido = dp.id_pedido
    JOIN productos prod ON dp.id_producto = prod.id_producto
    ORDER BY p.fecha DESC
  `;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error de conexión en /api/admin/ventas:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error al obtener ventas:', err);
        // Devolver el mensaje de error específico para depuración
        return res.status(500).json({ error: 'Error al obtener historial de ventas', details: err.message });
      }

      try {
        // Agrupar resultados en JavaScript
        const ventasMap = {};

        results.forEach(row => {
          if (!ventasMap[row.id_pedido]) {
            ventasMap[row.id_pedido] = {
              id_pedido: row.id_pedido,
              fecha: row.fecha,
              total: row.total,
              cliente: row.cliente,
              estado: row.estado,
              productos: []
            };
          }
          ventasMap[row.id_pedido].productos.push(`${row.nombre_producto} (${row.cantidad})`);
        });

        // Convertir mapa a array y formatear string de productos
        const ventasFinal = Object.values(ventasMap).map(venta => ({
          ...venta,
          productos: venta.productos.join(', ')
        }));

        res.json(ventasFinal);
      } catch (processError) {
        console.error('❌ Error al procesar datos de ventas:', processError);
        res.status(500).json({ error: 'Error al procesar datos' });
      }
    });
  });
});

/**
 * 10. OBTENER ESTADÍSTICAS PARA ADMIN (GET /api/admin/stats)
 * - Retorna ventas totales y productos vendidos
 */
app.get('/api/admin/stats', (req, res) => {
  const sqlVentas = 'SELECT SUM(total) as total_ventas FROM pedidos';
  const sqlProductos = 'SELECT SUM(cantidad) as total_productos FROM detalles_pedido';
  const sqlUsuarios = 'SELECT COUNT(*) as total_usuarios FROM crtusuarios';

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: 'Error de conexión' });
    }

    // Ejecutar consultas secuencialmente (callback hell, pero seguro sin promesas configuradas en pool)
    connection.query(sqlVentas, (err, resultVentas) => {
      if (err) {
        connection.release();
        console.error('❌ Error al obtener ventas:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }

      connection.query(sqlProductos, (err, resultProductos) => {
        if (err) {
          connection.release();
          console.error('❌ Error al obtener productos:', err);
          return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        connection.query(sqlUsuarios, (err, resultUsuarios) => {
          connection.release();
          if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
          }

          const totalVentas = resultVentas[0].total_ventas || 0;
          const totalProductos = resultProductos[0].total_productos || 0;
          const totalUsuarios = resultUsuarios[0].total_usuarios || 0;

          res.json({
            ventas_totales: totalVentas,
            productos_vendidos: totalProductos,
            total_usuarios: totalUsuarios
          });
        });
      });
    });
  });
});

// ================================================================
// 📅 RUTAS DE CITAS Y REPARACIONES
// ================================================================

/**
 * 11. AGENDAR CITA (POST /api/citas)
 * - Valida que la fecha sea futura
 * - Valida que el horario esté disponible
 */
app.post('/api/citas', (req, res) => {
  const { id_usuario, fecha, hora, descripcion } = req.body;

  if (!id_usuario || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos (usuario, fecha, hora)' });
  }

  // 1. Validar fecha futura
  const fechaCita = new Date(`${fecha}T${hora}`);
  const ahora = new Date();

  if (fechaCita < ahora) {
    return res.status(400).json({ error: 'La fecha y hora deben ser futuras' });
  }

  // 2. Validar disponibilidad (evitar duplicados en misma fecha/hora)
  const sqlCheck = 'SELECT COUNT(*) as count FROM citas WHERE fecha = ? AND hora = ?';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error conexión:', err);
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sqlCheck, [fecha, hora], (err, results) => {
      if (err) {
        connection.release();
        console.error('❌ Error validando cita:', err);
        return res.status(500).json({ error: 'Error al validar disponibilidad' });
      }

      if (results[0].count > 0) {
        connection.release();
        return res.status(409).json({ error: 'Lo sentimos, ese horario ya está ocupado. Por favor elige otro.' });
      }

      // 3. Insertar cita si está libre
      const sqlInsert = 'INSERT INTO citas (id_usuario, fecha, hora, descripcion) VALUES (?, ?, ?, ?)';

      connection.query(sqlInsert, [id_usuario, fecha, hora, descripcion], (err, result) => {
        connection.release();
        if (err) {
          console.error('❌ Error al agendar cita:', err);
          return res.status(500).json({ error: 'Error al agendar la cita' });
        }
        res.status(201).json({ message: 'Cita agendada exitosamente', id_cita: result.insertId });
      });
    });
  });
});

/**
 * 12. OBTENER HISTORIAL DE CITAS (GET /api/citas/:id_usuario)
 */
app.get('/api/citas/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT id_cita, fecha, hora, descripcion, estado 
    FROM citas 
    WHERE id_usuario = ? 
    ORDER BY fecha DESC, hora DESC
  `;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [id_usuario], (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error al obtener citas:', err);
        return res.status(500).json({ error: 'Error al obtener historial de citas' });
      }
      res.json(results);
    });
  });
});

/**
 * 13. OBTENER TODAS LAS CITAS PARA ADMIN (GET /api/admin/citas)
 */
app.get('/api/admin/citas', (req, res) => {
  const sql = `
    SELECT 
      c.id_cita, 
      c.fecha, 
      c.hora, 
      c.descripcion, 
      c.estado,
      u.nombre as cliente,
      u.correo
    FROM citas c
    JOIN crtusuarios u ON c.id_usuario = u.id
    ORDER BY c.fecha DESC, c.hora DESC
  `;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        console.error('❌ Error al obtener todas las citas:', err);
        return res.status(500).json({ error: 'Error al obtener historial de citas' });
      }
      res.json(results);
    });
  });
});

/**
 * 14. ACTUALIZAR ESTADO DE CITA (PUT /api/admin/citas/:id/estado)
 */
app.put('/api/admin/citas/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'Falta el nuevo estado' });
  }

  const sql = 'UPDATE citas SET estado = ? WHERE id_cita = ?';

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ error: 'Error de conexión' });
    }

    connection.query(sql, [estado, id], (err, result) => {
      connection.release();
      if (err) {
        console.error('❌ Error al actualizar estado de cita:', err);
        return res.status(500).json({ error: 'Error al actualizar estado' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      res.json({ message: 'Estado actualizado correctamente' });
    });
  });
});

// 🌐 Ruta raíz para verificar el estado del servidor
app.get('/', (req, res) => {
  res.send('Servidor backend conectado a Clever Cloud 🚀');
});

// 🔍 Ruta de prueba API
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ El backend está funcionando correctamente" });
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
