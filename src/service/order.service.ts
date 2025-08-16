import { prisma } from "../prisma";

export const getUserShops = async (userId: number) => {
    const foundUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            shops: {
                select: {
                    shopId: true,
                    shopName: true,
                }
            }
        }
    });

    if (!foundUser) {
        throw new Error("USER_NOT_FOUND");
    }

    if (!foundUser.shops || foundUser.shops.length === 0) {
        throw new Error("NO_SHOPS_FOUND");
    }

    return foundUser.shops
} 