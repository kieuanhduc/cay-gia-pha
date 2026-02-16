-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `originPlace` VARCHAR(300) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `familyLineId` INTEGER NOT NULL,
    `fullName` VARCHAR(200) NOT NULL,
    `gender` VARCHAR(10) NOT NULL,
    `birthDate` DATE NULL,
    `deathDate` DATE NULL,
    `isAlive` BOOLEAN NOT NULL DEFAULT true,
    `birthPlace` VARCHAR(300) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `generation` INTEGER NOT NULL DEFAULT 1,
    `birthOrder` INTEGER NOT NULL DEFAULT 1,
    `fatherId` INTEGER NULL,
    `motherId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `members_familyLineId_idx`(`familyLineId`),
    INDEX `members_fatherId_idx`(`fatherId`),
    INDEX `members_motherId_idx`(`motherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spouses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberAId` INTEGER NOT NULL,
    `memberBId` INTEGER NOT NULL,
    `marriedDate` DATE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `spouses_memberAId_memberBId_key`(`memberAId`, `memberBId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_familyLineId_fkey` FOREIGN KEY (`familyLineId`) REFERENCES `family_lines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_fatherId_fkey` FOREIGN KEY (`fatherId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spouses` ADD CONSTRAINT `spouses_memberAId_fkey` FOREIGN KEY (`memberAId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spouses` ADD CONSTRAINT `spouses_memberBId_fkey` FOREIGN KEY (`memberBId`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
