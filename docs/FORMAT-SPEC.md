# FORMAT-SPEC – satzanalyse

> Specification of the data model, both export formats, and the packaged data files. The exporters are the reference implementation; this document is the contract. Version 1.0 (Part 1 draft).

## §1 Data model (engine `analyze()` output)

```
model = {
  ok: true,
  chars: <number of characters after NFC normalisation>,
  title: '', subtitle: '',            // optional document header (unused by the tool UI)
  sentences: [{ n: <1-based index>, greek: <normalised sentence text>, tokens: [<string>] }],
  vocab: [<token, unique, in order of first appearance>]
}
```

Error returns: `{ok:false, code:'empty'}` · `{ok:false, code:'limit', chars, limit}` · `{ok:false, code:'nogreek'}`. Sentence split: cut after `. · ; !` and newlines, only when followed by whitespace or end of text. Token: a run of Greek characters plus elision apostrophes (’ U+2019, ʼ U+02BC, ASCII '), containing at least one Greek character. Pasted text is normalised to Unicode NFC inside `analyze()` before anything else.

## §2 HTML export (exporter-html.js)

Self-contained, no `<script>`, print CSS: one sentence per page, no block split across pages. Structure:

```
hint (no-print, print advice) → h1 title → .sub subtitle → .focus focus line
box "Original text"        .orig: "(n) <span class=gk>sentence</span>" per line
box "Legend"               chips (14 functions, standard colours) + reading rules + abbreviations
h2 "PART 1 – Sentence-by-sentence analysis"
  .satz per sentence:
    .head  "Sentence n – <span class=gk>greek</span>"
    .body   .diagram (word blocks) → table.chunks → table.vtab → ol.steps → note → .ueb
box "Full translation"
h2 "PART 2 – Vocabulary and patterns"
  table.vocab → 3× .pat (pattern boxes) → endings table
footer credit
```

Word block `.wb` (three layers): `.fn` function label (blank `…` unless assigned; grey `#777` when unassigned, function colour when assigned) → `.word` the token → optional `.gl` short gloss (first sense, cut at ~24 chars) → `.form` morphology cell: exact/certain analysis, or guess + `" ?"`, or `(form?)` when nothing found, or `invariable`.

Sense-group table `table.chunks`: caption "Translation by sense groups (how the meanings connect)"; columns: Greek phrase | English | Notes. Default split: chunks of 4 tokens (mechanical; the learner regroups by meaning).

Verb table `table.vtab`: 8 columns – Form | Lemma | Person | Number | Tense | Mood | Voice | Subject.

Vocabulary table `table.vocab`: 6 columns – Form in text | Lemma (+" (ending stripped)" for derived hits) | POS | Suggested form | Gloss | ★. Note line under the table explains ★, "(ending stripped)" and "?".

Pattern box `.pat`: Example / Rule / Recognition tip; empty (exercise) without fill, pre-filled from corpus data with fill.

Endings table: rows `ending | identifies | examples in text`, max 12 pre-filled, all suggestions.

## §3 LaTeX export (exporter-tex.js)

Preamble 1:1 from the Satzanalyse canvas format (`\w \en \grp \chip`, environments `satz vtab steps ueb pat` – macros unchanged) + English `\renewcommand` label block. Documented deviation: the header row inside the `\vtab` macro definition is English (Form/Lemma/Pers./Num./Tense/Mood/Voice/Subject). Compile with XeLaTeX (fontspec, FreeSerif/DejaVu).

Structure mirrors §2 (`\begin{satz}` frames, `\w` blocks as comments for the learner, sense-group tabular, `\vtab` empty hint, `\steps`, `\ueb`, vocab `longtable`, 3 `pat` boxes, endings tabular). Dictionary and morphology hints are emitted as `%` comments per sentence, never inside the visible macros.

`&` counts per table row: vtab 7 · vocab longtable 4 · endings 2 · sense groups 2.

## §4 The seven steps

`SA.STEPS` holds the seven method prompts verbatim (find finite verbs / subjects / word blocks / government / AcI / negation / translation). Both exporters render them as-is; the .tex keeps the enumerate order.

## §5 Core dictionary (assets/dict.js, Part 2)

Load: `<script src="assets/dict.js">` before `engine.js`; sets `window.SA_DICT` = TSV string (an object with a `.tsv` property is also accepted defensively). Schema, one entry per line, tab-separated, no header:

```
lemma \t stem(s) \t pos \t gloss
```

- lemma: dictionary form, Unicode NFC, canonical accents (grave → acute); homonyms merged (glosses joined with "; ").
- stem(s): base stem(s) for morphological stripping, variants joined with `|` (e.g. `πόλε|πόλη|πόλ`); form-lemmas keep stem = lemma; proper names use the lemma itself.
- pos: Perseus-style class code (see §7).
- gloss: concise English, 1–3 senses.

Sources and licenses: Perseus Vocabulary Tool (CC BY-SA), DCC Greek Core Vocabulary (CC BY-SA), Middle Liddell (PD) – see `docs/COPYRIGHT.md` §4.

Lookup (engine `dictLookup`), as implemented in Part 2. All keys fold input with `toLowerCase()` first, so capital letters (Ἐν, Σωκράτης, all-caps) match. Indexes are built once at first use, in ~75 ms (owner's staff requirement), then:

1. **Tier A (accent-exact)**: NFC, grave → acute, elision apostrophe trimmed. Only for the rare accent-only homonyms (ἦν/ἤν). Below the lemma keys, editorial keys claim: article obliques, elisions (δι/ὑπ/ἀλλ), οὐκ/οὐχ, the εἰμί family, οἶσθα/οἶδε, φησί/φασίν, γέγονε, the ἔλαβον family.
2. **Tier 0**: accents folded, breathings, subscript iota and diaeresis kept.
3. **Tier 1**: breathings and iota folded too.
4. **Tier 2**: base characters only, only for keys of 2+ base characters (final ς folded to σ everywhere).
5. **Tier 3 (stem stripping)**: candidates = the bare token, plus movable-ν stripped (only after a vowel: πολεσιν), the ἐ- augment stripped, temporal augment (ω → ο, η → ε/α, ει → ι), augment after a preverb (restored or dropped, so κατέλαβεν reaches λαμβάνω both ways), perfect reduplication (λε-λυ-κα). Sigmatic clusters ψ/ξ expand to π/β/φ + σ and κ/γ/χ/σσ + σ. Each candidate is stripped by every ending of the class tables; the remaining stem must hit the stem index, built from the stem column plus derived stems (-μα neuters +τ, -ις minus σ, vowel-final lemmas, -ος/-ον lemmas minus, contract verbs minus their vowel plus the η/ω grades). The entry's POS class gates which tables apply, and gender-class "bad" endings reject impossible readings (a 1st-declension feminine never takes -ου, a neuter never -ας).
   Coverage scoring: stem length + ending length + 2 × augment/reduplication credit, +1 for a verb reading of a subscript-iota token, +1 for the contracted -όω 3 Sg. (δηλοῖ = δηλό-ει). The best coverage wins; on a tie the more frequent lemma wins only if the rank gap is at least 300 rows (TSV order = corpus frequency), otherwise the form is genuinely ambiguous → null (never guess).

Stem claims resolve by rank (λόγος keeps "λογ" over the rare λογάς), lemma keys (tiers A to 2) stay strictly ambiguous. Known limits: stem collisions are rank-decided (documented); ambiguous forms return null (τί/τι, τύποι); a few feminine -ος nouns carry a masculine POS in the TSV, so the gender hint can be wrong while the lemma is right; some -ης adjectives vs nouns are a best-guess POS.

## §6 Morphology (assets/morph.js, Part 2)

`window.SA_MORPH` = `{ exact: {…}, noun12: [[ending, analysis], …], noun3: […], verb: […], sig: […], theta: […], verbMid: […], part: […], perf: […] }` as implemented: eight tables, endings are folded with the same rules as the dictionary keys (final ς → σ).

- **exact**: closed-class forms (articles, familiar pronouns, εἰμί forms; grave/acute variants both indexed). Result confidence **conf 2** (stated without "?").
- **ending tables**: noun12 (1st/2nd declension), noun3 (3rd declension), verb (thematic + contract, incl. the contracted 3 Sg. -οι of -όω verbs), sig (sigmatic aorist/future), theta (-θη aorist passive), verbMid (middle/passive), part (participle), perf (perfect). The entry's POS class gates the table choice; without an entry the noun tables are tried first, then the verb tables (never merged).
- **Invariable**: particle/conjunction/preposition/adverb with a dictionary entry → `invariable`, conf 2.
- Output `{cat, a (analysis string), e (ending), conf}`; **conf 1** guesses carry "?" in both exporters; at most **two** analyses, most likely first (fixed convention).
- Final iota subscript (ῃ/ᾳ/ῳ): Dat. Sg. (noun) or 2nd Sg. present middle/passive (verb) – options by POS class.

## §7 POS codes

| Code | Meaning |
| --- | --- |
| N-1m, N-1f | 1st declension noun, masc./fem. |
| N-2m, N-2f, N-2n | 2nd declension noun |
| N-3m, N-3f, N-3n | 3rd declension noun |
| N-P | proper name |
| N-ART | article |
| ADJ-12 | 1st/2nd declension adjective |
| ADJ-3 | 3rd declension adjective |
| V-1, V-2, V-3 | thematic / contract / -μι verb |
| V-I | irregular verb (εἰμί, εἶπον, οἶδα, φημί, …) |
| PRON-PERS/REFL/DEMO/REL/INTERR/INDEF/POSS/RECIP | pronoun classes |
| ADV, CONJ, PREP, PART, INTERJ, NUM | indeclinables and numerals |

The vocabulary table shows the code as-is (compact, standard); the Guide page explains the abbreviations.

## §8 Fill API + sample corpus (Part 3 data)

`SA_HTML.build(model, fill)` – optional second parameter; without it the frame is blank (§2). Shape:

```
fill = {
  hint: <focus line under the subtitle>,
  tr:   <full natural translation shown in the "Full translation" box>,
  sentences: [ sf per sentence, in order ],
  patterns: [ {ex, rule, tip} × 3 ]
}
sf = {
  fn:  { <tokenKey>: <FN key> },      // sentence function per word block
  form:{ <tokenKey>: <exact analysis, no "?"> },
  gl:  { <tokenKey>: <gloss> },
  chunks: [ [greek, english, notes], … ],
  vtab:   [ [8 cells], … ] | [],      // [] = sentence has no finite verb
  note: <string>, woertlich: <literal translation>, tr: <natural translation>
}
```

**tokenKey**: the token itself for its first occurrence in the sentence, `token#n` for the n-th occurrence (n ≥ 2); grave/acute in the key must match the analysed text. The vocabulary table merges the author `form`/`gl` per token (first occurrence) as the tf fallback.

`data/corpus.js` sets `window.SA_CORPUS = { items: [...] }`, item = `{ id, source, focus, title, subtitle, greek, tr, sentences, patterns }` (+ lesson/section grouping fields as needed); `corpus.html` renders the gallery (lazy iframe `srcdoc` via `SA_HTML.build(model, fill)`, blob download per item). The `.tex` export never receives fill.

## §9 Part 1 scope note

Without `assets/dict.js` + `assets/morph.js` loaded, `SA.dictLookup` and `SA.morphLookup` return null (the engine checks for the data before doing anything) and the exported frames stay blank: graceful behaviour, not a regression. Part 2 ships both files. The exporters already consume the Part 2 entry shape `{lemma, stems, pos, gloss, derived}` and morph shape `{cat, a, e, conf}` so that Part 2 lands without touching them.
