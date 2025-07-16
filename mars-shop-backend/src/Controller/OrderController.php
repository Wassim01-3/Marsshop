<?php

namespace App\Controller;

use App\Entity\Order;
use App\Service\TelegramNotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\User\UserInterface;

class OrderController extends AbstractController
{
    #[Route('/api/orders', name: 'get_my_orders', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function listMyOrders(EntityManagerInterface $em): JsonResponse
    {
        /** @var UserInterface $user */
        $user = $this->getUser();
        $orders = $em->getRepository(Order::class)->findBy(['user' => $user]);

        $data = array_map(fn(Order $order) => [
            'id' => $order->getId(),
            'items' => $order->getItems(),
            'total' => $order->getTotal(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $orders);

        return $this->json($data);
    }

    #[Route('/api/orders/{id}', name: 'get_order_detail', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getOrderDetail(int $id, EntityManagerInterface $em): JsonResponse
    {
        /** @var UserInterface $user */
        $user = $this->getUser();
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order || $order->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $order->getId(),
            'items' => $order->getItems(),
            'total' => $order->getTotal(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/api/my-orders', name: 'get_my_orders_only', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function listOrdersForCurrentUser(EntityManagerInterface $em): JsonResponse
    {
        /** @var UserInterface $user */
        $user = $this->getUser();
        $orders = $em->getRepository(Order::class)->findBy(['user' => $user]);

        $data = array_map(fn(Order $order) => [
            'id' => $order->getId(),
            'items' => $order->getItems(),
            'total' => $order->getTotal(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $orders);

        return $this->json($data);
    }

    public function createOrder(Request $request, EntityManagerInterface $em, TelegramNotificationService $telegramService): JsonResponse
    {
        try {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

            // Debug: Log the received data size
            $dataSize = strlen(json_encode($data));
            error_log('Order creation data size: ' . $dataSize . ' bytes');

        if (!isset($data['items']) || !is_array($data['items'])) {
            return $this->json(['error' => 'Invalid or missing items.'], Response::HTTP_BAD_REQUEST);
        }

        $total = 0.0;
        $itemsWithNames = [];
        foreach ($data['items'] as $item) {
            if (!isset($item['price'], $item['quantity'])) {
                return $this->json(['error' => 'Invalid item data.'], Response::HTTP_BAD_REQUEST);
            }
            $total += $item['price'] * $item['quantity'];
            // Ensure product name is present
            if (!isset($item['name']) && isset($item['productId'])) {
                $product = $em->getRepository(\App\Entity\Product::class)->find($item['productId']);
                if ($product) {
                    $item['name'] = $product->getName();
                } else {
                    $item['name'] = 'Produit inconnu';
                }
            }
            $itemsWithNames[] = $item;
        }

        $order = new Order();
        if ($user) {
            $order->setUser($user);
        }
        $order->setItems($itemsWithNames);
        $order->setTotal($total);
        $order->setCustomerName($data['customerName'] ?? null);
        $order->setCustomerPhone($data['customerPhone'] ?? null);
        $order->setCustomerAddress($data['customerAddress'] ?? null);
        $order->setNotes($data['notes'] ?? null);

            // Debug: Log the customer data being set
            error_log('Setting customer data - Name: ' . ($data['customerName'] ?? 'null') . ', Phone: ' . ($data['customerPhone'] ?? 'null') . ', Address: ' . ($data['customerAddress'] ?? 'null'));

        $em->persist($order);
        $em->flush();

        // Send Telegram notification to admin
        try {
            $telegramService->sendOrderNotification($order);
        } catch (\Exception $e) {
            // Log the error but don't fail the order creation
            error_log('Telegram notification failed: ' . $e->getMessage());
        }

        // Remove the user's cart after successful checkout
        if ($user) {
            $cart = $em->getRepository(\App\Entity\Cart::class)->findOneBy(['user' => $user]);
            if ($cart) {
                $em->remove($cart);
                $em->flush();
            }
        }

        return $this->json([
            'message' => 'Order created successfully',
            'order' => [
                'id' => $order->getId(),
                'total' => $order->getTotal(),
                'status' => $order->getStatus(),
                'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                    'customerName' => $order->getCustomerName(),
                    'customerPhone' => $order->getCustomerPhone(),
                    'customerAddress' => $order->getCustomerAddress(),
                    'notes' => $order->getNotes(),
            ]
        ], Response::HTTP_CREATED);
        } catch (\Doctrine\DBAL\Driver\PDO\PDOException $e) {
            error_log('Database error during order creation: ' . $e->getMessage());
            return $this->json(['error' => 'Database error occurred. Please try again.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            error_log('Unexpected error during order creation: ' . $e->getMessage());
            return $this->json(['error' => 'An unexpected error occurred. Please try again.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
