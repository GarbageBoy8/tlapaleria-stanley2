-- ================================================================
-- SENTENCIAS SQL PARA INSERTAR TODOS LOS PRODUCTOS DEL CATÁLOGO
-- ================================================================
-- IMPORTANTE: Ejecuta estas sentencias en tu base de datos MySQL
-- Asegúrate de estar usando la base de datos correcta antes de ejecutar

-- ================================================================
-- PRODUCTOS DE HERRAMIENTAS DE CORTE
-- ================================================================

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Serrucho Pequeño',
    'Serrucho Pequeño.',
    200.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Serrucho Grande',
    'Serrucho Grande.',
    380.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Sierra Para Metal',
    'Sierra para el corte de metal.',
    450.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Pinzas de Corte Mini',
    'Pinzas de Corte Mini.',
    49.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Pinzas de Corte',
    'Pinzas de Corte.',
    119.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Cutter Reforzado',
    'Cutter Reforzado de Acero inoxidable.',
    99.00
);

-- ================================================================
-- PRODUCTOS DE DESARMADORES
-- ================================================================

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Desarmador de Cruz',
    'Desarmador de cruz punta de metal con mango de plastico reforzado.',
    80.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Desarmador Plano',
    'Desarmador de cruz punta de metal con mango de plastico reforzado',
    80.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Desarmadores(Cruz y Plano)',
    'Conjunto de 2 desarmores uno de cruzy uno Plano.',
    145.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Llave Inglesa',
    'Llave Inglesa de acero inoxidable con mango de plastico.',
    199.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Juego de 11 llaves combinadas',
    'Conjunto de 11 llaves combinadas.',
    680.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Juego de 6 llaves de Tubo',
    'Conjunto de 6 llaves de Tubo.',
    499.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Juego de Llaves Allen',
    'Psquete de llaves Allen.',
    349.00
);

-- ================================================================
-- PRODUCTOS ANTIGUOS (que aún aparecen en otras páginas)
-- ================================================================

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Martillo de Uña',
    'Martillo de uña curva, mango de madera, 16 oz. Ideal para carpintería.',
    150.00
);

INSERT INTO productos (nombre, descripcion, precio) 
VALUES (
    'Juego Desarmadores',
    'Juego de 6 desarmadores de precisión, punta magnética. Incluye planos y de cruz.',
    220.00
);

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
-- SELECT id_producto, nombre, precio FROM productos ORDER BY nombre;

-- ================================================================
-- Si ya insertaste algunos productos antes y quieres empezar de cero:
-- ================================================================
-- DELETE FROM productos;
-- (Esto eliminará TODOS los productos, úsalo con cuidado)

