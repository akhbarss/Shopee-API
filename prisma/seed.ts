// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Buat user pertama (Anda).
  // Menggunakan 'upsert' lebih aman, ia tidak akan membuat user duplikat jika skrip dijalankan lagi.
  const firstUser = await prisma.user.upsert({
    where: { email: 'email-admin-anda@example.com' },
    update: {},
    create: {
      email: 'email-admin-anda@example.com',
      name: 'Admin User',
      passwordHash: 'hash-password-anda-di-sini', // Ganti dengan password yang sudah di-hash
    },
  });
  console.log(`User pertama dibuat/ditemukan: ${firstUser.name} (ID: ${firstUser.id})`);

  // 2. Update semua 'Shop' yang belum punya 'userId'
  const updatedShops = await prisma.shop.updateMany({
    where: {
      userId: null, // Hanya update toko yang userId-nya masih kosong
    },
    data: {
      userId: firstUser.id, // Set userId dengan ID user yang baru dibuat
    },
  });

  console.log(`Berhasil menautkan ${updatedShops.count} toko ke user pertama.`);
  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });