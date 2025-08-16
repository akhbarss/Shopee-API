import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from '../types/JwtPayload';
import { prisma } from '../prisma';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log("🔥VERIFY TOKEN🔥")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Mengambil token dari "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'A token is required for authentication' })

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as CustomJwtPayload;
    const id = decoded.id
    console.log({ id })
    const shop = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        shops: { select: { shopId: true } }
      }
    })

    console.log(JSON.stringify(shop))
    // const foundUser = await prisma.token.findFirst({
    //   where: {
    //     shop: {
    //       user: {
    //         id: decoded.id
    //       }
    //     }
    //   },
    //   select: {
    //     shopId: true,
    //     id: true,

    //   }
    // })
    // console.log({foundUser})
    // if (!foundUser) return res.status(400).json({ message: 'A token is required for authentication' })

    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return next();
};