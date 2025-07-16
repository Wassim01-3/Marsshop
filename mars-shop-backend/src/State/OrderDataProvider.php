<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Order;
use Symfony\Bundle\SecurityBundle\Security;

class OrderDataProvider implements ProcessorInterface
{
    public function __construct(
        private Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Order
    {
        $user = $this->security->getUser();
        
        if ($user) {
            $data->setUser($user);
        }
        
        return $data;
    }
} 