import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    const items = products.map(p => ({
      id: p.id,
      name: p.productName,
      category: p.category,
      categoryLabel: p.category,
      description: p.description || '',
      price: p.price.toString(),
      stock: p.stockQuantity,
      image: p.productImage || '',
      icon: 'fa-box',
      status: p.status
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch inventory from DB', error);
    return NextResponse.json({ error: 'Failed to read inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let admin = await prisma.user.findFirst({ where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'dummyadmin' + Math.random() + '@furever.com',
          password: 'dummy',
          fullName: 'System Admin',
          role: 'SUPER_ADMIN'
        }
      });
    }

    if (Array.isArray(body)) {
      for (const item of body) {
        if (typeof item.id === 'string' && item.id.length > 10 && !item.id.startsWith('temp-')) {
          await prisma.product.update({
            where: { id: item.id },
            data: {
              productName: item.name,
              category: item.category,
              description: item.description,
              price: parseFloat(item.price) || 0,
              stockQuantity: parseInt(item.stock, 10) || 0,
              productImage: item.image || null,
            }
          });
        } else {
          await prisma.product.create({
            data: {
              productName: item.name,
              category: item.category,
              description: item.description,
              price: parseFloat(item.price) || 0,
              stockQuantity: parseInt(item.stock, 10) || 0,
              productImage: item.image || null,
              createdByAdmin: admin.id
            }
          });
        }
      }

      const allProducts = await prisma.product.findMany();
      return NextResponse.json({ success: true, items: allProducts });
    } else {
      const newItem = await prisma.product.create({
        data: {
          productName: body.name,
          category: body.category,
          description: body.description,
          price: parseFloat(body.price) || 0,
          stockQuantity: parseInt(body.stock, 10) || 0,
          productImage: body.image || null,
          createdByAdmin: admin.id
        }
      });
      return NextResponse.json({ success: true, item: newItem });
    }
  } catch (error) {
    console.error('Error saving inventory:', error);
    return NextResponse.json({ error: 'Failed to write inventory' }, { status: 500 });
  }
}
