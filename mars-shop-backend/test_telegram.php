<?php

require_once 'vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;
use App\Service\TelegramNotificationService;
use App\Entity\Order;

// Load environment variables
$dotenv = new Dotenv();
$dotenv->loadEnv('.env');

// Create a test order
$testOrder = new Order();
$testOrder->setStatus('pending');
$testOrder->setTotal(150.500);
$testOrder->setItems([
    [
        'name' => 'Produit Test',
        'price' => 75.250,
        'quantity' => 2,
        'color' => 'Rouge',
        'size' => 'M'
    ]
]);
$testOrder->setCustomerName('Client Test');
$testOrder->setCustomerPhone('+216 12345678');
$testOrder->setCustomerAddress('Adresse Test, Tunis');
$testOrder->setNotes('Ceci est un test de notification Telegram');

// Test the notification
try {
    $kernel = new \App\Kernel('dev', true);
    $kernel->boot();
    $container = $kernel->getContainer();
    
    $telegramService = $container->get(TelegramNotificationService::class);
    $success = $telegramService->sendOrderNotification($testOrder);
    
    if ($success) {
        echo "✅ Test notification sent successfully!\n";
    } else {
        echo "❌ Test notification failed!\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} 