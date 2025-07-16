<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new Post(
            controller: App\Controller\ProductController::class . '::createProduct',
            name: 'custom_create_product',
            routeName: 'create_product',
            denormalizationContext: ['groups' => ['product:write'], 'enable_max_depth' => true],
            security: 'is_granted("ROLE_ADMIN")'
        ),
        // PATCH and DELETE can be added similarly if you want to restrict them to admins
    ]
)]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['product:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['product:read', 'product:write'])]
    private string $name;

    #[ORM\Column(type: 'text')]
    #[Groups(['product:read', 'product:write'])]
    private string $description;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['product:read', 'product:write'])]
    private ?Category $category = null;

    #[ORM\Column(type: 'float')]
    #[Groups(['product:read', 'product:write'])]
    private float $price;

    #[ORM\Column(type: 'integer')]
    #[Groups(['product:read', 'product:write'])]
    private int $stock = 0;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['product:read', 'product:write'])]
    private bool $featured = false;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $images = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $colors = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $sizes = null;

    #[ORM\Column(type: 'integer')]
    #[Groups(['product:read'])]
    private int $views = 0;

    // Translation fields
    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $nameTranslations = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $descriptionTranslations = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $colorsTranslations = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['product:read', 'product:write'])]
    private ?array $sizesTranslations = null;

    public function __construct()
    {
        $this->variants = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }

    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): self { $this->description = $description; return $this; }

    public function getCategory(): ?Category { return $this->category; }
    public function setCategory(?Category $category): self { $this->category = $category; return $this; }

    public function getCategoryId(): ?int { return $this->category ? $this->category->getId() : null; }

    public function getPrice(): float { return $this->price; }
    public function setPrice(float $price): self { $this->price = $price; return $this; }

    public function getStock(): int { return $this->stock; }
    public function setStock(int $stock): self { $this->stock = $stock; return $this; }

    public function isFeatured(): bool { return $this->featured; }
    public function setFeatured(bool $featured): self { $this->featured = $featured; return $this; }

    public function getImages(): ?array { return $this->images; }
    public function setImages(?array $images): self { $this->images = $images; return $this; }

    public function getColors(): ?array { return $this->colors; }
    public function setColors(?array $colors): self { $this->colors = $colors; return $this; }

    public function getSizes(): ?array { return $this->sizes; }
    public function setSizes(?array $sizes): self { $this->sizes = $sizes; return $this; }

    public function getViews(): int { return $this->views; }
    public function setViews(int $views): self { $this->views = $views; return $this; }

    // Translation getters and setters
    public function getNameTranslations(): ?array { return $this->nameTranslations; }
    public function setNameTranslations(?array $nameTranslations): self { $this->nameTranslations = $nameTranslations; return $this; }

    public function getDescriptionTranslations(): ?array { return $this->descriptionTranslations; }
    public function setDescriptionTranslations(?array $descriptionTranslations): self { $this->descriptionTranslations = $descriptionTranslations; return $this; }

    public function getColorsTranslations(): ?array { return $this->colorsTranslations; }
    public function setColorsTranslations(?array $colorsTranslations): self { $this->colorsTranslations = $colorsTranslations; return $this; }

    public function getSizesTranslations(): ?array { return $this->sizesTranslations; }
    public function setSizesTranslations(?array $sizesTranslations): self { $this->sizesTranslations = $sizesTranslations; return $this; }

    // Helper methods for getting translated content
    public function getTranslatedName(string $language = 'en'): string
    {
        if ($language === 'en' || !$this->nameTranslations) {
            return $this->name;
        }
        return $this->nameTranslations[$language] ?? $this->name;
    }

    public function getTranslatedDescription(string $language = 'en'): string
    {
        if ($language === 'en' || !$this->descriptionTranslations) {
            return $this->description;
        }
        return $this->descriptionTranslations[$language] ?? $this->description;
    }

    public function getTranslatedColors(string $language = 'en'): ?array
    {
        if ($language === 'en' || !$this->colorsTranslations) {
            return $this->colors;
        }
        return $this->colorsTranslations[$language] ?? $this->colors;
    }

    public function getTranslatedSizes(string $language = 'en'): ?array
    {
        if ($language === 'en' || !$this->sizesTranslations) {
            return $this->sizes;
        }
        return $this->sizesTranslations[$language] ?? $this->sizes;
    }
}
