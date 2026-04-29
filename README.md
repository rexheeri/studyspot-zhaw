# StudySpot ZHAW

Eine Web-App für ZHAW-Studierende zum Finden und Bewerten von Lernorten – community-getrieben, mit fokussierten Infos zu WLAN, Lärmpegel, Steckdosen und Verfügbarkeit.

> Modul: Prototyping, ZHAW Frühlingssemester 2026  
> Autor: Erion Rexhepi  
> Dozenten: Max Meisterhans, Mirella Moser

---

## Setup (lokal)

```bash
git clone https://github.com/rexheeri/studyspot-zhaw.git
cd studyspot-zhaw
npm install
cp .env.example .env   # MongoDB-URI in .env eintragen
npm run dev
```

Die App läuft danach auf http://localhost:5173

## Tech-Stack

| Bereich           | Tool               |
| ----------------- | ------------------ |
| Framework         | SvelteKit          |
| Styling           | Bootstrap 5        |
| Datenbank         | MongoDB Atlas      |
| Auth              | Supabase (geplant) |
| Hosting           | Netlify            |
| Versionskontrolle | Git / GitHub       |

---

## 1. Ausgangslage

ZHAW-Studierende stehen regelmässig vor dem Problem, kurzfristig einen geeigneten Lernort zu finden. Bestehende Tools wie Google Maps zeigen zwar Cafés und Bibliotheken, blenden jedoch jene Informationen aus, die für konzentriertes Studieren entscheidend sind: Ist WLAN vorhanden? Wie laut ist es? Gibt es Steckdosen? Sind aktuell Plätze frei? Diese Lücke führt dazu, dass Studierende Zeit mit erfolglosem Suchen verlieren oder sich an überfüllten Standardorten wie der Hauptbibliothek wiederfinden. Eine dedizierte, community-getriebene Plattform existiert für die ZHAW bisher nicht.

## 2. Lösungsidee

«StudySpot ZHAW» ist eine Web-App, auf der ZHAW-Studierende Lernorte erfassen, bewerten und filtern können. Im Zentrum steht die Filterbarkeit nach studienrelevanten Kriterien (WLAN, Lärmpegel, Steckdosen) sowie eine Sterne-Bewertung mit Kommentaren. Nur Personen mit einer verifizierten ZHAW-Schulmail (`@students.zhaw.ch`) können sich registrieren und Inhalte beitragen – das hält die Plattform community-fokussiert und qualitätsgesichert.

Der Mindestumfang umfasst eine Übersicht aller Spots, eine Detailseite je Spot mit Reviews, ein Formular zum Erfassen neuer Spots und ein Review-System. Geplante Erweiterungen sind unter anderem eine Live-Statusmeldung («ruhig / mittel / voll»), Authentifizierung via Supabase und eine durchschnittliche Sternebewertung pro Spot.

## 3. Vorgehen & Artefakte

*Wird laufend ergänzt – siehe Wochen W9–W14.*

### 3.1 Understand & Define

