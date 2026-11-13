# satzanalyse

> Ancient Greek sentence analysis with an English interface – paste Greek text and receive a visual analysis worksheet in two formats: **static HTML** and **LaTeX (.tex)**, following the three-layer Satzanalyse method (morphology – syntax – semantics) and its seven steps.

This repository is developed and maintained by **Quoc-Tan Tran**, **Postdoctoral Researcher** at the **Institute for Studies of Science, Bielefeld University**.

## Getting started

- **Online** (once GitHub Pages is enabled): https://qtan-tran.github.io/satzanalyse/
- **Offline**: download the repository, open `index.html` in a browser – everything runs locally, no installation, no internet required.

## Workflow

1. Paste Greek text (max **1,500 characters** ≈ 15–20 sentences per run) into the text box. Your input is normalised to Unicode NFC, so decomposed or inconsistently encoded text still matches cleanly.
2. The tool splits sentences, tokenises word blocks, looks words up in the **core dictionary of ~6,200 classical Greek words** (built from the Perseus Vocabulary Tool, the DCC Greek core list and Middle Liddell; when a direct lookup misses, it strips a case/personal ending and the ἐ- augment and guesses back to the dictionary, labelled "(ending stripped)"), suggests **morphology from per-class ending tables** (closed-class forms are certain; ending guesses carry a "?"), and generates the **analysis frame**: per sentence a three-layer word-block diagram, a "translation by sense groups" table, a verb table, the seven analysis steps, and a translation box; then PART 2 with vocabulary (in order of appearance, unique; pre-filled where found), pattern boxes and an automatic endings table.
3. Download the two files: `satzanalyse.html` (open and fill in with any editor, print to PDF via the browser) and `satzanalyse.tex` (compile via Overleaf/XeLaTeX – see the **Guide** page).
4. The blank cells are **the point of the method**: the tool never fabricates an analysis. Anything not found in the dictionary (or ambiguous between words) stays blank for you to look up and fill in. Want a fully completed frame (functions + colours + sense-group translations + exact morphology)? Ask for an analysis directly in the chat and receive a pre-filled frame.

## Position in the ecosystem

| Repository | Role |
| --- | --- |
| [graecum-vn](https://github.com/qtan-tran/graecum-vn) | Vietnamese Ancient Greek course portal, 48 lessons + 10 review lessons |
| [ancient-greek-toolkit](https://github.com/qtan-tran/ancient-greek-toolkit) | Lookup tool hub: lexica, texts, typing, practice, reference |
| [satzanalyse-vn](https://github.com/qtan-tran/satzanalyse-vn) | The Vietnamese edition of this sentence-analysis platform |
| **satzanalyse** (this repository) | The English edition: global audience, improved engine and a 6,207-word core dictionary |

## Repository structure

```
index.html            Main tool
guide.html            Usage guide + how to export a PDF
corpus.html           Sample corpus (Part 3): fully analysed sentences as worked examples
assets/               style.css + engine.js + exporter-html.js + exporter-tex.js
data/                 data/dict.js (Part 2) – core dictionary, client-side embedded TSV
                      data/morph.js (Part 2) – morphology tables: closed-class + endings per class
                      data/corpus.js (Part 3) – sample sentences, hand analysis + fill data
docs/                 ARCHITECTURE · ROADMAP · COPYRIGHT · FORMAT-SPEC · STYLE-AND-CONVENTIONS
```

## Roadmap

See `docs/ROADMAP.md`: Part 1 frame + shell + docs ✅ → Part 2 core dictionary (6,207 words with explicit stems and POS classes) + engine lookups + morphology incl. 3rd declension, contract and -μι verbs, participles and the perfect → Part 3 sample corpus (John + Xenophon) + polish.

## License

- **Code**: MIT (see `LICENSE`).
- **Content** (docs, analysis frames, corpus): CC BY-SA 4.0 – https://creativecommons.org/licenses/by-sa/4.0/
- **Dictionary data** in `data/dict.js` builds on the Perseus Vocabulary Tool (CC BY-SA), the DCC Greek Core Vocabulary (CC BY-SA) and Middle Liddell (public domain); attribution is kept in the file header and in `docs/COPYRIGHT.md`.

When citing or reusing, credit: "satzanalyse – Quoc-Tan Tran, https://github.com/qtan-tran/satzanalyse, CC BY-SA 4.0 (content) + MIT (code)".
