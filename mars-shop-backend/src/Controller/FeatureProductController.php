<?php

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class FeatureProductController
{
    #[Route('/api/products/{id}/feature', name: 'toggle_feature_product', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function __invoke(int $id, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);

        if (!$product) {
            throw new NotFoundHttpException("Product not found.");
        }

        $product->setFeatured(!$product->isFeatured());
        $em->flush();

        return new JsonResponse([
            'id' => $product->getId(),
            'featured' => $product->isFeatured(),
        ]);
    }
}
