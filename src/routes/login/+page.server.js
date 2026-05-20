// src/routes/login/+page.server.js

import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_EMAIL } from '$env/static/private';

export async function load({ locals }) {
  // Bereits eingeloggt → direkt zu /spots
  if (locals.user) {
    redirect(303, '/spots');
  }
  return {};
}

export const actions = {
  // --- REGISTRIERUNG ---
  register: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase();
    const password = data.get('password')?.toString();

    // ZHAW-Mail-Pflicht
    if (!email?.endsWith('@students.zhaw.ch')) {
      return fail(400, {
        action: 'register',
        error: 'Nur ZHAW-Studierende mit einer @students.zhaw.ch Adresse dürfen sich registrieren.'
      });
    }

    if (!password || password.length < 8) {
      return fail(400, {
        action: 'register',
        error: 'Das Passwort muss mindestens 8 Zeichen lang sein.'
      });
    }

    const { error } = await locals.supabase.auth.signUp({ email, password });

    if (error) {
      return fail(400, { action: 'register', error: error.message });
    }

    return {
      action: 'register',
      success: 'Konto erstellt! Bitte bestätige deine E-Mail-Adresse, dann kannst du dich einloggen.'
    };
  },

  // --- LOGIN ---
  login: async ({ request, locals, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString().trim().toLowerCase();
    const password = data.get('password')?.toString();

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return fail(400, {
        action: 'login',
        error: 'E-Mail oder Passwort falsch. Oder E-Mail noch nicht bestätigt.'
      });
    }

    redirect(303, '/spots');
  },

  // --- LOGOUT ---
  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/');
  }
};
