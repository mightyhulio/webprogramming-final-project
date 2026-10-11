<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Only POST requests are allowed.'
    ]);
    exit;
}

$host = 'localhost';
$dbname = 'nexustech_db';
$username = 'root';
$password = '';

try {
    $input = json_decode(
        file_get_contents('php://input'),
        true,
        512,
        JSON_THROW_ON_ERROR
    );

    $companyName = trim($input['companyName'] ?? '');
    $workEmail = trim($input['workEmail'] ?? '');
    $companyDomain = trim($input['companyDomain'] ?? '');
    $businessRole = trim($input['businessRole'] ?? '');
    $companySize = trim($input['companySize'] ?? '');
    $softwareStack = trim($input['softwareStack'] ?? '');

    if (
        $companyName === '' ||
        $workEmail === '' ||
        $companyDomain === '' ||
        $businessRole === '' ||
        $companySize === '' ||
        $softwareStack === ''
    ) {
        http_response_code(422);
        echo json_encode([
            'error' => 'All fields are required.'
        ]);
        exit;
    }

    if (!filter_var($workEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode([
            'error' => 'Enter a valid work email address.'
        ]);
        exit;
    }

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $statement = $pdo->prepare(
        'INSERT INTO sandbox_requests (
            company_name,
            work_email,
            company_domain,
            business_role,
            company_size,
            software_stack
        ) VALUES (
            :company_name,
            :work_email,
            :company_domain,
            :business_role,
            :company_size,
            :software_stack
        )'
    );

    $statement->execute([
        ':company_name' => $companyName,
        ':work_email' => $workEmail,
        ':company_domain' => $companyDomain,
        ':business_role' => $businessRole,
        ':company_size' => $companySize,
        ':software_stack' => $softwareStack
    ]);

    http_response_code(201);

    echo json_encode([
        'message' => 'Sandbox request saved successfully.'
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        http_response_code(409);

        echo json_encode([
            'error' => 'A sandbox request already exists for this work email.'
        ]);
        exit;
    }

    http_response_code(500);

    echo json_encode([
        'error' => 'Could not save the sandbox request.'
    ]);
} catch (JsonException $error) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Invalid request data.'
    ]);
}