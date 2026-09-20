import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { searchParams } = new URL(request.url);
      const archived = searchParams.get('archived') === 'true';
      const products = await prisma.product.findMany({
        where: { isArchived: archived },
        orderBy: { createdAt: 'desc' }
      });

      const items = products.map(p => ({
        id: p.id,
        name: p.productName,
        category: p.category,
        categoryLabel: p.category,
        description: p.description || '',
        price: p.price.toString(),
        costPrice: p.costPrice !== null && p.costPrice !== undefined ? p.costPrice.toString() : '',
        stock: p.stockQuantity,
        expiryDate: p.expirationDate ? p.expirationDate.toISOString().split('T')[0] : '',
        image: p.productImage || '',
        icon: 'fa-box',
        status: p.status
      }));

      return NextResponse.json(items);
    } catch (error: any) {
      console.error(`[Inventory GET] Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error?.message || error);
      if (attempt < MAX_RETRIES - 1) {
        // Wait briefly then retry — handles transient Prisma connection issues during hot-reload
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      return NextResponse.json(
        { 
          error: 'Failed to read inventory',
          details: error?.message || String(error),
          code: error?.code
        }, 
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let admin = await prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      select: { id: true }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'dummyadmin' + Math.random() + '@furever.com',
          password: 'dummy',
          fullName: 'System Admin',
          role: 'SUPER_ADMIN'
        },
        select: { id: true }
      });
    }

    if (Array.isArray(body)) {
      const operations = body.map((item) => {
        const itemExpiry = item.expiryDate || item.expirationDate;
        const expirationDate = itemExpiry ? new Date(itemExpiry) : null;

        if (typeof item.id === 'string' && item.id.length > 10 && !item.id.startsWith('temp-')) {
          return prisma.product.update({
            where: { id: item.id },
            data: {
              productName: item.name,
              category: item.category,
              description: item.description,
              price: parseFloat(item.price) || 0,
              costPrice: item.costPrice ? parseFloat(item.costPrice) : null,
              stockQuantity: parseInt(item.stock, 10) || 0,
              productImage: item.image || null,
              expirationDate: expirationDate,
            }
          });
        } else {
          return prisma.product.create({
            data: {
              productName: item.name,
              category: item.category,
              description: item.description,
              price: parseFloat(item.price) || 0,
              costPrice: item.costPrice ? parseFloat(item.costPrice) : null,
              stockQuantity: parseInt(item.stock, 10) || 0,
              productImage: item.image || null,
              expirationDate: expirationDate,
              createdByAdmin: admin!.id
            }
          });
        }
      });

      await prisma.$transaction(operations);

      const allProducts = await prisma.product.findMany({ where: { isArchived: false } });
      const items = allProducts.map(p => ({
        id: p.id,
        name: p.productName,
        category: p.category,
        categoryLabel: p.category,
        description: p.description || '',
        price: p.price.toString(),
        costPrice: p.costPrice !== null && p.costPrice !== undefined ? p.costPrice.toString() : '',
        stock: p.stockQuantity,
        expiryDate: p.expirationDate ? p.expirationDate.toISOString().split('T')[0] : '',
        image: p.productImage || '',
        icon: 'fa-box',
        status: p.status
      }));
      return NextResponse.json({ success: true, items });
    } else {
      const itemExpiry = body.expiryDate || body.expirationDate;
      const expirationDate = itemExpiry ? new Date(itemExpiry) : null;

      const newItem = await prisma.product.create({
        data: {
          productName: body.name,
          category: body.category,
          description: body.description,
          price: parseFloat(body.price) || 0,
          costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
          stockQuantity: parseInt(body.stock, 10) || 0,
          productImage: body.image || null,
          expirationDate: expirationDate,
          createdByAdmin: admin.id
        }
      });

      const formatted = {
        id: newItem.id,
        name: newItem.productName,
        category: newItem.category,
        categoryLabel: newItem.category,
        description: newItem.description || '',
        price: newItem.price.toString(),
        costPrice: newItem.costPrice !== null && newItem.costPrice !== undefined ? newItem.costPrice.toString() : '',
        stock: newItem.stockQuantity,
        expiryDate: newItem.expirationDate ? newItem.expirationDate.toISOString().split('T')[0] : '',
        image: newItem.productImage || '',
        icon: 'fa-box',
        status: newItem.status
      };

      return NextResponse.json({ success: true, item: formatted });
    }
  } catch (error) {
    console.error('Error saving inventory:', error);
    return NextResponse.json({ error: 'Failed to write inventory' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (typeof body.isArchived === 'boolean') {
      updateData.isArchived = body.isArchived;
    }
    if (body.name !== undefined) {
      updateData.productName = body.name;
    }
    if (body.category !== undefined) {
      updateData.category = body.category;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price) || 0;
    }
    if (body.costPrice !== undefined) {
      updateData.costPrice = body.costPrice ? parseFloat(body.costPrice) : null;
    }
    if (body.stock !== undefined) {
      updateData.stockQuantity = Math.max(0, parseInt(body.stock, 10) || 0);
    }
    if (body.image !== undefined) {
      updateData.productImage = body.image || null;
    }
    if (body.expiryDate !== undefined || body.expirationDate !== undefined) {
      const rawDate = body.expiryDate || body.expirationDate;
      updateData.expirationDate = rawDate ? new Date(rawDate) : null;
    }

    const updated = await prisma.product.update({
      where: { id: String(id) },
      data: updateData
    });

    const formatted = {
      id: updated.id,
      name: updated.productName,
      category: updated.category,
      categoryLabel: updated.category,
      description: updated.description || '',
      price: updated.price.toString(),
      costPrice: updated.costPrice !== null && updated.costPrice !== undefined ? updated.costPrice.toString() : '',
      stock: updated.stockQuantity,
      expiryDate: updated.expirationDate ? updated.expirationDate.toISOString().split('T')[0] : '',
      image: updated.productImage || '',
      icon: 'fa-box',
      status: updated.status,
      isArchived: updated.isArchived
    };

    return NextResponse.json({ success: true, item: formatted });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
      await prisma.product.delete({
        where: { id }
      });
    } catch (foreignKeyErr) {
      // If item is referenced in historical orders or carts, soft-archive instead of failing
      console.warn(`Product ${id} has relational dependencies, soft-archiving instead of hard deletion.`);
      await prisma.product.update({
        where: { id },
        data: { isArchived: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
