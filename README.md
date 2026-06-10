# Join – Kanban Projektmanagement

Eine webbasierte Kanban-Anwendung zur Aufgaben- und Projektverwaltung, entwickelt als Abschlussprojekt an der Developer Akademie.

---

## Features

- **Kanban Board** – Aufgaben in vier Spalten: To Do, In Progress, Await Feedback, Done
- **Drag & Drop** – Aufgaben per Maus zwischen Spalten verschieben
- **Aufgaben erstellen** – Titel, Beschreibung, Fälligkeitsdatum, Priorität, Kategorie und Subtasks
- **Kontakte** – Kontakte anlegen, bearbeiten und löschen; Aufgaben zuweisen
- **Dashboard** – Übersicht mit Taskzählern, nächstem Deadline und persönlicher Begrüßung
- **Suche** – Aufgaben nach Titel filtern
- **Authentifizierung** – Login, Registrierung und Gast-Modus

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Datenbank | Firebase Realtime Database (REST API) |
| Styling | Flexbox, CSS Grid, CSS Variables |
| Fonts | Inter (Google Fonts) |
| Icons | Custom SVG |

---

## Projektstruktur

```
Join/
├── index.html               # Splash Screen
├── style.css                # Globale Basisstyles & CSS-Variablen
├── htmls/                   # Alle Seiten
│   ├── summary.html         # Dashboard
│   ├── board.html           # Kanban Board
│   ├── add_task.html        # Aufgabe erstellen
│   ├── contacts.html        # Kontaktverwaltung
│   ├── login.html           # Login
│   └── signup.html          # Registrierung
├── scripts/                 # JavaScript
│   ├── firebase.js          # Firebase REST-Wrapper
│   ├── add_task.js          # Aufgabe erstellen
│   ├── board.js             # Board & Drag-and-Drop
│   ├── contacts.js          # Kontakte
│   ├── summary.js           # Dashboard-Metriken
│   ├── login.js             # Authentifizierung
│   ├── register.js          # Registrierung
│   └── utils.js             # Hilfsfunktionen (Avatare, Farben)
├── styles/                  # Feature-spezifische CSS-Dateien
├── templates/               # Sidebar & Header (wiederverwendbar)
└── assets/                  # Icons, Bilder, Fonts
```

---

## Setup & Start

Da das Projekt kein Build-Tool verwendet, reicht ein einfacher lokaler Webserver:

**Mit VS Code Live Server:**
1. Repository klonen:
   ```bash
   git clone https://github.com/ManuelvonKneten/Join.git
   ```
2. Ordner in VS Code öffnen
3. `index.html` mit Live Server starten

**Alternativ direkt im Browser:**  
`index.html` öffnen (eingeschränkte Firebase-Funktionalität möglich je nach Browser-Sicherheitseinstellungen).

---

## Firebase

Die App nutzt die Firebase Realtime Database über die REST API (kein SDK). Datenbankstruktur:

```
/users      – Benutzerkonten
/contacts   – Kontakte
/tasks      – Aufgaben
```

---

## Entwickelt von

Manuel von Kneten, Quirin Pflaum & Fesih Alpagu – Developer Akademie Abschlussprojekt
