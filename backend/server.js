const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Configura tu conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // tu usuario MySQL
  password: 'admin123', // tu contraseña si tienes
  database: 'tlapaleria_stanley' // base de datos que creaste
});
//hola mundo
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

// 📥 Ruta para verificar inicio de sesión
app.post('/verify', (req, res) => {
  console.log("📥 Intento de inicio de sesión:", req.body);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Buscamos al usuario en la base de datos
  const sql = 'SELECT * FROM crtusuarios WHERE usuario = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length > 0) {
      // Usuario encontrado ✅
      console.log(`✅ Inicio de sesión exitoso: ${username}`);
      res.json({ message: '✅ Inicio de sesión exitoso' });
    } else {
      // No se encontró coincidencia ❌
      console.log('❌ Usuario o contraseña incorrectos');
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  });
});
 //este es el server

// 📥 Ruta para registrar usuarios
app.post("/register", (req, res) => {
  console.log("📥 Datos recibidos:", req.body); // 👈 Ver qué llega del frontend

  const { nombre, usuario, correo, password } = req.body;

  // ✅ 1️⃣ Validar que todos los campos existan y no estén vacíos
  if (!nombre?.trim() || !usuario?.trim() || !correo?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Faltan datos o hay campos vacíos" });
  }

  // ✅ 2️⃣ Preparar la consulta SQL
  const sql = `
    INSERT INTO crtusuarios (nombre, usuario, correo, password)
    VALUES (?, ?, ?, ?)
  `;

  // ✅ 3️⃣ Ejecutar la consulta
  db.query(sql, [nombre, usuario, correo, password], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar en la base de datos:", err);

      // Detección de errores comunes
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

//otro comentario prueba

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});