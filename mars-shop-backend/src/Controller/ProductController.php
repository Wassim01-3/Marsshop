<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;

class ProductController extends AbstractController
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    #[Route('/api/products', name: 'list_products', methods: ['GET'])]
    public function listProducts(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $products = $em->getRepository(Product::class)->findAll();
        $response = [];
        foreach ($products as $product) {
            $response[] = [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'price' => $product->getPrice(),
                'description' => $product->getDescription(),
                'images' => $product->getImages(),
                'stock' => $product->getStock(),
                'featured' => $product->isFeatured(),
                'colors' => $product->getColors(),
                'sizes' => $product->getSizes(),
                'views' => $product->getViews(),
                'category' => $product->getCategory() ? $product->getCategory()->getId() : null,
            ];
        }
        return $this->json($response);
    }

    #[Route('/api/products/{id}', name: 'get_product_detail', methods: ['GET'])]
    public function getProductDetail(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }
        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'price' => $product->getPrice(),
            'description' => $product->getDescription(),
            'images' => $product->getImages(),
            'category' => $product->getCategory() ? [
                'id' => $product->getCategory()->getId(),
                'name' => $product->getCategory()->getName(),
                'description' => $product->getCategory()->getDescription()
            ] : null,
            'featured' => $product->isFeatured(),
            'colors' => $product->getColors(),
            'sizes' => $product->getSizes(),
            'stock' => $product->getStock(),
            'views' => $product->getViews(),
        ];
        return $this->json($data);
    }

    #[Route('/api/products', name: 'create_product', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createProduct(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validate required fields
        if (!isset($data['name'], $data['price'], $data['description']) || (!isset($data['images']) && !isset($data['image']))) {
            return $this->json(['error' => 'Missing required product fields'], Response::HTTP_BAD_REQUEST);
        }

        // Handle category from payload (IRI or ID)
        $categoryId = null;
        if (isset($data['category'])) {
            if (is_numeric($data['category'])) {
                $categoryId = $data['category'];
            } elseif (is_string($data['category']) && preg_match('/\d+$/', $data['category'], $matches)) {
                $categoryId = $matches[0];
            }
        }
        if (!$categoryId) {
            return $this->json(['error' => 'Missing or invalid category'], Response::HTTP_BAD_REQUEST);
        }
        $category = $em->getRepository(Category::class)->find($categoryId);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
        }

        $product = new Product();
        $product->setName($data['name']);
        $product->setPrice((float) $data['price']);
        $product->setDescription($data['description']);
        $product->setImages(isset($data['images']) ? $data['images'] : (isset($data['image']) ? [$data['image']] : null));
        $product->setCategory($category);
        $product->setFeatured($data['featured'] ?? false);
        $product->setColors($data['colors'] ?? null);
        $product->setSizes($data['sizes'] ?? null);
        $product->setStock($data['stock'] ?? 0);

        $em->persist($product);
        $em->flush();

        return $this->json([
            'message' => 'Product created successfully',
            'product' => [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'price' => $product->getPrice(),
                'description' => $product->getDescription(),
                'category' => $product->getCategory()->getName(),
                'featured' => $product->isFeatured(),
                'stock' => $product->getStock(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/products/{id}', name: 'update_product', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateProduct(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);
        
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        // Update fields if provided
        if (isset($data['name'])) {
            $product->setName($data['name']);
        }
        if (isset($data['description'])) {
            $product->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $product->setPrice((float) $data['price']);
        }
        if (isset($data['stock'])) {
            $product->setStock((int) $data['stock']);
        }
        if (isset($data['featured'])) {
            $product->setFeatured((bool) $data['featured']);
        }
        if (isset($data['images'])) {
            $product->setImages($data['images']);
        }
        if (isset($data['colors'])) {
            $product->setColors($data['colors']);
        }
        if (isset($data['sizes'])) {
            $product->setSizes($data['sizes']);
        }

        // Handle category update
        if (isset($data['category'])) {
            $categoryId = null;
            if (is_numeric($data['category'])) {
                $categoryId = $data['category'];
            } elseif (is_string($data['category']) && preg_match('/\d+$/', $data['category'], $matches)) {
                $categoryId = $matches[0];
            }
            
            if ($categoryId) {
                $category = $em->getRepository(Category::class)->find($categoryId);
                if ($category) {
                    $product->setCategory($category);
            }
            }
        }

        $em->flush();

        return $this->json([
            'message' => 'Product updated successfully',
            'product' => [
                'id' => $product->getId(),
                'name' => $product->getName(),
                'price' => $product->getPrice(),
                'description' => $product->getDescription(),
                'category' => $product->getCategory()->getName(),
                'featured' => $product->isFeatured(),
                'stock' => $product->getStock(),
            ]
        ]);
    }

    #[Route('/api/products/{id}', name: 'replace_product', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function replaceProduct(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        return $this->updateProduct($id, $request, $em);
    }

    #[Route('/api/products/{id}', name: 'delete_product', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteProduct(int $id, EntityManagerInterface $em): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($product);
        $em->flush();

        return $this->json(['message' => 'Product deleted successfully']);
    }

    #[Route('/api/products/{id}/view', name: 'increment_product_views', methods: ['POST'])]
    public function incrementProductViews(int $id, EntityManagerInterface $em): JsonResponse
    {
        $product = $em->getRepository(Product::class)->find($id);
        
        if (!$product) {
            return $this->json(['error' => 'Product not found'], Response::HTTP_NOT_FOUND);
        }

        $product->setViews($product->getViews() + 1);
        $em->flush();

        return $this->json([
            'message' => 'Product views incremented',
            'views' => $product->getViews()
        ]);
    }
}
