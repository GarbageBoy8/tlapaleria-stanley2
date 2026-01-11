<?php
// Credenciales
$host = 'b1hf6fpfdraxhlc7wjwa-mysql.services.clever-cloud.com';
$user = 'udyruyjl4j4c9qe6';
$pass = 'oEElEzD4MJ7Q8ocPidJb';
$db = 'b1hf6fpfdraxhlc7wjwa';

try {
    // Conectar
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        die("Error de conexión: " . $conn->connect_error);
    }
    
    echo "<h2>Conexiones activas:</h2>";
    
    // Mostrar procesos
    $result = $conn->query("SHOW PROCESSLIST");
    
    $killed = 0;
    while($row = $result->fetch_assoc()) {
        echo "ID: {$row['Id']} | Usuario: {$row['User']} | Estado: {$row['Command']} | Tiempo: {$row['Time']}s<br>";
        
        // Matar conexiones en SLEEP del mismo usuario
        if($row['User'] == $user && $row['Command'] == 'Sleep' && $row['Id'] != $conn->thread_id) {
            if($conn->query("KILL {$row['Id']}")) {
                echo "✓ Conexión {$row['Id']} cerrada<br>";
                $killed++;
            }
        }
    }
    
    echo "<br><strong>Total conexiones cerradas: $killed</strong>";
    
    $conn->close();
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>