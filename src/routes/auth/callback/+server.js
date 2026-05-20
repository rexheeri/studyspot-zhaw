// src/routes/auth/callback/+server.js
// Verarbeitet den Bestätigungslink aus der Supabase-E-Mail

import { redirect } from '@sveltejs/kit';

export async function GET({ url, locals }) {
  const code = url.searchParams.get('code');

  if (code) {
    await locals.supabase.auth.exchangeCodeForSession(code);
  }

  // Nach erfolgreicher Bestätigung → direkt zur Spots-Übersicht
  redirect(303, '/spots');
}
