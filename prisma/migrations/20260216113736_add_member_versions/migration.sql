-- CreateTable
CREATE TABLE `member_versions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `fullName` VARCHAR(200) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `birthDate` DATE NULL,
    `deathDate` DATE NULL,
    `isAlive` BOOLEAN NOT NULL,
    `birthPlace` VARCHAR(300) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `generation` INTEGER NOT NULL,
    `birthOrder` INTEGER NOT NULL,
    `fatherId` INTEGER NULL,
    `motherId` INTEGER NULL,
    `changedBy` INTEGER NOT NULL,
    `changedByName` VARCHAR(100) NOT NULL,
    `changeType` VARCHAR(20) NOT NULL DEFAULT 'update',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `member_versions_memberId_version_idx`(`memberId`, `version`),
    INDEX `member_versions_memberId_createdAt_idx`(`memberId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
