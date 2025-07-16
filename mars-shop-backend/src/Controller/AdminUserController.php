<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AdminUserController extends AbstractController
{
    #[Route('/api/users', name: 'admin_user_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(UserRepository $userRepo): JsonResponse
    {
        $users = $userRepo->findAll();

        $data = array_map(fn(User $user) => [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'roles' => $user->getRoles(),
            'note' => $user->getNote(),
            'phone' => $user->getPhone(),
            'address' => $user->getAddress(),
        ], $users);

        return $this->json($data);
    }

    #[Route('/api/users/{id}', name: 'admin_user_detail', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserById(User $user): JsonResponse
    {
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'roles' => $user->getRoles(),
            'note' => $user->getNote(),
            'phone' => $user->getPhone(),
            'address' => $user->getAddress(),
        ]);
    }

    #[Route('/api/users/{id}', name: 'admin_user_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(
        int $id,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->setRoles($data['roles']);
        }

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['note'])) {
            $user->setNote($data['note']);
        }

        $em->flush();

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'name' => $user->getName(),
            'roles' => $user->getRoles(),
            'note' => $user->getNote(),
            'phone' => $user->getPhone(),
            'address' => $user->getAddress(),
            'message' => 'User updated successfully'
        ]);
    }

    #[Route('/api/users/{id}', name: 'admin_user_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($user);
        $em->flush();

        return new JsonResponse([
            'message' => 'User deleted successfully',
            'id' => $id
        ]);
    }
}
