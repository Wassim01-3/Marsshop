<?php

namespace App\Controller;

use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class CategoryController extends AbstractController
{
    #[Route('/api/categories', name: 'get_categories', methods: ['GET'])]
    public function getCategories(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $language = $request->query->get('language', 'en');
        $categories = $em->getRepository(Category::class)->findAll();

        $data = array_map(fn(Category $category) => [
            'id' => $category->getId(),
            'name' => $category->getTranslatedName($language),
            'description' => $category->getTranslatedDescription($language),
            'icon' => $category->getIcon(),
        ], $categories);

        return $this->json($data);
    }

    #[Route('/api/categories', name: 'create_category', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createCategory(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || trim($data['name']) === '') {
            return $this->json(['error' => 'Category name is required'], Response::HTTP_BAD_REQUEST);
        }

        $existing = $em->getRepository(Category::class)->findOneBy(['name' => $data['name']]);
        if ($existing) {
            return $this->json(['error' => 'Category already exists'], Response::HTTP_CONFLICT);
        }

        $category = new Category();
        $category->setName($data['name']);
        $category->setDescription($data['description'] ?? null);
        $category->setIcon($data['icon'] ?? null);

        $em->persist($category);
        $em->flush();

        return $this->json([
            'message' => 'Category created successfully',
            'category' => [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'description' => $category->getDescription(),
                'icon' => $category->getIcon(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/categories/{id}', name: 'update_category', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateCategory(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $category = $em->getRepository(Category::class)->find($id);
        
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $category->setName($data['name']);
        }
        if (isset($data['description'])) {
            $category->setDescription($data['description']);
        }
        if (isset($data['icon'])) {
            $category->setIcon($data['icon']);
        }

        $em->flush();

        return $this->json([
            'message' => 'Category updated successfully',
            'category' => [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'description' => $category->getDescription(),
                'icon' => $category->getIcon(),
            ]
        ]);
    }

    #[Route('/api/categories/{id}', name: 'delete_category', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteCategory(int $id, EntityManagerInterface $em): JsonResponse
    {
        $category = $em->getRepository(Category::class)->find($id);
        
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($category);
        $em->flush();

        return $this->json(['message' => 'Category deleted successfully']);
    }
}
