# COPYRIGHT & LICENSE – satzanalyse

## 1. Two-layer license (qtan-tran organisation convention)

- **Code** (HTML/JS/CSS of the tool, engine, exporters): **MIT License** – see `LICENSE`.
- **Content** (docs, specifications, analysis frames, sample corpus, illustration tables): **Creative Commons BY-SA 4.0** – https://creativecommons.org/licenses/by-sa/4.0/

## 2. Content policy (condition of existence for this repository)

Only two kinds of source material are used:

1. **Public domain**: ancient Greek texts (Perseus/Scaife/PHI/Theoi...), public-domain reference grammar (Smyth), catalogues of grammatical facts.
2. **Original**: every analysis frame, pattern box, ending table and guide text compiled by the owner.

Never: copying adapted text, exercises, translations or analyses from any copyrighted textbook; hosting scans; leaking a compiled source (textbook/school/instructor names) into published content. The sample corpus (Part 3) draws only on public-domain texts (John's Gospel, Xenophon).

## 3. Attribution (required when citing or reusing)

Three parts: **author** / **project + repository link** / **license**.

> When citing or reusing, credit: "satzanalyse – Quoc-Tan Tran, https://github.com/qtan-tran/satzanalyse, CC BY-SA 4.0 (content) + MIT (code)".

Standard affiliation line in the README:

> This repository is developed and maintained by **Quoc-Tan Tran**, **Postdoctoral Researcher** at the **Institute for Studies of Science, Bielefeld University**.

Standard footer for every page of the site:

```
satzanalyse · Compiled by Quoc-Tan Tran · Content CC BY-SA 4.0 · Code MIT
When citing or reusing, credit: "satzanalyse – Quoc-Tan Tran, https://github.com/qtan-tran/satzanalyse"
```

## 4. Dictionary and packaged data

`assets/dict.js` (Part 2) packages the **core dictionary of 6,207 classical Greek words**, compiled from three open sources:

| Source | Contribution | License |
| --- | --- | --- |
| Perseus Vocabulary Tool (vocab.perseus.org) | lemma inventory, short definitions, frequency ranking | CC BY-SA |
| DCC Greek Core Vocabulary (Dickinson College Commentaries) | 500 editorially curated core words: glosses, gender, POS | CC BY-SA |
| Middle Liddell (Middle Liddell TEI export) | genitive endings, grammatical gender, gloss fallback | Public domain |

The dictionary file (`lemma \t stem(s) \t pos \t gloss` per line) is a derivative data compilation: lemma forms and glosses derive from these sources, so `assets/dict.js` is published under **CC BY-SA 4.0**, consistent with its inputs, with attribution in the file header comment and in this section. The build script (`build_greek_dict.py`) that compiles it from the three sources is kept outside the site data and documented separately; the compiled `assets/dict.js` in this repository is the single packaged artifact.

- `assets/morph.js` (Part 2): the closed-class form table and the ending tables are **entirely original**, compiled from standard Greek grammar (inflection endings are grammatical facts, not a creative work). Published as CC BY-SA 4.0 with the content layer, independent of external sources.
- `data/corpus.js` (Part 3): sample sentences from **public-domain texts** (John's Gospel, Xenophon) with hand analyses **compiled for this project**. Published as CC BY-SA 4.0 with the content layer.

Note: the general rule in §2 ("never leak a compiled source's name") applies to regular published content (frames, patterns, corpus); the dictionary sources in this section are the deliberate, transparently attributed exception.
