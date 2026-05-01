-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `integrationChannelId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `IntegrationChannel` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `keyHash` VARCHAR(191) NOT NULL,
    `scopes` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IntegrationChannel_name_key`(`name`),
    UNIQUE INDEX `IntegrationChannel_keyHash_key`(`keyHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Booking_integrationChannelId_idx` ON `Booking`(`integrationChannelId`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_integrationChannelId_fkey` FOREIGN KEY (`integrationChannelId`) REFERENCES `IntegrationChannel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
