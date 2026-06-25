<div align="center">

# Join

**Webbasiertes Kanban-Tool zur Aufgaben- und Projektverwaltung**

Abschlussprojekt der [Developer Akademie](https://developerakademie.com/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-FFCA28?logo=firebase&logoColor=black)
![Status](https://img.shields.io/badge/Status-final-success)

</div>

---

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Projektstruktur](#projektstruktur)
- [Setup & Start](#setup--start)
- [Firebase](#firebase)
- [Architektur & Konventionen](#architektur--konventionen)
- [Browser-Support](#browser-support)
- [Team](#team)

---

## Über das Projekt

**Join** ist eine Single-Page-orientierte Webanwendung im Stil eines Kanban-Boards
(angelehnt an Trello). Aufgaben werden in vier Status-Spalten organisiert und lassen
sich per Drag & Drop verschieben. Daten werden ohne Backend-Framework direkt über die
REST-Schnittstelle der **Firebase Realtime Database** persistiert.

Das Projekt wurde mit **Vanilla JavaScript** umgesetzt – ohne Framework, ohne Build-Tool –
um ein solides Verständnis von DOM-Manipulation, asynchroner Datenverarbeitung und
modularer Code-Organisation nachzuweisen.

---

## Features

| Bereich | Beschreibung |
|---|---|
| 🗂️ **Kanban Board** | Aufgaben in vier Spalten: *To Do*, *In Progress*, *Await Feedback*, *Done* |
| 🖱️ **Drag & Drop** | Tasks per Maus zwischen den Spalten verschieben; Status wird automatisch gespeichert |
| ➕ **Aufgaben erstellen** | Titel, Beschreibung, Fälligkeitsdatum, Priorität, Kategorie, zugewiesene Kontakte und Subtasks |
| ✏️ **Aufgaben bearbeiten** | Bestehende Tasks im Detail-Dialog editieren und löschen |
| ✅ **Subtasks** | Teilaufgaben anlegen und mit Fortschrittsbalken abhaken |
| 👥 **Kontaktverwaltung** | Kontakte anlegen, bearbeiten, löschen; farbige Avatare aus Initialen |
| 📊 **Dashboard** | Übersicht mit Task-Zählern, nächster Deadline und tageszeitabhängiger Begrüßung |
| 🔍 **Suche** | Live-Filter der Tasks nach Titel |
| 🔐 **Authentifizierung** | Registrierung, Login und Gast-Modus inkl. geschützter Routen (Auth-Guard) |
| 📱 **Responsive Design** | Optimiert für Desktop und mobile Endgeräte (Bottom-Navigation auf Mobil) |

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| **Struktur** | HTML5 (semantisch) |
| **Styling** | CSS3 – Flexbox, CSS Grid, Custom Properties |
| **Logik** | Vanilla JavaScript (ES6+), keine Frameworks, kein Build-Step |
| **Persistenz** | Firebase Realtime Database via REST API (`fetch`) |
| **Session** | `localStorage` für den aktiven Benutzer |
| **Fonts** | Inter |
| **Icons** | Custom SVG |

---

## Screenshots

> _Platzhalter – Screenshots hier einfügen (z. B. `assets/img/screenshot-board.png`)._

| Login | Board | Add Task |
|---|---|---|
| _Login-Ansicht_ | _Kanban Board_ | _Aufgabe erstellen_ |

---

## Projektstruktur

```text
Join/
├── index.html              # Splash Screen (Einstiegspunkt)
├── style.css               # Globale Basisstyles & CSS-Variablen
│
├── htmls/                  # Alle Seiten
│   ├── login.html          # Login
│   ├── signup.html         # Registrierung
│   ├── summary.html        # Dashboard
│   ├── board.html          # Kanban Board
│   ├── add_task.html       # Aufgabe erstellen
│   ├── contacts.html       # Kontaktverwaltung
│   ├── help.html           # Hilfe
│   ├── legal_notice.html   # Impressum
│   └── privacy_policy.html # Datenschutz
│
├── scripts/                # JavaScript-Logik
│   ├── firebase.js         # REST-Wrapper (GET/POST/PATCH/DELETE)
│   ├── auth_guard.js       # Schutz geschützter Routen
│   ├── login.js            # Login & Gast-Modus
│   ├── register.js         # Registrierung
│   ├── summary.js          # Dashboard-Metriken
│   ├── board.js            # Board-Rendering & Drag-and-Drop
│   ├── board_dialogs.js    # Task-Detail-Dialoge
│   ├── board_edit.js       # Task bearbeiten
│   ├── board_utils.js      # Board-Hilfsfunktionen
│   ├── add_task.js         # Aufgabe erstellen
│   ├── contacts.js         # Kontaktverwaltung
│   ├── utils.js            # Avatare, Farben, Toasts, Session
│   └── splashlogo.js       # Splash-Screen-Animation
│
├── styles/                 # Feature-spezifische Stylesheets
├── templates/              # Wiederverwendbare HTML-Fragmente (Header, Sidebar, Nav)
└── assets/                 # Icons, Bilder, Fonts, Sounds
```

---

## Setup & Start

Das Projekt benötigt **kein** Build-Tool und keine Abhängigkeiten – ein lokaler
Webserver genügt (wegen `fetch`-Requests funktioniert das Öffnen via `file://`
nur eingeschränkt).

**Mit VS Code Live Server (empfohlen):**

1. Repository klonen:
   ```bash
   git clone https://github.com/ManuelvonKneten/Join.git
   ```
2. Ordner in VS Code öffnen.
3. `index.html` per **Live Server** starten.

**Alternativ mit Python:**

```bash
cd Join
python -m http.server 5500
# Browser: http://localhost:5500
```

Anschließend entweder einen Account registrieren oder den **Gast-Login** verwenden.

---

## Firebase

Die App nutzt die **Firebase Realtime Database** ausschließlich über die REST API
(kein SDK). Alle Datenbankzugriffe sind in `scripts/firebase.js` gekapselt:

```js
getFromDB(path)          // GET    – Daten lesen
postToDB(path, data)     // POST   – Eintrag mit auto-generierter ID anlegen
patchToDB(path, data)    // PATCH  – einzelne Felder aktualisieren
deleteFromDB(path)       // DELETE – Eintrag löschen
```

**Datenbankstruktur:**

```text
/users      – Benutzerkonten (Name, E-Mail, Passwort)
/contacts   – Kontakte (Name, E-Mail, Telefon)
/tasks      – Aufgaben (Titel, Status, Priorität, Subtasks, zugewiesene Kontakte …)
```

> ⚠️ **Hinweis:** Die Datenbank-URL ist im Quellcode hinterlegt und die Datenbank
> ist als offene Demo-Instanz konfiguriert. Dies ist eine bewusste Vereinfachung
> für den Ausbildungskontext und nicht für den Produktivbetrieb gedacht.

---

## Architektur & Konventionen

- **Trennung der Verantwortlichkeiten:** HTML (`htmls/`), CSS (`styles/`) und
  JavaScript (`scripts/`) sind sauber getrennt; das Board ist zusätzlich nach
  Verantwortung in mehrere Module aufgeteilt.
- **Wiederverwendbare Templates:** Header, Sidebar und Navigation werden aus
  `templates/` per JavaScript eingebunden, um Duplikate zu vermeiden.
- **Dokumentation:** Funktionen sind durchgängig mit **JSDoc**-Kommentaren versehen.
- **Session-Handling:** Der angemeldete Benutzer wird in `localStorage` gehalten;
  `auth_guard.js` schützt alle internen Seiten vor unautorisiertem Zugriff.
- **Konsistente Avatare:** Farben werden deterministisch aus dem Namen abgeleitet
  (`utils.js`), sodass ein Name stets dieselbe Farbe erhält.

---

## Browser-Support

Getestet in aktuellen Versionen von **Chrome**, **Firefox** und **Edge**.
Voraussetzung sind moderne ES6+-Features (`fetch`, `async/await`, Arrow Functions).

---

## Team

Entwickelt im Rahmen der **Developer Akademie**:

- **Manuel von Kneten**
- **Quirin Pflaum**
- **Fesih Alpagu**

---

<div align="center">

_Dieses Projekt entstand zu Ausbildungszwecken und ist nicht für den produktiven Einsatz bestimmt._

</div>
