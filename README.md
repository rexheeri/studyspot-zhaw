# StudySpot ZHAW

Eine Web-App für ZHAW-Studierende zum Finden und Bewerten von Lernorten – community-getrieben, mit fokussierten Infos zu WLAN, Lärmpegel, Steckdosen und Verfügbarkeit.

> Modul: Prototyping, ZHAW Frühjahrsemester 2026
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

| Bereich            | Tool                |
| ------------------ | ------------------- |
| Framework          | SvelteKit           |
| Styling            | Bootstrap 5         |
| Datenbank          | MongoDB Atlas       |
| Auth (geplant W12) | Supabase            |
| Hosting            | Netlify             |
| Versionskontrolle  | Git / GitHub        |

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

*folgt – High-Fi Figma-Mockup auf Basis der W9-Wireframes (siehe Issue #3)*

#### 3.4.2 Umsetzung (Technik)

Das Projekt wurde mit **SvelteKit** umgesetzt und nutzt **MongoDB Atlas** als Datenbank. Das Styling basiert auf **Bootstrap 5**. Deployment erfolgt automatisiert auf **Netlify** bei jedem Push auf `main`.

Datenmodell (siehe ER-Diagramm im Anhang, Issue #4):

- **Collection `spots`**: Lernorte mit Name, Adresse, Beschreibung, WLAN, Lärmpegel, Steckdosen, Bild-URL.
- **Collection `reviews`**: Bewertungen mit Referenz auf einen Spot, Sterne (1–5), Kommentar, Autor.
- **Collection `checkins`** (Extension): Zeitlich begrenzte Statusmeldungen pro Spot.

*Implementierungsdetails folgen ab W11.*

### 3.5 Validate

*folgt – Usability-Test mit mindestens 3 Personen in W14*

## 4. Erweiterungen

*Folgt in W12. Geplant sind unter anderem: Filter auf der Übersichtsseite, Durchschnittsbewertung pro Spot, Supabase-Authentifizierung mit ZHAW-Mail-Validierung.*

## 5. Projektorganisation

Die Projektarbeit wird über **GitHub Issues** entlang des Wochenplans strukturiert. Jedes Feature und jedes Methodik-Artefakt ist als eigenes Issue erfasst und mit einem Label versehen (`MVP`, `extension`, `methodik`, `deployment`, `validate`). Commits referenzieren die zugehörigen Issues per `closes #X`, sodass der Fortschritt direkt im Repo nachvollziehbar ist.

Sprechende Commit-Messages folgen dem Schema **Conventional Commits** (z.B. `feat:`, `fix:`, `chore:`, `docs:`).

Sessions und Zwischenstände werden parallel in einer `STATUS.md` festgehalten (nicht im Repo, lokales Arbeitsdokument).

## 6. KI-Deklaration

Im Rahmen dieses Projekts wurde **Claude (Anthropic)** als Coding-Mentor und Dokumentations-Assistent verwendet. Konkret bisher:

- **Projekt-Setup (W8/W9)**: Schritt-für-Schritt-Anleitung für GitHub-Repo-Erstellung, SvelteKit-Initialisierung, `.env`-Hygiene und ersten sauberen Commit.
- **Issue-Strukturierung**: Vorformulierung von 12 GitHub-Issues entlang des Wochenplans, inklusive Akzeptanzkriterien und Label-Vergabe.
- **README-Skelett**: Strukturvorschläge basierend auf der Modulvorlage; Formulierung von Kapitel 1 (Ausgangslage) und Kapitel 2 (Lösungsidee) auf Basis meiner Stichworte.

Sämtliche inhaltlichen Entscheidungen (Variantenwahl, Tech-Stack, Datenmodell, Priorisierung) wurden von mir getroffen. Code wird ab W11 selbst geschrieben; KI wird gezielt für Code-Reviews, Erklärungen und das Aufzeigen von Alternativen genutzt – nicht für das blinde Übernehmen ganzer Codeblöcke.

*Wird laufend ergänzt – siehe weitere Einträge ab W11.*

## 7. Anhang

*Folgt – Persona-Profile, User Journey Map, ER-Diagramm, Figma-Link, Usability-Test-Ergebnisse, Screenshots der finalen App.*