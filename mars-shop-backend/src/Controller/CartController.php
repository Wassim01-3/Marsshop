<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class CartController extends AbstractController
{
    #[Route('/api/cart', name: 'get_my_cart', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getMyCart(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $cart = $em->getRepository(Cart::class)->findOneBy(['user' => $user]);
        if (!$cart) {
            return $this->json(['items' => [], 'expiresAt' => null]);
        }
        return $this->json([
            'items' => $cart->getItems(),
            'expiresAt' => $cart->getExpiresAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/api/cart', name: 'update_my_cart', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function updateMyCart(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        if (!isset($data['items']) || !is_array($data['items'])) {
            return $this->json(['error' => 'Invalid or missing items.'], Response::HTTP_BAD_REQUEST);
        }
        $cart = $em->getRepository(Cart::class)->findOneBy(['user' => $user]);
        if (!$cart) {
            $cart = new Cart();
            $cart->setUser($user);
        }
        $cart->setItems($data['items']);
        $cart->setUpdatedAt(new \DateTime());
        $cart->setExpiresAt((new \DateTime())->modify('+3 days'));
        $em->persist($cart);
        $em->flush();
        return $this->json([
            'message' => 'Cart updated',
            'items' => $cart->getItems(),
            'expiresAt' => $cart->getExpiresAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/api/cart', name: 'clear_my_cart', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function clearMyCart(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $cart = $em->getRepository(Cart::class)->findOneBy(['user' => $user]);
        if ($cart) {
            $em->remove($cart);
            $em->flush();
        }
        return $this->json(['message' => 'Cart cleared']);
    }
} 