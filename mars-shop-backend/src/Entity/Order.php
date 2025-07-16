<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\Repository\OrderRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Controller\AdminOrderController;
use App\Controller\OrderController;



#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['order:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['order:read']],
            security: "object.getUser() == user or is_granted('ROLE_ADMIN')"
        ),
        new Post(
            controller: 'App\\Controller\\OrderController::createOrder',
            denormalizationContext: ['groups' => ['order:write']],
            security: "true"
        ),
        new Patch(
            uriTemplate: '/admin/orders/{id}/confirm',
            controller: AdminOrderController::class,
            security: "is_granted('ROLE_ADMIN')",
            read: false,
            deserialize: false,
            name: 'admin_confirm_order'
        )
    ]
)]
#[ORM\Table(name: '`order`')]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['order:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['order:read'])]
    private ?UserInterface $user = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['order:read', 'order:write'])]
    private array $items = [];

    #[ORM\Column(type: Types::FLOAT)]
    #[Groups(['order:read', 'order:write'])]
    private float $total = 0.0;

    #[ORM\Column(type: Types::STRING)]
    #[Groups(['order:read'])]
    private string $status = 'pending';

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['order:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $customerName = null;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $customerPhone = null;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $customerAddress = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['order:read', 'order:write'])]
    private ?string $notes = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?UserInterface
    {
        return $this->user;
    }

    public function setUser(?UserInterface $user): void
    {
        $this->user = $user;
    }

    public function getItems(): array
    {
        return $this->items;
    }

    public function setItems(array $items): void
    {
        $this->items = $items;
    }

    public function getTotal(): float
    {
        return $this->total;
    }

    public function setTotal(float $total): void
    {
        $this->total = $total;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getCustomerName(): ?string
    {
        return $this->customerName;
    }

    public function setCustomerName(?string $customerName): void
    {
        $this->customerName = $customerName;
    }

    public function getCustomerPhone(): ?string
    {
        return $this->customerPhone;
    }

    public function setCustomerPhone(?string $customerPhone): void
    {
        $this->customerPhone = $customerPhone;
    }

    public function getCustomerAddress(): ?string
    {
        return $this->customerAddress;
    }

    public function setCustomerAddress(?string $customerAddress): void
    {
        $this->customerAddress = $customerAddress;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }
}
