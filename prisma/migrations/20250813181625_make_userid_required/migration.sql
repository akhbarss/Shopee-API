/*
  Warnings:

  - Made the column `userId` on table `shop` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `shop` DROP FOREIGN KEY `Shop_userId_fkey`;

-- DropIndex
DROP INDEX `Shop_userId_fkey` ON `shop`;

-- AlterTable
ALTER TABLE `shop` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
