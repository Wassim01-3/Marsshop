<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\User;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class TelegramNotificationService
{
    private string $botToken;
    private array $chatIds;
    private HttpClientInterface $httpClient;

    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameterBag
    ) {
        $this->httpClient = $httpClient;
        $this->botToken = $parameterBag->get('app.telegram.bot_token');
        $this->chatIds = $parameterBag->get('app.telegram.chat_ids');
    }

    public function sendOrderNotification(Order $order): bool
    {
        $message = $this->formatOrderMessage($order);
        
        $success = true;
        foreach ($this->chatIds as $chatId) {
            try {
                $response = $this->httpClient->request('POST', "https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                    'json' => [
                        'chat_id' => $chatId,
                        'text' => $message,
                        'parse_mode' => 'HTML',
                        'disable_web_page_preview' => true
                    ]
                ]);

                if ($response->getStatusCode() !== 200) {
                    $success = false;
                }
            } catch (\Exception $e) {
                // Log the error but continue with other chat IDs
                error_log("Telegram notification failed for chat ID {$chatId}: " . $e->getMessage());
                $success = false;
            }
        }

        return $success;
    }



    private function formatOrderMessage(Order $order): string
    {
        $user = $order->getUser();
        $items = $order->getItems();
        
        // Format total with comma as decimal separator and TND currency
        $total = number_format($order->getTotal(), 3, ',', ' ');
        if (substr($total, -4) === ',000') {
            $total = substr($total, 0, -4);
        }
        $total .= ' TND';

        $message = "🛒 <b>Nouvelle Commande Reçue!</b>\n\n";
        $message .= "📋 <b>Détails de la commande:</b>\n";
        $message .= "• ID: #{$order->getId()}\n";
        $message .= "• Statut: {$order->getStatus()}\n";
        $message .= "• Date: " . $order->getCreatedAt()->format('d/m/Y H:i') . "\n";
        $message .= "• Total: <b>{$total}</b>\n\n";

        // Customer information
        $message .= "👤 <b>Informations client:</b>\n";
        if ($user) {
            $message .= "• Nom: {$user->getName()}\n";
            $message .= "• Email: {$user->getEmail()}\n";
            if ($user->getPhone()) {
                $message .= "• Téléphone: {$user->getPhone()}\n";
            }
            if ($user->getAddress()) {
                $message .= "• Adresse: {$user->getAddress()}\n";
            }
        } else {
            // Guest order
            if ($order->getCustomerName()) {
                $message .= "• Nom: {$order->getCustomerName()}\n";
            }
            if ($order->getCustomerPhone()) {
                $message .= "• Téléphone: {$order->getCustomerPhone()}\n";
            }
            if ($order->getCustomerAddress()) {
                $message .= "• Adresse: {$order->getCustomerAddress()}\n";
            }
        }

        // Order items
        if (!empty($items)) {
            $message .= "\n📦 <b>Articles commandés:</b>\n";
            foreach ($items as $index => $item) {
                $itemPrice = number_format($item['price'], 3, ',', ' ');
                if (substr($itemPrice, -4) === ',000') {
                    $itemPrice = substr($itemPrice, 0, -4);
                }
                $itemPrice .= ' TND';
                
                $itemTotal = number_format($item['price'] * $item['quantity'], 3, ',', ' ');
                if (substr($itemTotal, -4) === ',000') {
                    $itemTotal = substr($itemTotal, 0, -4);
                }
                $itemTotal .= ' TND';
                
                $message .= ($index + 1) . ". <b>{$item['name']}</b>\n";
                $message .= "   Quantité: <b>{$item['quantity']}</b> × {$itemPrice} = {$itemTotal}\n";
                
                if (isset($item['color']) && $item['color']) {
                    $color = $item['color'];
                    if (is_array($color)) {
                        $color = implode(', ', $color);
                    }
                    $message .= "   Couleur: <b>{$color}</b>\n";
                }
                if (isset($item['size']) && $item['size']) {
                    $message .= "   Taille: <b>{$item['size']}</b>\n";
                }
                $message .= "\n";
            }
        }

        // Notes
        if ($order->getNotes()) {
            $message .= "📝 <b>Notes:</b>\n";
            $message .= "{$order->getNotes()}\n\n";
        }

        return $message;
    }
} 