*folgt – Persona(s) und User Journey Map (siehe Issues #1 und #2)*

### 3.2 Sketch

In W9 wurden im Rahmen von Crazy-8s acht Lösungsvarianten für das Kernfeature «Spot finden» skizziert. Nach einer Mentor-Feedback-Runde fiel die Wahl auf **Variante 3 (Filter + Liste + Mini-Karte)** mit Kategorien-Chips als Einstieg. Die Varianten 2 (Ampel-Karte) und 6 (Live-Status-Feed) sind als Erweiterungen für W12 eingeplant.

Output: 8 Detail-Wireframes als Low-Fi-Vorlage für das Figma-Mockup (siehe Anhang).

### 3.3 Decide

*folgt – Begründung der Variantenwahl als Fliesstext, basierend auf der Crazy-8s-Reflexion*

### 3.4 Prototype

#### 3.4.1 Entwurf (Design)

In W10 wurde auf Basis der W9-Wireframes ein klickbarer Hi-Fi-Prototyp in Figma erstellt. Der Prototyp umfasst 8 Screens (4 Desktop, 4 Mobile) und deckt folgende Workflows ab: Spot finden und bewerten, Filtern, Karten-Toggle und Spot erfassen.

[Figma-Prototyp öffnen](https://www.figma.com/design/naxGM6CVN7PpOZ6JGnyVzp/StudySpot-ZHAW)

#### 3.4.2 Umsetzung (Technik)

Das Projekt wurde mit **SvelteKit** umgesetzt und nutzt **MongoDB Atlas** als Datenbank. Das Styling basiert auf **Bootstrap 5**. Deployment ist auf **Netlify** geplant und wird in W12 eingerichtet – bei jedem Push auf `main` soll ein automatisches Deployment ausgelöst werden.

Datenmodell (siehe ER-Diagramm im Anhang, Issue #4):

- **Collection `spots`**: Lernorte mit Name, Adresse, Beschreibung, WLAN, Lärmpegel, Steckdosen, Bild-URL, Meetingräume, Drucker, Reservierungs-URL.
- **Collection `reviews`**: Bewertungen mit Referenz auf einen Spot, Sterne (1–5), Kommentar, Autor.
- **Collection `checkins`** (Extension): Zeitlich begrenzte Statusmeldungen pro Spot.

**Routing-Struktur:** Die App nutzt SvelteKit File-Based Routing mit `+page.svelte` für die UI und `+page.server.js` für alle Datenbankzugriffe. Datenbankoperationen laufen ausschliesslich serverseitig – der MongoDB-URI wird nie an den Client übertragen.

**MongoDB-Anbindung:** Die Verbindung wird in `src/lib/db.js` zentral verwaltet mit dem nativen MongoDB Driver (kein Mongoose). Der URI wird via `.env` als `MONGODB_URI` injiziert.

**Implementierte Features (W11):** Spots auflisten, Spot-Detailseite, Spot erfassen (Form Action), Review abgeben (Form Action), interaktive Leaflet-Karte mit Geocoding via Nominatim, zusätzliche Felder für Meetingräume, Drucker und Reservierungslink.

### 3.5 Validate

*folgt – Usability-Test mit mindestens 3 Personen in W14*

## 4. Erweiterungen

*Folgt in W12. Geplant sind unter anderem: Filter auf der Übersichtsseite, Durchschnittsbewertung pro Spot, Supabase-Authentifizierung mit ZHAW-Mail-Validierung.*

## 5. Projektorganisation

Die Projektarbeit wird über **GitHub Issues** entlang des Wochenplans strukturiert. Jedes Feature und jedes Methodik-Artefakt ist als eigenes Issue erfasst und mit einem Label versehen (`MVP`, `extension`, `methodik`, `deployment`, `validate`). Commits referenzieren die zugehörigen Issues per `closes #X`, sodass der Fortschritt direkt im Repo nachvollziehbar ist.

Sprechende Commit-Messages folgen dem Schema **Conventional Commits** (z.B. `feat:`, `fix:`, `chore:`, `docs:`).

Sessions und Zwischenstände werden parallel in einer `STATUS.md` festgehalten (nicht im Repo, lokales Arbeitsdokument).

**Hinweis zur Datenbank-Sicherheit**: Atlas Network Access ist bewusst auf `0.0.0.0/0` gesetzt, weil Netlify-Deployments ohne fixe IP-Adresse funktionieren und die Datenbank parallel in einem anderen Modul genutzt wird. Der Schutz erfolgt über ein autogeneriertes, langes Passwort des Datenbank-Users. Credentials liegen ausschliesslich in der lokalen `.env` (nicht im Repo) bzw. als Environment-Variable im Netlify-Dashboard.

## 6. KI-Deklaration

*Wird laufend ergänzt.*

## 7. Anhang

*Folgt – Persona-Profile, User Journey Map, ER-Diagramm, Figma-Link, Usability-Test-Ergebnisse, Screenshots der finalen App.*