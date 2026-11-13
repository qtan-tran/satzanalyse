# Contributing to satzanalyse

Thank you for your interest. This repository follows the conventions of the
qtan-tran ecosystem: static, no-build, self-contained, durable.

## Before contributing

- Read `docs/STYLE-AND-CONVENTIONS.md` (language, typography, Greek text
  handling) and `docs/FORMAT-SPEC.md` (output frame specification).
- Content policy in `docs/COPYRIGHT.md`: public domain + original material
  only; never copy adapted content from copyrighted textbooks.
- Do not add dependencies (no framework, no package manager, no CDN) and no
  build step.

## How to contribute

1. Fork, then create a feature branch.
2. Make your changes following the conventions above.
3. QA sweep: no em dash (en dash – is fine), no stray characters
   (CJK/Cyrillic/U+FFFD) in content, Greek apostrophe = ’ (U+2019),
   balanced HTML tags, balanced `{}` and `\begin`/`\end` in sample .tex.
4. Open a pull request describing what changed and why.

## Maintainer workflow

Work is organised in parts according to `docs/ROADMAP.md`; drafts are
reviewed by the owner before every push; every push is verified against the
raw/blob API with the commit SHA.
