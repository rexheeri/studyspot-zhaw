// src/routes/+layout.server.js
// Gibt User/Session an ALLE Seiten weiter (über $page.data.user zugänglich)

export async function load({ locals }) {
  return {
    user: locals.user,
    session: locals.session
  };
}
