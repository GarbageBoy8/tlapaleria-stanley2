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
    'https://tlapaleria-stanley2.vercel.app', // dominio desplegado en Vercel
    'http://localhost:3000', // opcional: para pruebas locales
    'http://127.0.0.1:8080',                 // Frontend local
    'http://localhost:8080'              // Alternativa local
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
    connectionLimit: 10,               // Máximo de conexiones simultáneas
    waitForConnections: true,          // Espera si no hay conexiones disponibles
    queueLimit: 0                      // Sin límite de cola
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

// 📥 Ruta para verificar inicio de sesión
app.post('/verify', (req, res) => {
  console.log("📥 Intento de inicio de sesión:", req.body);
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const sql = 'SELECT * FROM crtusuarios WHERE usuario = ? AND password = ?';

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
        res.json({ message: '✅ Inicio de sesión exitoso' });
      } else {
        console.log('❌ Usuario o contraseña incorrectos');
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }
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
