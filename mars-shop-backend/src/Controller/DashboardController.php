<?php

namespace App\Controller;

use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class DashboardController extends AbstractController
{
    #[Route('/api/admin/dashboard', name: 'admin_dashboard', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function dashboardStats(EntityManagerInterface $em): JsonResponse
    {
        $totalOrders = $em->getRepository(Order::class)->count([]);
        $totalRevenue = $em->createQueryBuilder()
            ->select('SUM(o.total)')
            ->from(Order::class, 'o')
            ->getQuery()
            ->getSingleScalarResult();

        return $this->json([
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
        ]);
    }
}
