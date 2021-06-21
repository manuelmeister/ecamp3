<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210621172617 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE period ADD endDate DATE NOT NULL');
        $this->addSql('ALTER TABLE period ADD startDate DATE NOT NULL');
        $this->addSql('ALTER TABLE period DROP "end"');
        $this->addSql('ALTER TABLE period DROP start');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE period ADD "end" DATE NOT NULL');
        $this->addSql('ALTER TABLE period ADD start DATE NOT NULL');
        $this->addSql('ALTER TABLE period DROP endDate');
        $this->addSql('ALTER TABLE period DROP startDate');
    }
}
