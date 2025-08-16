-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_shopId_fkey`;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`shopId`) ON DELETE CASCADE ON UPDATE CASCADE;
