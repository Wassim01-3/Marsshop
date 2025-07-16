<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250712005824 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE category ADD name_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)', ADD description_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE product ADD name_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)', ADD description_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)', ADD colors_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)', ADD sizes_translations JSON DEFAULT NULL COMMENT '(DC2Type:json)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE category DROP name_translations, DROP description_translations
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE product DROP name_translations, DROP description_translations, DROP colors_translations, DROP sizes_translations
        SQL);
    }
}
