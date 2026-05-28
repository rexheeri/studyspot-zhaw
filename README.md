# StudySpot ZHAW

Eine Web-App für ZHAW-Studierende zum Finden und Bewerten von Lernorten. Community-getrieben, mit fokussierten Infos zu WLAN, Lärmpegel und aktueller Belegung.

> Modul: Prototyping, ZHAW Frühlingssemester 2026  
> Autor: Erion Rexhepi  
> Dozenten: Max Meisterhans, Mirella Moser

---

## Setup (lokal)

```bash
git clone https://github.com/rexheeri/studyspot-zhaw.git
cd studyspot-zhaw
npm install
cp .env.example .env   # MongoDB-URI und Supabase-Schlüssel in .env eintragen
npm run dev
```

Die App läuft danach auf http://localhost:5173

## Tech-Stack

| Bereich           | Tool          |
| ----------------- | ------------- |
| Framework         | SvelteKit     |
| Styling           | Bootstrap 5   |
| Datenbank         | MongoDB Atlas |
| Auth              | Supabase      |
| Hosting           | Netlify       |
| Versionskontrolle | Git / GitHub  |

---

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang](#7-anhang)

---

## 1. Ausgangslage

ZHAW-Studierende stehen regelmässig vor dem Problem, kurzfristig einen geeigneten Lernort zu finden. Bestehende Tools wie Google Maps zeigen zwar Cafés und Bibliotheken, blenden jedoch jene Informationen aus, die für konzentriertes Studieren entscheidend sind: Ist WLAN vorhanden? Wie laut ist es? Sind aktuell Plätze frei? Diese Lücke führt dazu, dass Studierende Zeit mit erfolglosem Suchen verlieren oder sich an überfüllten Standardorten wiederfinden. Eine dedizierte, community-getriebene Plattform für die ZHAW gibt es bisher nicht.

Das Ziel ist eine Web-App, auf der ZHAW-Studierende Lernorte erfassen, bewerten und nach studienrelevanten Kriterien filtern können. Die primäre Zielgruppe sind Studierende an den Standorten Winterthur und Zürich, indirekt profitieren auch Lernraumbetreiber von aktuellem Community-Feedback.

## 2. Lösungsidee

«StudySpot ZHAW» ist eine Web-App, auf der ZHAW-Studierende Lernorte erfassen, bewerten und filtern können. Im Zentrum steht die Filterbarkeit nach studienrelevanten Kriterien (WLAN, Lärmpegel, Belegung) sowie ein Sterne-Bewertungssystem mit Kommentaren. Nur Personen mit einer verifizierten ZHAW-Schulmail (`@zhaw.ch`) können sich registrieren und Inhalte beitragen, was die Plattform auf die ZHAW-Community beschränkt und die Qualität der Einträge sichert.

Die Kernfunktionen umfassen das Auflisten und Filtern von Spots, eine Detailseite je Spot mit interaktiver Karte, ein Review-System mit Sterne-Bewertung und Kommentar sowie das Erfassen neuer Spots via Formular. Die zugrundeliegende Annahme: Studierende sind bereit, Lernorte zu teilen und zu bewerten, solange der Aufwand gering ist. Die App erhebt keinen Anspruch auf Vollständigkeit und ersetzt keine Echtzeit-Belegungssensoren. Der Live-Status basiert auf Community-Meldungen und ist bewusst niedrigschwellig gehalten.

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define

Um den Problemraum zu verstehen, wurde zunächst das eigene Nutzungsverhalten als ZHAW-Studierender reflektiert und mit Kommiliton:innen besprochen. Das Problem ist nicht das Finden von Lernorten überhaupt, sondern das Finden von *passenden* Lernorten *kurzfristig* ohne Umwege und ohne böse Überraschungen. Google Maps scheitert hier nicht an der Datenmenge, sondern an fehlender studienrelevanter Filterbarkeit.

Auf Basis dieser Analyse wurden zwei Personas erarbeitet.

**Primär-Persona: Lea Vogel, 22, BSc Wirtschaftsinformatik (Vollzeit)**

Lea studiert im Vollzeitmodell und plant wöchentlich rund 20 Stunden Eigenarbeit. Sie wohnt in einer lauten WG und ist deshalb auf externe Lernorte angewiesen. Die Entscheidung für einen Spot fällt spontan, meist 30 bis 60 Minuten vor dem Lernen. WLAN und Steckdosen sind für sie keine optionalen Features, sondern Grundvoraussetzung. Das Hauptproblem: Sie kommt an einem Ort an und alles ist besetzt. Was sie braucht, ist Verlässlichkeit. Sie will wissen, ob ein Ort jetzt gerade frei ist, bevor sie den Weg auf sich nimmt.

> «Ich verschwende manchmal mehr Zeit damit, einen Platz zu suchen, als ich dann tatsächlich lerne. Ich will einfach kurz schauen können: Ist da gerade Platz? Gibt es WLAN?»

![Persona Lea Vogel](docs/methodik/persona-lea.png)

**Sekundär-Persona: Noah Keller, 25, BSc Betriebswirtschaft (Teilzeit, 60%)**

Noah studiert berufsbegleitend und lernt in kurzen Zeitfenstern zwischen Arbeit und Vorlesungen. Eine Fehlinvestition von 30 Minuten für einen ungeeigneten Ort kann eine ganze Lernsession ruinieren. Er plant Lernorte wenn möglich ein bis zwei Tage im Voraus, schätzt klare Angaben auf einen Blick und hat wenig Geduld für Apps mit komplizierter Bedienung. Community-Bewertungen von Kommiliton:innen vertraut er deutlich mehr als generischen Google-Reviews.

> «Ich habe oft nur 1.5 Stunden. Wenn der Ort dann nicht passt, ist die Lernsession gelaufen. Ich brauche Infos, denen ich vertrauen kann.»

![Persona Noah Keller](docs/methodik/persona-noah.png)

**User Journey Map**

Die Journey wurde für Leas Szenario «Spontan einen Lernort finden und danach bewerten» modelliert und umfasst sechs Phasen: Auslöser, Suche, Entscheidung, Ankunft, Lernen, Bewertung. Die Emotions-Kurve zeigt eine ausgeprägte Negativspitze beim Auslöser (Frustration über fehlende Alternativen) und nochmals in der Entscheidungsphase, wenn Infos fehlen oder veraltet sind. Sind die Daten nicht aktuell und vertrauenswürdig, bricht die Nutzerin die Suche ab oder geht ein Risiko ein.

Die wichtigste Erkenntnis: Live-Status ist kein Nice-to-have, sondern das Herzstück der App. Die grösste Nutzungsbarriere ist der vergebliche Weg. Wer weiss, ob ein Spot gerade «ruhig», «mittel» oder «voll» ist, kann eine fundierte Entscheidung treffen. Das ist der konkrete Mehrwert gegenüber Google Maps.

Eine zweite Erkenntnis betrifft den Moment der Bewertung: Die Bereitschaft zum Feedback ist direkt nach dem Spot-Besuch am höchsten. Der Review-CTA auf der Detailseite ist deshalb prominent platzi