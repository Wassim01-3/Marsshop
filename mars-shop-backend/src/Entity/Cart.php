<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'cart')]
class Cart
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['cart:read'])]
    private $id;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['cart:read'])]
    private $user;

    #[ORM\Column(type: 'json')]
    #[Groups(['cart:read', 'cart:write'])]
    private $items = [];

    #[ORM\Column(type: 'datetime')]
    #[Groups(['cart:read'])]
    private $createdAt;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['cart:read'])]
    private $updatedAt;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['cart:read'])]
    private $expiresAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->expiresAt = (new \DateTime())->modify('+3 days');
    }

    public function getId(): ?int { return $this->id; }
    public function getUser() { return $this->user; }
    public function setUser($user): self { $this->user = $user; return $this; }
    public function getItems(): array { return $this->items; }
    public function setItems(array $items): self { $this->items = $items; return $this; }
    public function getCreatedAt(): \DateTime { return $this->createdAt; }
    public function setCreatedAt(\DateTime $createdAt): self { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): \DateTime { return $this->updatedAt; }
    public function setUpdatedAt(\DateTime $updatedAt): self { $this->updatedAt = $updatedAt; return $this; }
    public function getExpiresAt(): \DateTime { return $this->expiresAt; }
    public function setExpiresAt(\DateTime $expiresAt): self { $this->expiresAt = $expiresAt; return $this; }
} 