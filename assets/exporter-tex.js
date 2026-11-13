/* satzanalyse – exporter-tex.js
 * Builds the .tex export (XeLaTeX/Overleaf) per FORMAT-SPEC §3:
 * the Satzanalyse canvas preamble 1:1 (macros \w \en \grp \chip and the
 * satz, vtab, steps, ueb, pat environments – macros unchanged) + an English
 * \renewcommand label block. One deliberate deviation from the VN edition,
 * documented in FORMAT-SPEC §3: the header row of the \vtab macro is set in
 * English (Form/Lemma/Person/Number/Tense/Mood/Voice/Subject).
 * Code: MIT License. ES5, no dependencies. */
var SA_TEX = (function () {
  'use strict';

  /* Preamble 1:1 from the canvas format (latex-rahmen). Macros are NOT changed. */
  var PREAMBLE = String.raw`\documentclass[12pt]{article}
\usepackage{fontspec}
\setmainfont{DejaVu Serif}[Scale=0.95]
\setsansfont{DejaVu Sans}[Scale=0.93]
\newfontfamily\gr{FreeSerif}[Scale=1.25]   % analysis line
\newfontfamily\grt{FreeSerif}[Scale=1.12]  % Greek inside sentences/tables: {\grt ...}
\usepackage{xcolor,tabularx,booktabs,array,longtable}
\usepackage[a4paper,margin=2.2cm]{geometry}
\usepackage[most]{tcolorbox}
\setlength{\parindent}{0pt}\setlength{\parskip}{8pt}

% Colours by sentence function (Satzglied)
\definecolor{cPrad}{HTML}{1F5FBF} \definecolor{cSubj}{HTML}{C0392B}
\definecolor{cAkk}{HTML}{1E8449}  \definecolor{cDat}{HTML}{16877A}
\definecolor{cAttr}{HTML}{8E44AD} \definecolor{cPN}{HTML}{D9730D}
\definecolor{cAdv}{HTML}{8A6D1D}  \definecolor{cInf}{HTML}{B03A6F}
\definecolor{cNeg}{HTML}{000000}  \definecolor{cPart}{HTML}{7F8C8D}
\definecolor{cAcIS}{HTML}{E0457B} \definecolor{cApp}{HTML}{2E4A9E}
\definecolor{cKonj}{HTML}{5D6D7E} \definecolor{cVok}{HTML}{4A235A}
\newcommand{\labPrad}{Prädikat}\newcommand{\labSubj}{Subjekt}
\newcommand{\labAkk}{Akk.-Objekt}\newcommand{\labDat}{Dat.-Objekt}
\newcommand{\labAttr}{Attribut}\newcommand{\labPN}{Prädikatsnomen}
\newcommand{\labAdv}{Adverbiale}\newcommand{\labInf}{Infinitiv}
\newcommand{\labNeg}{Negation}\newcommand{\labPart}{Partikel}
\newcommand{\labAcIS}{AcI-Subjekt}\newcommand{\labApp}{Apposition}
\newcommand{\labKonj}{Konjunktion}\newcommand{\labVok}{Vokativ}

% \w{KEY}{Wortblock}{Formbestimmung}: top = function, middle = word, bottom = form
\newcommand{\w}[3]{\begin{tabular}[t]{@{}c@{}}%
{\scriptsize\sffamily\bfseries\color{c#1}\csname lab#1\endcsname}\\[-2pt]%
{\gr\color{c#1}#2}\\[-3pt]%
{\scriptsize\sffamily\color{black!65}#3}\end{tabular}\hspace{0.35em}\allowbreak}
% \en{root}{ending}: ending in bold + underlined
\newcommand{\en}[2]{#1\textbf{\underline{#2}}}
% \grp{colour}{group label}{\w blocks}: frame for AcI (cInf) or subordinate clause (cKonj)
\newcommand{\grp}[3]{\par\vspace{-2pt}\tcbox[on line,colback=#1!5,colframe=#1!55,boxrule=0.5pt,arc=2pt,
  left=3pt,right=1pt,top=1pt,bottom=2pt,boxsep=1pt]{\begin{tabular}[t]{@{}l@{}}
  {\scriptsize\sffamily\itshape\color{#1}#2}\\[-1pt]#3\end{tabular}}\hspace{0.45em}\allowbreak}
\newcommand{\chip}[1]{\textcolor{c#1}{\textbf{\textsf{\small\csname lab#1\endcsname}}}}

% Sentence frame, verb table, seven steps, translation
\newtcolorbox{satz}[1]{breakable,enhanced,colback=white,colframe=cPrad!45,boxrule=0.6pt,arc=2pt,
  left=8pt,right=8pt,top=6pt,bottom=6pt,title={#1},coltitle=black,colbacktitle=cPrad!10,
  fonttitle=\bfseries\sffamily}
\newcommand{\vtab}[1]{{\small\renewcommand{\arraystretch}{1.25}%
\begin{tabularx}{\linewidth}{@{}>{\grt}l l c c c c c >{\raggedright\arraybackslash}X@{}}\toprule
\textrm{\textbf{Form}} & \textbf{Lemma} & \textbf{Pers.} & \textbf{Num.} & \textbf{Tense} & \textbf{Mood} & \textbf{Voice} & \textbf{Subject}\\
\midrule
#1\\\bottomrule\end{tabularx}}}
\newcommand{\steps}[1]{{\small\begin{enumerate}\setlength{\itemsep}{1pt}\setlength{\parskip}{0pt}#1\end{enumerate}}}
\newcommand{\ueb}[2]{\textsf{\small\bfseries Übersetzung}\par
\textit{wörtlich:} #1\par \textit{natürlich:} \textbf{#2}}
\newtcolorbox{pat}[1]{colback=cInf!4,colframe=cInf!45,boxrule=0.5pt,arc=2pt,title={#1},coltitle=black,
  colbacktitle=cInf!10,fonttitle=\bfseries\sffamily\small,left=6pt,right=6pt}`;

  /* English function labels. The macros stay untouched; only the label
   * content is renewed. */
  var LABEL_RENEW = String.raw`% ---- Sentence-function labels: English (satzanalyse) ----
\renewcommand{\labPrad}{Predicate}
\renewcommand{\labSubj}{Subject}
\renewcommand{\labAkk}{Direct object}
\renewcommand{\labDat}{Indirect object}
\renewcommand{\labAttr}{Attribute}
\renewcommand{\labPN}{Predicate nominative}
\renewcommand{\labAdv}{Adverbial}
\renewcommand{\labInf}{Infinitive}
\renewcommand{\labNeg}{Negation}
\renewcommand{\labPart}{Particle}
\renewcommand{\labAcIS}{AcI subject}
\renewcommand{\labApp}{Apposition}
\renewcommand{\labKonj}{Conjunction}
\renewcommand{\labVok}{Vocative}`;

  function esc(s) {
    return String(s).replace(/\\/g, '\\textbackslash{}')
      .replace(/([&%$#_{}])/g, '\\$1')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  /* Chunking ~4 tokens, matching the HTML exporter. */
  function chunk(tokens, size) {
    var out = [], i;
    size = size || 4;
    for (i = 0; i < tokens.length; i += size) out.push(tokens.slice(i, i + size));
    return out;
  }

  function chipsLine() {
    return SA.FN.map(function (f) { return '\\chip{' + f.k + '}'; }).join(' ');
  }

  function origBox(model) {
    var lines = model.sentences.map(function (s) {
      return '(1) '.replace('1', s.n) + '{\\grt ' + esc(s.greek) + '}';
    }).join('\\\\[2pt]\n');
    return '\\begin{satz}{Original text}\n' + lines + '\n\\end{satz}\n';
  }

  function legendBox() {
    return '\\begin{satz}{Legend}\n' + chipsLine() + '\\\\[4pt]\n' +
      'Each word block (\\w) has three layers: sentence function (top) – word (middle) – morphological form (bottom).\\\\\n' +
      'Blank cells = fill them in yourself – the tool never fabricates an analysis. "?" = guessed from an ending, verify it; ' +
      '"invariable" = a particle/conjunction/preposition/adverb that does not decline.\\\\\n' +
      'Sperrstellung (hyphenated attribute position): a genitive between article and noun \\textrightarrow{} three blocks in a row (article | attribute | noun).\\\\\n' +
      'Abbreviations: Sg./Pl. = singular/plural; m./f./n. = masculine/feminine/neuter; Nom./Gen./Dat./Acc./Voc. = nominative/genitive/dative/accusative/vocative; ' +
      '1st/2nd/3rd decl. = declension class; act./mid./pass. = voice.\\\\\n' +
      'Full method description: the Guide page of satzanalyse.\n' +
      '\\end{satz}\n';
  }

  function chunksTable(tokens) {
    var rows = chunk(tokens).map(function (c) {
      return esc(c.join(' ')) + ' & & \\\\';
    }).join('\n');
    return '{\\small\\textbf{Translation by sense groups (how the meanings connect)}}\\par\\smallskip\n' +
      '{\\small\\begin{tabular}{>{\\grt}l l l}\n' + rows + '\n\\end{tabular}}\\par\\medskip\n';
  }

  function vtabHint() {
    return '% (enter the finite verb forms of the sentence: person, number, tense, mood, voice, subject)\n' +
      '\\vtab{ & & & & & & & \\\\}\n';
  }

  function stepsEnv() {
    var items = SA.STEPS.map(function (s) { return '\\item ' + esc(s); }).join('\n');
    return '\\steps{\n' + items + '\n}\n';
  }

  /* Dictionary hints per sentence (comments in the .tex, macros untouched). */
  function dictHintLine(tokens) {
    var hits = [], seen = Object.create(null);
    tokens.forEach(function (t) {
      var e = SA.dictLookup(t);
      if (e && !seen[t]) {
        seen[t] = 1;
        hits.push(t + ' = ' + e.gloss.split(';')[0].split(' / ')[0].trim() +
          ' (' + e.lemma + ')');
      }
    });
    if (!hits.length) return '';
    return '% Dictionary hints (core dictionary; not found = look it up yourself): ' +
      hits.join('; ') + '\n';
  }

  /* Morphology hints per sentence (comments in the .tex, macros untouched). */
  function morphHintLine(tokens) {
    var hits = [], seen = Object.create(null);
    tokens.forEach(function (t) {
      var e = SA.dictLookup(t);
      var m = SA.morphLookup(t, e);
      if (m && !seen[t] && hits.length < 10) {
        seen[t] = 1;
        hits.push(t + ' = ' + m.a + (m.conf < 2 ? ' (suggestion, verify)' : ''));
      }
    });
    if (!hits.length) return '';
    return '% Morphology hints (closed-class forms are certain, the rest are ending guesses): ' +
      hits.join('; ') + '\n';
  }

  function satzBlock(s) {
    var line = '{\\gr ' + s.tokens.map(esc).join(' ') + '}';
    return '\\begin{satz}{Sentence ' + s.n + ' – {\\grt ' + esc(s.greek) + '}}\n' +
      '% Analysis diagram: fill in \\w{KEY}{word block}{form} for each block.\n' +
      '% KEY in {Prad, Subj, Akk, Dat, Attr, PN, Adv, Inf, Neg, Part, AcIS, Konj, App, Vok};\n' +
      '% wrap AcI/subordinate-clause groups in \\grp{cInf}{label}{...} or \\grp{cKonj}{label}{...};\n' +
      '% underline endings with \\en{root}{ending}.\n' +
      dictHintLine(s.tokens) +
      morphHintLine(s.tokens) +
      line + '\\par\\medskip\n' +
      chunksTable(s.tokens) +
      vtabHint() +
      stepsEnv() +
      '{\\small Notes:}\\par\\smallskip\n' +
      '\\ueb{(fill in the literal translation)}{(fill in the natural translation)}\n' +
      '\\end{satz}\n';
  }

  function vocabLongtable(vocab) {
    var rows = vocab.map(function (t) {
      var e = SA.dictLookup(t);
      var m = SA.morphLookup(t, e);
      return '{\\grt ' + esc(t) + '} & ' + (e ? '{\\grt ' + esc(e.lemma) + '}' + (e.derived ? ' (ending stripped)' : '') : '') +
        ' & ' + (e ? esc(e.pos) : '') +
        ' & ' + (m ? esc(m.a) + (m.conf < 2 ? ' ?' : '') : '') +
        ' & ' + (e ? esc(e.gloss) : '') + ' \\\\';
    }).join('\n');
    return '% Core dictionary: columns are pre-filled when a lookup succeeds.\n' +
      '\\begin{longtable}{>{\\grt}l l l l l}\n' +
      '\\textbf{Form in text} & \\textbf{Lemma} & \\textbf{POS} & ' +
      '\\textbf{Suggested form} & \\textbf{Gloss}\\\\\n\\midrule\n' +
      rows + '\n\\end{longtable}\n' +
      '{\\small Blank cells: not found in the core dictionary – look it up and fill it in. ' +
      'Forms that stay ambiguous after accent folding are deliberately left blank. ' +
      '"(ending stripped)" = guessed back to the dictionary (case/personal ending stripped, ἐ- augment removed): the meaning is right but the base form is a suggestion, verify it. ' +
      '"Suggested form" column: guessed from the ending tables; a "?" means verify it.}\n';
  }

  function patternBoxes() {
    var out = [], i;
    for (i = 1; i <= 3; i++) {
      out.push('\\begin{pat}{Pattern ' + i + '}\n' +
        '\\textbf{Example:} \\par\n\\textbf{Rule:} \\par\n\\textbf{Recognition tip:}\n' +
        '\\end{pat}\n');
    }
    return out.join('\n');
  }

  /* Automatic endings table (from the morphology hints; closed-class forms
   * have no ending to strip). */
  function endungenTable(vocab) {
    var seen = Object.create(null), keys = [];
    vocab.forEach(function (t) {
      var e = SA.dictLookup(t);
      var m = SA.morphLookup(t, e);
      if (!m || !m.e) return;
      var k = m.e + '|' + m.a;
      if (!seen[k]) { seen[k] = { e: m.e, a: m.a, ex: [] }; keys.push(k); }
      var ex = seen[k].ex;
      if (ex.indexOf(t) < 0 && ex.length < 3) ex.push(t);
    });
    var rows = keys.slice(0, 12).map(function (k) {
      var r = seen[k];
      return '-' + esc(r.e) + ' & ' + esc(r.a) + ' ? & {\\grt ' + esc(r.ex.join(', ')) + '} \\\\';
    }).join('\n');
    var tail = '';
    if (keys.length === 0) {
      tail = '\\multicolumn{3}{l}{\\small (no ending recognised yet – write down the endings you meet)} \\\\';
    } else if (keys.length > 12) {
      tail = '\\multicolumn{3}{l}{\\small … ' + (keys.length - 12) + ' more endings – add them yourself} \\\\';
    }
    return '% Automatic endings table: every row is a suggestion – verify it.\n' +
      '\\begin{tabular}{l l >{\\grt}l}\n' +
      '\\textbf{Ending} & \\textbf{Identifies} & \\textbf{Examples in text}\\\\\n\\midrule\n' +
      rows + '\n' + tail + '\n\\end{tabular}\n';
  }

  function build(model) {
    var title = model.title || 'Satzanalyse';
    var sub = model.subtitle || 'Ancient Greek sentence analysis';
    var satzBlocks = model.sentences.map(satzBlock).join('\n');

    return PREAMBLE + '\n\n' + LABEL_RENEW + '\n\n' +
      '\\begin{document}\n' +
      '\\begin{center}{\\LARGE ' + esc(title) + '}\\\\{\\large ' + esc(sub) + '}\\end{center}\n\n' +
      '% Frame generated automatically by satzanalyse – the blank cells are for the learner to fill in.\n\n' +
      origBox(model) + '\n' + legendBox() + '\n' +
      '\\clearpage\n\\section*{PART 1 – Sentence-by-sentence analysis}\n\n' +
      satzBlocks + '\n' +
      '\\begin{satz}{Full translation}\n(fill in the translation of the whole text)\n\\end{satz}\n\n' +
      '\\clearpage\n\\section*{PART 2 – Vocabulary and patterns}\n\n' +
      vocabLongtable(model.vocab) + '\n\n' + patternBoxes() + '\n\n' +
      endungenTable(model.vocab) + '\n' +
      '\\end{document}\n';
  }

  return { build: build, esc: esc };
})();
