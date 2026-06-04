// src/hooks.server.js
// Läuft bei JEDEM Request – validiert den User serverseitig und stellt ihn allen Pages zur Verfügung

import { createSupabaseServerClient } from '$lib/supabase';

export async function handle({ event, resolve }) {
  event.locals.supabase = createSupabaseServerClient(event.cookies);

  // getUser() validiert das JWT gegen den Supabase-Auth-Server (sicherer als getSession())
  const {
    data: { user }
  } = await event.locals.supabase.auth.getUser();

  event.locals.user = user ?? null;

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
}
