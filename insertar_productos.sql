-- ================================================================
-- SENTENCIAS SQL PARA INSERTAR PRODUCTOS EN LA BASE DE DATOS
-- ================================================================
-- IMPORTANTE: Ejecuta estas sentencias en tu base de datos MySQL
-- Asegúrate de estar usando la base de datos correcta antes de ejecutar

-- Producto 1: Martillo de Uña
INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Martillo de Uña',
    'Martillo de uña curva, mango de madera, 16 oz. Ideal para carpintería.',
    150.00
);

-- Producto 2: Juego Desarmadores
INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Juego Desarmadores',
    'Juego de 6 desarmadores de precisión, punta magnética. Incluye planos y de cruz.',
    220.00
);

-- Producto 3: Pinzas Electricista
INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Pinzas Electricista',
    'Pinzas de electricista de 8 pulgadas, con mango anti-derrapante.',
    180.00
);

-- ================================================================
-- VERIFICAR QUE LOS PRODUCTOS SE INSERTARON CORRECTAMENTE:
-- ================================================================
-- Ejecuta esta consulta para ver todos los productos:
-- SELECT id_producto, nombre, precio FROM productos;

-- ================================================================
-- Si ya insertaste los productos antes y quieres eliminarlos primero:
-- ================================================================
-- DELETE FROM productos WHERE nombre IN ('Martillo de Uña', 'Juego Desarmadores', 'Pinzas Electricista');

