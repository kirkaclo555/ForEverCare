/**
 * Category Normalization and Mapping Utilities for FurEverPawCare
 * Ensures complete synchronization between Inventory and Products modules.
 */

export interface SystemCategory {
  name: string;
  slug: string;
  icon: string;
  isClinicSupply?: boolean;
}

export const BASE_CATEGORIES: SystemCategory[] = [
  { name: 'Pet Food', slug: 'food', icon: 'fa-utensils' },
  { name: 'Dog Supplies', slug: 'dog', icon: 'fa-dog' },
  { name: 'Cat Supplies', slug: 'cat', icon: 'fa-cat' },
  { name: 'Medications', slug: 'medications', icon: 'fa-pills' },
  { name: 'Grooming', slug: 'grooming', icon: 'fa-cut' },
  { name: 'Accessories', slug: 'accessories', icon: 'fa-bed' },
  { name: 'Equipment', slug: 'equipment', icon: 'fa-stethoscope', isClinicSupply: true },
  { name: 'Supplies', slug: 'supplies', icon: 'fa-box', isClinicSupply: true },
];

/**
 * Normalizes any category string (display name, legacy name, or slug) into a standard slug.
 */
export function normalizeCategorySlug(cat: string | null | undefined): string {
  if (!cat) return 'other';
  const lower = cat.toLowerCase().trim();

  // Food
  if (
    lower === 'food' ||
    lower === 'pet food' ||
    lower === 'pet-food' ||
    lower === 'food supplies' ||
    lower === 'food-supplies'
  ) {
    return 'food';
  }

  // Dog
  if (
    lower === 'dog' ||
    lower === 'dog supplies' ||
    lower === 'dog-supplies' ||
    lower === 'dog food' ||
    lower === 'dog-food'
  ) {
    return 'dog';
  }

  // Cat
  if (
    lower === 'cat' ||
    lower === 'cat supplies' ||
    lower === 'cat-supplies' ||
    lower === 'cat food' ||
    lower === 'cat-food'
  ) {
    return 'cat';
  }

  // Medications / Pharmacy / Vaccine
  if (
    lower === 'medications' ||
    lower === 'medicine' ||
    lower === 'vaccine' ||
    lower === 'pharmacy'
  ) {
    return 'medications';
  }

  // Grooming
  if (lower === 'grooming' || lower === 'grooming supplies' || lower === 'grooming-supplies') {
    return 'grooming';
  }

  // Accessories
  if (lower === 'accessories' || lower === 'accessory') {
    return 'accessories';
  }

  // Clinic-only internal supplies
  if (lower === 'equipment') return 'equipment';
  if (lower === 'supplies') return 'supplies';

  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Normalizes any category string into its canonical user-facing display label.
 */
export function normalizeCategoryName(cat: string | null | undefined): string {
  if (!cat) return 'Other';
  const slug = normalizeCategorySlug(cat);

  switch (slug) {
    case 'food':
      return 'Pet Food';
    case 'dog':
      return 'Dog Supplies';
    case 'cat':
      return 'Cat Supplies';
    case 'medications':
      if (cat.toLowerCase().includes('vaccine')) return 'Vaccine';
      return 'Medications';
    case 'grooming':
      return 'Grooming';
    case 'accessories':
      return 'Accessories';
    case 'equipment':
      return 'Equipment';
    case 'supplies':
      return 'Supplies';
    default:
      return cat
        .split(/[ -]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
  }
}

/**
 * Returns whether an item in this category is sellable in the pet store.
 * Clinic internal supplies ('equipment', 'supplies') are NOT sellable in the store.
 */
export function isSellableCategory(cat: string | null | undefined): boolean {
  if (!cat) return false;
  const slug = normalizeCategorySlug(cat);
  return slug !== 'equipment' && slug !== 'supplies';
}
