// src/hooks.server.js
// Läuft bei JEDEM Request – liest Session aus Cookie und stellt sie allen Pages zur Verfügung

import { createSupabaseServerClient } from '$lib/supabase';

export async function handle({ event, resolve }) {
  event.locals.supabase = createSupabaseServerClient(event.cookies);

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();

  event.locals.session = session;
  event.locals.user = session?.user ?? null;

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
}
