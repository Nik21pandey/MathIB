# GenIB

Exam-preparation platform: the original past-paper library, bundles and payments, plus a
maths learning platform (notes, drills, graded exam questions, worksheet builder, Daily 5).

```
backend/    Django REST API (auth, papers, bundles, payments, learn)
frontend/   React + Vite + Tailwind
content/    Source of the maths content and the script that builds the catalog
```

## Run it

```bash
# backend
cd backend
pip install -r requirements.txt
python manage.py makemigrations learn     # first time only: creates the learn tables
python manage.py migrate
python manage.py seed_learn               # loads syllabuses, topics, notes and questions
python manage.py runserver

# frontend
cd frontend
npm install
npm run dev
```

The learning pages also work with no backend at all: if `/api/v1/learn/catalog/` cannot be
reached, the frontend uses the copy of the catalog bundled in `frontend/src/data/catalog.json`.

Set `VITE_API_URL` (frontend) and `FRONTEND_URL` (backend) for deployed environments.

## The learning platform

All of these pages are public: no login is needed.

| URL | What it is |
| --- | --- |
| `/contents` | Fast index: instant search over every topic, with direct links to notes, drill, exam questions and quiz |
| `/learn` | Guided mode: board, syllabus, topic tree, progress bars |
| `/:syllabus` | Syllabus page, e.g. `/igcse-0580`. IB Math AA HL has the current / new syllabus switch |
| `/:syllabus/:section` | Section or hub, e.g. `/igcse-0580/non-calculator-paper-2` |
| `/:syllabus/:section/:topic` | Topic workspace with three tabs: notes and cheat sheet, fluency drills, exam bank. MYP Criterion B topics add an interactive investigation |
| `/question/:slug` | One question per page with its mark scheme (for search engines and sharing) |
| `/worksheet-builder` | Pick questions, see marks and time, export a student booklet and a mark scheme |
| `/worksheet/print` | The printable documents. Every page carries a QR code |
| `/w/:code` | Where the QR code leads: online mark schemes for that worksheet |
| `/daily-5`, `/quiz/:spec` | Daily five-question challenge by level, topic quizzes, and "challenge a friend" links |
| `/crash`, `/crash/:slug` | Night-before checklists with an exam countdown |

### How the pieces fit

- **Catalog.** Syllabuses, topics, notes, questions and checklists are one JSON document. The
  frontend loads it once (`frontend/src/learn/catalog.tsx`) and filters in the browser.
- **Drill generators** (`frontend/src/learn/generators.ts`) create unlimited fluency questions
  with worked-out wrong answers. They are seeded, so a quiz link always recreates the same
  five questions. A topic lists the generators it uses in its `generators` field.
- **Progress** (red / amber / green per topic, Daily 5 streak, checklist ticks) is stored in
  the visitor's browser (`frontend/src/learn/progress.ts`).
- **Maths rendering** uses KaTeX, loaded from a CDN in `frontend/index.html`. Write `$...$`
  for inline maths and `$$...$$` for display maths; `\$` is a literal dollar sign.
- **SEO.** Each page sets its own title, description, canonical link, Open Graph tags and
  structured data (`frontend/src/learn/seo.ts`). The backend serves `/sitemap.xml` and
  `/robots.txt` listing every syllabus, section, topic and question URL.

### Adding or editing content

Two ways, pick one as the source of truth:

1. **Django admin** (`/admin`, "Learning Platform"). Changes appear on the site within seconds.
2. **Content files.** Edit `content/*.mjs`, then:

   ```bash
   node content/build.mjs            # validates and writes both catalog.json files
   cd backend && python manage.py seed_learn
   ```

   The build checks that ids are unique, that mark schemes add up to the marks for each
   question and (if the `katex` package is installed) that every formula parses.

To add a video solution, put its URL in the question's or topic's `video` field. The button
appears automatically.

To change exam countdown dates, edit Exam sessions in the admin (or `sessions` in
`content/build.mjs`). The seeded dates are approximate.
