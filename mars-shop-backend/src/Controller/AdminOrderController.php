<?php

namespace App\Controller;

use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;

final class AdminOrderController extends AbstractController
{
    #[Route('/admin/order', name: 'app_admin_order')]
    public function index(): Response
    {
        return $this->render('admin_order/index.html.twig', [
            'controller_name' => 'AdminOrderController',
        ]);
    }

    #[Route('/api/admin/orders', name: 'admin_get_orders', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAllOrders(EntityManagerInterface $em): JsonResponse
    {
        $orders = $em->getRepository(Order::class)->findAll();

        $data = array_map(function(Order $order) use ($em) {
            $itemsWithProductInfo = array_map(function($item) use ($em) {
                $productName = null;
                $productImage = null;
                if (isset($item['productId'])) {
                    $product = $em->getRepository(\App\Entity\Product::class)->find($item['productId']);
                    if ($product) {
                        $productName = $product->getName();
                        $images = $product->getImages();
                        $productImage = is_array($images) && count($images) > 0 ? $images[0] : null;
                    }
                }
                return array_merge($item, [
                    'productName' => $productName,
                    'productImage' => $productImage,
                ]);
            }, $order->getItems());

            return [
            'id' => $order->getId(),
                'items' => $itemsWithProductInfo,
            'total' => $order->getTotal(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            'customerName' => $order->getCustomerName(),
            'customerPhone' => $order->getCustomerPhone(),
            'customerAddress' => $order->getCustomerAddress(),
            'notes' => $order->getNotes(),
            'user' => [
                'id' => $order->getUser()?->getId(),
                'email' => $order->getUser()?->getEmail(),
                'name' => $order->getUser()?->getName(),
            ]
            ];
        }, $orders);

        return $this->json($data);
    }

    #[Route('/api/admin/orders/{id}/confirm', name: 'admin_confirm_order', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function confirmOrder(int $id, EntityManagerInterface $em): JsonResponse
    {
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        // Only decrease stock if the order is not already confirmed
        if ($order->getStatus() !== 'confirmed') {
            foreach ($order->getItems() as $item) {
                if (isset($item['productId'], $item['quantity'])) {
                    $product = $em->getRepository(\App\Entity\Product::class)->find($item['productId']);
                    if ($product) {
                        $newStock = $product->getStock() - (int)$item['quantity'];
                        $product->setStock(max(0, $newStock));
                    }
                }
            }
        }
        $order->setStatus('confirmed');
        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'message' => 'Order confirmed successfully',
        ]);
    }

    #[Route('/api/admin/orders/{id}/pending', name: 'admin_pending_order', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function setOrderPending(int $id, EntityManagerInterface $em): JsonResponse
    {
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        // Only re-add stock if the order was previously confirmed
        if ($order->getStatus() === 'confirmed') {
            foreach ($order->getItems() as $item) {
                if (isset($item['productId'], $item['quantity'])) {
                    $product = $em->getRepository(\App\Entity\Product::class)->find($item['productId']);
                    if ($product) {
                        $product->setStock($product->getStock() + (int)$item['quantity']);
                    }
                }
            }
        }
        $order->setStatus('pending');
        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'message' => 'Order set to pending and stock re-added if needed',
        ]);
    }

    #[Route('/api/admin/orders/{id}/cancel', name: 'admin_cancel_order', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function cancelOrder(int $id, EntityManagerInterface $em): JsonResponse
    {
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        // Only re-add stock if the order was previously confirmed
        if ($order->getStatus() === 'confirmed') {
            foreach ($order->getItems() as $item) {
                if (isset($item['productId'], $item['quantity'])) {
                    $product = $em->getRepository(\App\Entity\Product::class)->find($item['productId']);
                    if ($product) {
                        $product->setStock($product->getStock() + (int)$item['quantity']);
                    }
                }
            }
        }
        $order->setStatus('cancelled');
        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'message' => 'Order cancelled successfully',
        ]);
    }

    #[Route('/api/admin/orders/{id}', name: 'admin_update_order', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateOrder(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Update status if provided
        if (isset($data['status'])) {
            $order->setStatus($data['status']);
        }

        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'status' => $order->getStatus(),
            'message' => 'Order updated successfully',
        ]);
    }

    #[Route('/api/admin/orders/{id}', name: 'admin_delete_order', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteOrder(int $id, EntityManagerInterface $em): JsonResponse
    {
        $order = $em->getRepository(Order::class)->find($id);

        if (!$order) {
            return $this->json(['error' => 'Order not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($order);
        $em->flush();

        return $this->json([
            'message' => 'Order deleted successfully',
        ]);
    }
}
