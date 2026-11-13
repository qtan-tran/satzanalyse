# ARCHITECTURE – satzanalyse

> Ancient Greek sentence analysis with an English interface, fully client-side, no server, no build.

## 1. Position in the four-repository organisation

| Repository | Role | URL |
| --- | --- | --- |
| `graecum-vn` | Vietnamese course portal, 48 lessons + vocab/Anki | https://github.com/qtan-tran/graecum-vn |
| `ancient-greek-toolkit` | Lookup tool hub (lexica, texts, typing, practice) | https://github.com/qtan-tran/ancient-greek-toolkit |
| `satzanalyse-vn` | Sentence analysis platform, Vietnamese edition | https://github.com/qtan-tran/satzanalyse-vn |
| **`satzanalyse`** (this repository) | Sentence analysis platform, **English edition** | https://github.com/qtan-tran/satzanalyse |

The repositories deploy independently and cross-link. This edition is the evolution of `satzanalyse-vn`: same method (three-layer word blocks, seven steps, Satzanalyse canvas formats), same philosophy, but with an English interface and two engine upgrades the Vietnamese edition cannot retrofit cheaply:

1. **A 6,207-word core dictionary with explicit stems and part-of-speech classes** (`lemma \t stem(s) \t pos \t gloss`, built from the Perseus Vocabulary Tool, DCC Greek core list and Middle Liddell). The Vietnamese edition had to guess stems from lemma shapes, which was the root cause of its tier-3 bugs; here the stems are data.
2. **Class-aware morphology**: the POS code (N-1m, N-3f, V-1, V-2, V-3, ADJ-12, ADJ-3, ...) selects the ending table, which is what finally covers 3rd-declension nouns, contract verbs, -μι verbs, participles and the perfect.

## 2. Data flow (100% client-side)

```
User pastes Greek text (≤ 1,500 characters, normalised to NFC)
        │
        ▼
assets/dict.js + assets/morph.js (loaded before the engine, Part 2)
        │      set window.SA_DICT (core dictionary TSV) + window.SA_MORPH
        ▼
assets/engine.js        split sentences (. · ; ! + line breaks) → tokenise
        │                word blocks (Greek chars + elision apostrophes ’ ʼ ')
        │                dictLookup(token): four accent-key tiers (accent-exact, then accents folded, breathings folded, all marks folded); a miss in
        │                all three → strip ending/augment and match the stem
        │                index built from the stem column (derived) or null
        │                morphLookup(token, entry): closed-class / invariable
        │                (conf 2) or per-class ending guess (conf 1 – "?")
        ▼
intermediate model  { title, subtitle, sentences[{n, greek, tokens}],
        │            vocab[unique, in order of appearance] }
        ├──► assets/exporter-html.js → satzanalyse.html (self-contained, print CSS)
        └──► assets/exporter-tex.js  → satzanalyse.tex (XeLaTeX/Overleaf)
        ▼
The learner fills in the blanks (functions, forms, glosses, translations)
        ▼
PDF export: print the HTML from the browser, or compile the .tex (guide.html)
```

The "fill it in yourself" step is deliberate, not a gap: the tool's philosophy is to **never fabricate an analysis**. The dictionary pre-fills what it finds; morphology hints come in two confidence levels: closed-class forms are certain, ending guesses always carry a "?" to verify. The sample corpus (Part 3) is the separate branch: `corpus.html` loads `data/corpus.js` (hand analyses, reviewed) and calls the exporter with the fill API `{hint, tr, sentences[], patterns[]}` – the generated frame comes fully filled (functions, forms, glosses, sense groups, verb table, translations, pattern boxes) as a worked example.

There is deliberately **no interactive worksheet**: the corresponding feature was built and then withdrawn in the Vietnamese edition on the owner's decision. The working standard for complete frames is the fill API above, driven by a manual analysis.

## 3. Mandatory technical principles

