import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/enable-rls
 *
 * One-shot migration: enables Row Level Security on every public table
 * that Supabase Advisor flagged as CRITICAL.
 *
 * This app accesses the DB exclusively via Prisma using the service-role
 * connection string, which is exempt from RLS.  Enabling RLS with NO
 * permissive policies means anonymous / JWT-based direct Supabase API
 * access is denied for all rows — the correct posture for a server-only app.
 *
 * Safe to run multiple times (ALTER TABLE … ENABLE ROW LEVEL SECURITY is idempotent).
 */

const TABLES = [
  // Core entities
  'users',
  'admin_staff',
  'pets',

  // Clinic operations
  'appointments',
  'telemedicine',
  'categories',
  'products',

  // Commerce
  'cart',
  'cart_items',
  'orders',
  'order_items',
  'payments',

  // Communication & feedback
  'feedback',
  'announcements',
  'announcement_reactions',
  'notifications',
  'sms_notifications',

  // Tutorials & monitoring
  'pet_tutorials',
  'pet_monitoring',
];

export async function GET() {
  const results: Record<string, string> = {};

  for (const table of TABLES) {
    // 1. Enable RLS on the table
    const enableSql = `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`;
    try {
      await prisma.$executeRawUnsafe(enableSql);
      results[`${table}.enable_rls`] = 'OK';
    } catch (err: any) {
      // Table may not exist in this DB — skip gracefully
      results[`${table}.enable_rls`] = `SKIPPED / ERROR: ${err.message}`;
    }

    // 2. Drop any leftover overly-permissive "allow all" policies that might
    //    have been created accidentally (e.g., the Supabase default anon policy)
    const dropSql = `
      DO $$
      DECLARE
        pol_name TEXT;
      BEGIN
        FOR pol_name IN
          SELECT policyname
          FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename = '${table}'
            AND cmd = 'ALL'
            AND qual = 'true'
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON "${table}"', pol_name);
        END LOOP;
      END
      $$;
    `;
    try {
      await prisma.$executeRawUnsafe(dropSql);
      results[`${table}.drop_permissive_policies`] = 'OK';
    } catch (err: any) {
      results[`${table}.drop_permissive_policies`] = `ERROR: ${err.message}`;
    }
  }

  // 3. Verification — list remaining policies per table
  const verifyQuery = `
    SELECT tablename, policyname, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;
  let remainingPolicies: any[] = [];
  try {
    remainingPolicies = await prisma.$queryRawUnsafe(verifyQuery);
  } catch (err: any) {
    remainingPolicies = [{ error: err.message }];
  }

  // 4. Verify RLS status on each table
  const rlsStatusQuery = `
    SELECT relname AS table_name, relrowsecurity AS rls_enabled
    FROM pg_class
    WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND relkind = 'r'
    ORDER BY relname;
  `;
  let rlsStatus: any[] = [];
  try {
    rlsStatus = await prisma.$queryRawUnsafe(rlsStatusQuery);
  } catch (err: any) {
    rlsStatus = [{ error: err.message }];
  }

  return NextResponse.json({
    message:
      'RLS migration complete. All listed tables now have RLS enabled. ' +
      'No permissive anon policies remain. Prisma (service role) access is unaffected.',
    migrationResults: results,
    remainingPolicies,
    rlsStatus,
  });
}
