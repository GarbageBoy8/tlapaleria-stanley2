// 📦 Dependencias principales
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

// 🔧 Cargar variables de entorno (.env)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Conexión con MySQL en Clever Cloud (usa las variables del .env)
const db = mysql.createConnection({
  host: process.env.DB_HOST,         // Host de Clever Cloud
  user: process.env.DB_USER,         // Usuario
  password: process.env.DB_PASSWORD, // Contraseña
  database: process.env.DB_NAME,     // Nombre de la base de datos
  port: process.env.DB_PORT || 3306  // Puerto (por defecto 3306)
});

// 🚀 Verificar conexión
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    return;
  }
  console.log('✅ Conectado exitosamente a MySQL en Clever Cloud');
});

// 📥 Ruta para registrar usuarios
app.post("/register", (req, res) => {
  console.log("📥 Datos recibidos en registro:", req.body);

  const { nombre, usuario, correo, password } = req.body;

  // Validación de campos vacíos
  if (!nombre?.trim() || !usuario?.trim() || !correo?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Faltan datos o hay campos vacíos" });
  }

  const sql = `
    INSERT INTO crtusuarios (nombre, usuario, correo, password)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nombre, usuario, correo, password], (err, result) => {
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

// 📥 Ruta para verificar inicio de sesión
app.post('/verify', (req, res) => {
  console.log("📥 Intento de inicio de sesión:", req.body);

  const { usuario, password } = req.body; // ← corregido: 'usuario' en lugar de 'username'

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const sql = 'SELECT * FROM crtusuarios WHERE usuario = ? AND password = ?';
  db.query(sql, [usuario, password], (err, results) => {
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

// 🌐 Ruta raíz para verificar el estado del servidor
app.get('/', (req, res) => {
  res.send('Servidor backend conectado a Clever Cloud 🚀');
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
