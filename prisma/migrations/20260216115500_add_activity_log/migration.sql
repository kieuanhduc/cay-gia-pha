-- CreateTable
CREATE TABLE `activity_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(20) NOT NULL,
    `entityType` VARCHAR(20) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `entityName` VARCHAR(200) NOT NULL,
    `snapshot` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `userName` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `activity_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
