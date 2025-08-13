// app.get('/api/get-processed-orders', async (req, res) => {
//     try {
//         // 1. Tembak 3 (atau lebih) API Shopee secara paralel jika memungkinkan
//         const [shopData, orderData, someOtherData] = await Promise.all([
//             fetchShopFromShopee(),
//             fetchOrdersFromShopee(),
//             fetchSomethingElseFromShopee()
//         ]);

//         // 2. Proses dan gabungkan datanya di sini
//         const finalData = {
//             shopName: shopData.name,
//             orders: orderData.list.map(order => {
//                 // ... logika penggabungan data ...
//                 return { ...order, ...someOtherData.details[order.id] };
//             })
//         };

//         // 3. Kembalikan satu respons yang sudah matang ke React
//         res.json(finalData);

//     } catch (error) {
//         res.status(500).json({ message: "Gagal memproses data" });
//     }
// });