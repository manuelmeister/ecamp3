<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210621171506 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE period (id VARCHAR(16) NOT NULL, camp_id VARCHAR(16) NOT NULL, description TEXT NOT NULL, "end" DATE NOT NULL, start DATE NOT NULL, create_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, update_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C5B81ECE77075ABB ON period (camp_id)');
        $this->addSql('CREATE INDEX IDX_C5B81ECEEE35052C ON period (create_time)');
        $this->addSql('CREATE INDEX IDX_C5B81ECEBBF8CFDA ON period (update_time)');
        $this->addSql('ALTER TABLE period ADD CONSTRAINT FK_C5B81ECE77075ABB FOREIGN KEY (camp_id) REFERENCES camp (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP TABLE period');
    }
}
