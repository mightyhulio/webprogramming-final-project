<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');

$host = 'localhost';
$dbname = 'nexustech_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $statement = $pdo->query(
        "SELECT id, NAME AS name, description, price, category, image_url
         FROM products
         ORDER BY id DESC"
    );

    $products = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed.'
    ]);
}