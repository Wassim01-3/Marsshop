<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250708211059 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Add the column as nullable first
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD created_at DATETIME DEFAULT NULL
        SQL);
        // Set created_at to NOW() for all existing users
        $this->addSql(<<<'SQL'
            UPDATE user SET created_at = NOW() WHERE created_at IS NULL
        SQL);
        // Make the column NOT NULL
        $this->addSql(<<<'SQL'
            ALTER TABLE user MODIFY created_at DATETIME NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP created_at
        SQL);
    }
}
