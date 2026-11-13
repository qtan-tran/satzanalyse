# STYLE-AND-CONVENTIONS – satzanalyse

> Editorial conventions for every page and document of this repository, inheriting the conventions of the satzanalyse-vn / graecum-vn family. Violating the rules below is a bug to fix before pushing.

## 1. Language

- **English is the interface language** for every explanation, UI label and guide text (this is the global edition; the Vietnamese edition lives in satzanalyse-vn).
- German format names stay where they are proper names of the method: "Satzanalyse" (the product name), "Wortblock" (word block), "Sperrstellung" (hyphenated attribute position) – always introduced with an English gloss on first use per page.
- Standard case names: **Nom. / Gen. / Dat. / Acc. / Voc.** (nominative, genitive, dative, accusative, vocative). Number: Sg./Pl. Gender: m./f./n. Voice: act./mid./pass.
- The .tex export keeps the markers "wörtlich" and "natürlich" (literal / natural translation) because they are part of the canvas format macros; the Guide page explains both.

## 2. Typography & characters

- **En dash (–) only; em dash (U+2014) is forbidden** in all published content.
- Greek apostrophe/elision: **’ (U+2019)** or ʼ (U+02BC); ASCII `'` never appears inside Greek content (ASCII ' is for JS code only).
- No Latin text inside Greek spans rendered with a Greek font (`.gk` in HTML, `{\grt …}` in .tex); annotations like "(nominative)" go outside the Greek span.
- CJK/Cyrillic/U+FFFD replacement characters must not appear in content (historical bug quotes in ROADMAP excepted, per the graecum-vn precedent).

## 3. Greek text

- **100% verbatim**: whatever the user pastes is preserved – accents, capitalisation, apostrophes, stray punctuation.
- The tool normalises the pasted text to Unicode **NFC** once, inside `analyze()`, before sentence splitting; the visible text is otherwise never "corrected" or altered.
- Hand-written corpus content follows the source verification pipeline: public-domain texts only, no invented quotations.

## 4. Page structure

- Every page: "satzanalyse" brand header + navigation (Tool · Guide · Corpus), content, standard attribution footer (see `docs/COPYRIGHT.md` §3).
- Style matches the family palette: serif body font (Palatino/Times), sans headings (system-ui), canvas blue `#1F5FBF`, frame border `#9db8e0`, frame background `#e3ecf8`, the 14 standard function colours.
- Downloadable HTML exports must be **100% self-contained** (inline CSS, no scripts) so they print and open anywhere without losing formatting.

## 5. Code conventions

- Plain ES5-compatible JS (var, function), no modules, no framework; data loads via global variables (`window.SA_DICT`, `window.SA_MORPH`, `window.SA_CORPUS`).
- Code comments in English, using the terminology of §1.
- No fetch() of local data (CORS on file://) – see ARCHITECTURE §3.
- Every JS file must pass: balanced brackets/braces, even ASCII quote counts per string line; all packaged data NFC.

## 6. QA before pushing (mandatory sweep)

1. Grep for em dash, CJK, Cyrillic, U+FFFD, ASCII ' inside Greek content.
2. Balance HTML tags (`<div/` vs `</div>` ...) and `{}`/`\begin`–`\end` in sample .tex.
3. `&` counts per line per FORMAT-SPEC §3 (vtab 7, vocab 4, endings 2, sense groups 2).
4. Verify pushed content via raw.githubusercontent with the commit SHA (stale → blob API).
