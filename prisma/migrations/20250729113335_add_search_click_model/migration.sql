-- CreateTable
CREATE TABLE `SearchClick` (
    `id` VARCHAR(191) NOT NULL,
    `clickCount` INTEGER NOT NULL DEFAULT 1,
    `searchQueryId` VARCHAR(191) NOT NULL,
    `songId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SearchClick_searchQueryId_songId_key`(`searchQueryId`, `songId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SearchClick` ADD CONSTRAINT `SearchClick_searchQueryId_fkey` FOREIGN KEY (`searchQueryId`) REFERENCES `SearchQuery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchClick` ADD CONSTRAINT `SearchClick_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `Song`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
