<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource]
#[ORM\Entity]
#[ORM\Table(name: 'category')]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['category:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    #[Groups(['category:read', 'category:write'])]
    private string $name;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['category:read', 'category:write'])]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['category:read', 'category:write'])]
    private ?string $icon = null;

    // Translation fields
    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['category:read', 'category:write'])]
    private ?array $nameTranslations = null;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['category:read', 'category:write'])]
    private ?array $descriptionTranslations = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(?string $icon): self
    {
        $this->icon = $icon;
        return $this;
    }

    // Translation getters and setters
    public function getNameTranslations(): ?array
    {
        return $this->nameTranslations;
    }

    public function setNameTranslations(?array $nameTranslations): self
    {
        $this->nameTranslations = $nameTranslations;
        return $this;
    }

    public function getDescriptionTranslations(): ?array
    {
        return $this->descriptionTranslations;
    }

    public function setDescriptionTranslations(?array $descriptionTranslations): self
    {
        $this->descriptionTranslations = $descriptionTranslations;
        return $this;
    }

    // Helper methods for getting translated content
    public function getTranslatedName(string $language = 'en'): string
    {
        if ($language === 'en' || !$this->nameTranslations) {
            return $this->name;
        }
        return $this->nameTranslations[$language] ?? $this->name;
    }

    public function getTranslatedDescription(string $language = 'en'): ?string
    {
        if ($language === 'en' || !$this->descriptionTranslations) {
            return $this->description;
        }
        return $this->descriptionTranslations[$language] ?? $this->description;
    }

    public function __toString(): string
    {
        return $this->name ?? '';
    }
} 