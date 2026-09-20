import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';


export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { name: 'Dog Supplies', slug: 'dog', icon: 'fa-dog' },
  { name: 'Cat Supplies', slug: 'cat', icon: 'fa-cat' },
  { name: 'Medications', slug: 'medications', icon: 'fa-pills' },
  { name: 'Grooming', slug: 'grooming', icon: 'fa-cut' },
  { name: 'Pet Food', slug: 'food', icon: 'fa-utensils' },
  { name: 'Accessories', slug: 'accessories', icon: 'fa-bed' }
];

export async function GET() {
  try {
    // Migrate existing records from Supplies to Food only if needed
    const hasLegacySupplies = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'dog', name: 'Dog Supplies' },
          { slug: 'cat', name: 'Cat Supplies' }
        ]
      }
    });

    // Migrate old 'Dog Food'/'Cat Food' names (legacy incorrect defaults) back to correct names
    const hasLegacyFoodNames = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: 'dog', name: 'Dog Food' },
          { slug: 'cat', name: 'Cat Food' }
        ]
      }
    });

    if (hasLegacySupplies || hasLegacyFoodNames) {
      await prisma.category.updateMany({
        where: { slug: 'dog' },
        data: { name: 'Dog Supplies' }
      });
      await prisma.category.updateMany({
        where: { slug: 'cat' },
        data: { name: 'Cat Supplies' }
      });
    }

    let categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (categories.length === 0) {
      // Seed default categories
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES,
        skipDuplicates: true
      });
      categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, icon } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await prisma.category.upsert({
      where: { slug },
      update: { name, icon },
      create: { name, slug, icon }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Failed to save category:', error);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Protect default categories from deletion
    const isDefault = DEFAULT_CATEGORIES.some(cat => cat.slug === slug);
    if (isDefault) {
      return NextResponse.json({ error: 'Cannot delete system default categories' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { slug }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { slug, name, icon } = await request.json();
    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and name are required' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { slug },
      data: { name, ...(icon ? { icon } : {}) }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