1. **No build**: self-contained static HTML + plain JS, no framework, no package manager, no build step. Opening `index.html` directly (file://) just works.
2. **No fetch of local data**: data files load via `<script src="...js">` setting a global variable (e.g. `assets/dict.js` → `window.SA_DICT`). `fetch()` of JSON/TSV is blocked by CORS on file:// – never use it.
3. **Server only if truly needed and loopback only** (e.g. `python3 -m http.server`); the product never depends on a server.
4. **Zero dependencies**: no CDN, no npm, no downloaded fonts (system fonts; exports use FreeSerif/DejaVu on the LaTeX side).
5. **Stable URLs**: published paths are never renamed or moved; new content gets new files.
6. **No single-person dependency**: every design decision carries its rationale in `docs/ARCHITECTURE.md` and `docs/FORMAT-SPEC.md`; editorial conventions in `docs/STYLE-AND-CONVENTIONS.md`; operations in `docs/ROADMAP.md`.
7. **1,500-character input threshold** (~15–20 sentences) per run: enforced in `engine.js` (`SA.LIMIT`), shown by the UI counter, with a friendly error suggesting to split the text. Reason: keep the exported frame at the scale of one study session.
8. **Unicode NFC at the boundary**: the engine normalises pasted text to NFC inside `analyze()`, and all packaged data is NFC. Lookup keys additionally accent-fold (three tiers), so decomposed or partially accented input still matches. The fold happens once while building the lookup index (a Map built at page load), per the owner's staff requirement: index once, then every lookup is instant.

## 4. Two parallel export formats

One model generates two formats with a 1:1 structure (full details: `docs/FORMAT-SPEC.md`):

| Component | HTML (exporter-html.js) | LaTeX (exporter-tex.js) |
| --- | --- | --- |
| Sentence frame | `.satz` (head + body) | `satz` environment `{Sentence n – {\grt …}}` |
| 3-layer word block | `.wb` (fn/word/form) | `\w{KEY}{block}{form}` |
| AcI / subordinate group | `.grp` | `\grp` |
| Sense-group table | `table.chunks` (3 columns) | `tabular >{\grt}l l l` (2 `&` per row) |
| Verb table | `.vtab` 8 columns | `\vtab{…}` (7 `&` per row) |
| Seven steps | `ol.steps` | `\steps{…}` |
| Translation | `.ueb` | `\ueb{wörtlich}{natürlich}` |
| Vocabulary | `.vocab` 6 columns (★ separate) | `longtable` 5 columns (4 `&`) |
| Patterns | `.pat` | `pat` environment |
| Endings table | `table` 3 columns | `tabular` 3 columns (2 `&`) |

The `.tex` preamble is taken 1:1 from the Satzanalyse canvas format (the `\w \en \grp \chip` macros and the `satz vtab steps ueb pat` environments are unchanged), plus an **English `\renewcommand` label block** after the preamble. One documented deviation from the Vietnamese edition: the header row inside the `\vtab` macro definition is set in English (Form / Lemma / Pers. / Num. / Tense / Mood / Voice / Subject), since it is part of this repository's own preamble, not of the shared canvas macros.

## 5. Data plan

- **Part 2 – core dictionary** (`assets/dict.js`, `window.SA_DICT`): a TSV string embedded in JS, parsed into lookup indexes once at first use (target: at page load). 6,207 entries, 4 columns: `lemma \t stem(s) \t pos \t gloss`; stems joined with `|`; POS codes are Perseus-style classes. Sources and licenses in `docs/COPYRIGHT.md`: Perseus Vocabulary Tool (CC BY-SA), DCC Greek Core Vocabulary (CC BY-SA), Middle Liddell (public domain). Lookup: four accent tiers (accent-exact for accent-only homonyms, then accents folded with breathings/iota kept, then breathings folded, then all marks folded for keys of 2+ base characters) + editorial form keys; a miss in all tiers goes to stem-stripping (case/personal endings, sigmatic clusters ψ/ξ/τ, -θη, the ἐ- augment and augment after common preverbs), matching against the stem index built from the explicit stem column. Exactly one lemma → entry with `derived: true`; zero or several → null (no guessing). Details in `docs/FORMAT-SPEC.md` §5.
- **Part 2 – morphology** (`assets/morph.js`, `window.SA_MORPH`): closed-class exact forms (articles, pronouns, εἰμί; looked up with grave/acute variants since forms vary with sentence position) + per-class ending tables selected by the POS code: nouns 1st/2nd/3rd declension, adjectives, verbs thematic/contract/-μι (present, imperfect, aorist, future; active + middle/passive; infinitive, participle, perfect). Engine `morphLookup(token, entry)`: the entry's POS class gates the table choice (particles/conjunctions/prepositions/adverbs → "invariable", conf 2); without an entry, the noun table is tried first, then the verb table; at most two analyses, most likely first (fixed convention); final iota subscript (ῃ/ᾳ/ῳ) = Dat. Sg. or 2nd Sg. middle/passive. conf 2 is stated plainly, conf 1 gets "?". Details in `docs/FORMAT-SPEC.md` §6.
- **Part 3 – corpus** (`data/corpus.js`, `window.SA_CORPUS`): fully analysed sample sentences from John's Gospel and Xenophon (public domain), hand analysis + fill data for the exporter. Item shape + fill API + the `#n` key convention (repeated tokens) in `docs/FORMAT-SPEC.md` §8. The HTML exporter takes the second parameter `SA_HTML.build(model, fill)`; corpus.html is the gallery (lazy iframe srcdoc rendering, blob download). Fill for `.tex` is not planned.

## 6. License constraints

Public domain + original material only, with the dictionary as the documented exception (CC BY-SA and PD sources, attributed); details in `docs/COPYRIGHT.md`. The corpus never copies adapted text from any copyrighted textbook.
