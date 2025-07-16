<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Check if admin user already exists
        $userRepo = $manager->getRepository(User::class);
        $admin = $userRepo->findOneBy(['email' => 'admin@marsshop.com']);
        if (!$admin) {
            $admin = new User();
            $admin->setEmail("admin@marsshop.com");
            $admin->setName("Admin");
            $admin->setRoles(['ROLE_ADMIN']);

            $hashedPassword = $this->hasher->hashPassword($admin, "admin");
            $admin->setPassword($hashedPassword);

            $manager->persist($admin);
        }

        $categories = [
            ['name' => 'Electronics', 'description' => 'Latest gadgets and electronic devices', 'icon' => '📱'],
            ['name' => 'Fashion', 'description' => 'Trendy clothing and accessories', 'icon' => '👕'],
            ['name' => 'Home & Garden', 'description' => 'Home decor and garden essentials', 'icon' => '🏠'],
            ['name' => 'Sports', 'description' => 'Sports equipment and fitness gear', 'icon' => '⚽'],
            ['name' => 'Books', 'description' => 'Books and educational materials', 'icon' => '📚'],
            ['name' => 'Beauty', 'description' => 'Cosmetics and personal care', 'icon' => '💄'],
        ];

        $repo = $manager->getRepository(Category::class);

        foreach ($categories as $catData) {
            // Check if category already exists by name
            $existing = $repo->findOneBy(['name' => $catData['name']]);
            if (!$existing) {
                $category = new Category();
                $category->setName($catData['name']);
                $category->setDescription($catData['description']);
                $category->setIcon($catData['icon']);
                $manager->persist($category);
            }
        }

        $manager->flush();
    }
}
