ALTER TABLE `User` ADD COLUMN `managerAccessRoleId` VARCHAR(191) NULL;

CREATE TABLE `ManagerAccessRole` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `permissions` JSON NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ManagerAccessRole_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `User_managerAccessRoleId_idx` ON `User`(`managerAccessRoleId`);

ALTER TABLE `User` ADD CONSTRAINT `User_managerAccessRoleId_fkey` FOREIGN KEY (`managerAccessRoleId`) REFERENCES `ManagerAccessRole`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
