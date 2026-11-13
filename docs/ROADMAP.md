# ROADMAP – satzanalyse

> Work is organised in three parts. The owner reviews every draft before a push; every push is verified against the raw/blob API with its commit SHA. Status: ✅ done · 🔄 in progress · ⏸ deferred.

| # | Part | Scope | Status |
| --- | --- | --- | --- |
| 1 | Frame + shell + docs | Tool page, guide, corpus placeholder, style, engine base (sentence split, tokenisation, NFC input), both exporters with the fill API and `#n` keys, full docs set, licenses | 🔄 draft |
| 2 | Dictionary + engine + morphology | `assets/dict.js` (6,207-word core dictionary with explicit stems + POS classes; three-tier accent lookup + stem-stripping incl. augment after preverbs), `assets/morph.js` (closed-class forms + per-class ending tables: 3rd declension nouns, contract and -μι verbs, participles, perfect), engine wiring, tool integration | 🔄 draft |
| 3 | Sample corpus + polish | `data/corpus.js` + corpus gallery: fully analysed sentences from John's Gospel and Xenophon (easy prose) as worked examples; final QA sweep, cross-links with the toolkit and the VN edition | ⏸ |

## Operating conventions

- Draft → review (demo + source canvases) → owner approval → push → verify via raw.githubusercontent with commit SHA (stale → blob API) → flip this roadmap → update the project knowledge.
- History: keep at most 6 entries, drop the oldest.
- QA sweep before pushing any file: no em dash (en dash – only), no CJK/Cyrillic/U+FFFD inside content, Greek apostrophe = ’ (U+2019), balanced HTML tags, balanced `{}` and `\begin`/`\end` in sample .tex, `&` counts per FORMAT-SPEC §3.
- Regression tests live in the project knowledge (work-tests/), not in the repository root; every part ships with a passing test script.

## History

- 2026-11-13: Part 2 drafted on top of Part 1: the 6,207-lemma dictionary + morphology tables landed in `assets/`, the engine gained the tiered dictionary lookup (accent keys, stem index, augment/preverb/contract/ψ-ξ rebuilds, movable nu, capital folding) and the morphology runner; demo canvases rebuilt for review.
- 2026-11-13: project started; owner fixed the 3-part route, the ambitious morphology scope (3rd declension, contract/-μι verbs, participles, perfect from day one) and the corpus sources (John + Xenophon). Part 1 draft prepared for review.
