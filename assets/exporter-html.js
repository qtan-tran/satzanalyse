/* satzanalyse – exporter-html.js
 * Builds the self-contained static HTML export (no <script>) per
 * FORMAT-SPEC §2: sentence frame, three-layer word-block diagram,
 * sense-group table, verb table, seven steps, Part 2 (vocab ★ / pattern /
 * endings table), print CSS (one sentence per page).
 * Sample corpus fill API (FORMAT-SPEC §8): build(model, fill) takes an
 * optional fill {hint, tr, sentences[], patterns[]} that pre-fills
 * functions/forms/glosses/tables/translations/pattern boxes; without fill
 * the frame is generated blank for the learner.
 * Code: MIT License. ES5, no dependencies. */
var SA_HTML = (function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Default chunking ~4 tokens (the learner regroups by sense). */
  function chunk(tokens, size) {
    var out = [], i;
    size = size || 4;
    for (i = 0; i < tokens.length; i += size) out.push(tokens.slice(i, i + size));
    return out;
  }

  var CSS = [
    ':root{--Prad:#1F5FBF;--Subj:#C0392B;--Akk:#1E8449;--Dat:#16877A;--Attr:#8E44AD;',
    '--PN:#D9730D;--Adv:#8A6D1D;--Inf:#B03A6F;--Neg:#000;--Part:#7F8C8D;',
    '--AcIS:#E0457B;--Konj:#5D6D7E;--App:#2E4A9E;--Vok:#4A235A;--ink:#1a1a1a;}',
    '*{box-sizing:border-box}',
    'body{font-family:\'Palatino Linotype\',\'Book Antiqua\',Palatino,\'Times New Roman\',serif;',
    '     color:var(--ink);background:#eef1f5;margin:0}',
    '.page{max-width:860px;margin:0 auto;background:#fff;padding:34px 40px 60px;',
    '      box-shadow:0 0 14px rgba(0,0,0,.15)}',
    'h1{font-size:24px;text-align:center;margin:6px 0 4px}',
    '.sub{text-align:center;font-size:16px;font-weight:bold;margin:2px 0}',
    '.focus{text-align:center;font-size:13.5px;font-style:italic;margin:2px 0 14px}',
    'h2.sec{font-family:system-ui,Arial,sans-serif;font-size:19px;',
    '      border-bottom:2px solid var(--Prad);padding-bottom:3px;margin:26px 0 12px}',
    '.box{border:1px solid #9db8e0;border-radius:7px;margin:12px 0;background:#fff;overflow:hidden}',
    '.box>.bt{background:#e3ecf8;font:700 13px/1.3 system-ui,Arial,sans-serif;padding:7px 12px;',
    '      border-bottom:1px solid #c5d5ee}',
    '.box>.bb{padding:10px 14px;font-size:15.5px;line-height:1.55}',
    '.orig{line-height:1.75;font-size:17px}',
    '.wb{display:inline-flex;flex-direction:column;align-items:center;vertical-align:top;',
    '    margin:2px 9px 4px 0;text-align:center}',
    '.wb .fn{font:700 10px/1.25 system-ui,Arial,sans-serif;color:var(--c);letter-spacing:.2px}',
    '.wb .word{font-size:21px;line-height:1.25;color:var(--c);white-space:nowrap}',
    '.wb .word u{text-decoration:none;border-bottom:2.5px solid currentColor;font-weight:700}',
    '.wb .form{font:9.5px/1.2 system-ui,Arial,sans-serif;color:#666}',
    '.wb .gl{font:italic 10px/1.25 Georgia,\'Times New Roman\',serif;color:#555;',
    '    max-width:74px;white-space:normal}',
    '.chips{margin:8px 0 4px;line-height:2}',
    '.chip{font:700 12px system-ui,Arial,sans-serif;margin-right:10px;white-space:nowrap}',
    '.star{color:#b8860b}',
    '.satz{border:1px solid #9db8e0;border-radius:7px;margin:16px 0;background:#fff;overflow:hidden}',
    '.satz .head{background:#e3ecf8;font:700 13.5px/1.4 system-ui,Arial,sans-serif;',
    '      padding:8px 12px;border-bottom:1px solid #c5d5ee}',
    '.satz .head .gk{font-family:\'Palatino Linotype\',\'Book Antiqua\',Palatino,serif;font-size:15.5px}',
    '.satz .body{padding:12px 14px 10px}',
    '.diagram{line-height:1.1;margin:4px 0 10px}',
    'table{border-collapse:collapse;width:100%;font-size:13.5px}',
    'th{font-family:system-ui,Arial,sans-serif;font-size:12px;background:#f0f3f8;text-align:left}',
    'th,td{border:1px solid #ccd4e0;padding:4px 7px;vertical-align:top}',
    '.vtab .gk,.vocab .gk,.chunks .gk{font-size:14.5px}',
    '.chunks{margin:6px 0 12px}',
    '.chunks .cap{font:700 13px/1.3 system-ui,Arial,sans-serif;margin:0 0 4px}',
    '.hintcell{color:#777;font-style:italic}',
    '.ueb{background:#f6f8fb;border:1px solid #d7dfeb;border-radius:5px;padding:8px 12px;',
    '     margin-top:10px;font-size:14.5px}',
    '.ueb .lab{font:700 12px system-ui,Arial,sans-serif}',
    '.note{font-size:13px;color:#444;margin-top:8px}',
    'ol.steps{margin:6px 0 2px;padding-left:20px;font-size:13.8px;line-height:1.5}',
    'ol.steps li{margin-bottom:2px}',
    '.vocab td{font-size:12.8px}',
    '.pat{border:1px solid #d3a0bf;border-radius:7px;margin:12px 0;background:#fdf5fa;overflow:hidden}',
    '.pat .pt{background:#f8e3f0;font:700 13px/1.35 system-ui,Arial,sans-serif;padding:6px 12px;',
    '      border-bottom:1px solid #e6c3d8}',
    '.pat .pb{padding:8px 13px;font-size:14.2px;line-height:1.5}',
    '.pat b.q{font-family:system-ui,Arial,sans-serif;font-size:12.8px}',
    '.hint{background:#fff8dc;border:1px solid #e8d9a0;border-radius:6px;padding:8px 12px;',
    '      font-size:13.5px;margin:0 0 14px}',
    'footer.cr{margin-top:30px;border-top:1px solid #ccd4e0;padding-top:10px;font-size:12px;',
    '      color:#444;line-height:1.6;text-align:center}',
    '@media print{',
    '  body{background:#fff}',
    '  .page{box-shadow:none;max-width:none;padding:0}',
    '  .no-print{display:none}',
    '  .satz{page-break-before:always;page-break-inside:avoid}',
    '  .satz:first-of-type{page-break-before:auto}',
    '  .wb{page-break-inside:avoid}',
    '}'
  ].join('\n');

  function chipRow() {
    return SA.FN.map(function (f) {
      return '<span class="chip" style="color:' + SA.COLORS[f.k] + '">' +
        f.en + '</span>';
    }).join('') + '<br>';
  }

  /* Short gloss for a word block: first sense (before ";"), cut to ~24 chars. */
  function shortGloss(gloss) {
    var g = String(gloss).split(';')[0].split(' / ')[0].trim();
    if (g.length > 24) g = g.slice(0, 24).replace(/\s+\S*$/, '') + '…';
    return g;
  }

  /* Morphology cell: closed-class hits are stated plainly; ending guesses
   * get a "?" for verification; no guess keeps "(form?)". */
  function formText(m) {
    if (!m) return '(form?)';
    return esc(m.a) + (m.conf < 2 ? ' ?' : '');
  }

  /* Word block for the sample corpus (FORMAT-SPEC §8): sf = per-sentence
   * fill; can pre-set fn (function), form (exact analysis, no "?"),
   * gl (gloss). The n-th occurrence (n >= 2) of a token in a sentence is
   * addressed by the key "token#n", the first occurrence by the token. */
  function fnByKey(k) {
    for (var i = 0; i < SA.FN.length; i++) if (SA.FN[i].k === k) return SA.FN[i];
    return null;
  }

  function wbBlock(token, sf, counts) {
    counts[token] = (counts[token] || 0) + 1;
    var key = counts[token] === 1 ? token : token + '#' + counts[token];
    var e = SA.dictLookup(token);
    var m = SA.morphLookup(token, e);
    var fnRec = sf && sf.fn ? fnByKey(sf.fn[key]) : null;
    var color = fnRec ? SA.COLORS[fnRec.k] : '#777';
    var gl = sf && sf.gl && sf.gl[key] !== undefined ? String(sf.gl[key]) :
      (e ? shortGloss(e.gloss) : '');
    var formTx = sf && sf.form && sf.form[key] !== undefined ?
      esc(sf.form[key]) : formText(m);
    return '<span class="wb" style="--c:' + color + '">' +
      '<span class="fn">' + (fnRec ? esc(fnRec.en) : '…') + '</span>' +
      '<span class="word">' + esc(token) + '</span>' +
      (gl ? '<span class="gl">' + esc(gl) + '</span>' : '') +
      '<span class="form">' + formTx + '</span></span>';
  }

  function diagram(tokens, sf) {
    var counts = Object.create(null);
    return '<div class="diagram">' + tokens.map(function (t) {
      return wbBlock(t, sf, counts);
    }).join('') + '</div>';
  }

  function chunksTable(tokens, sf) {
    var rows;
    if (sf && sf.chunks) {
      rows = sf.chunks.map(function (c) {
        return '<tr><td class="gk">' + esc(c[0]) + '</td><td>' + esc(c[1]) +
          '</td><td>' + esc(c[2]) + '</td></tr>';
      }).join('');
    } else {
      rows = chunk(tokens).map(function (c) {
        return '<tr><td class="gk">' + esc(c.join(' ')) + '</td><td></td><td></td></tr>';
      }).join('');
    }
    return '<table class="chunks"><caption class="cap">Translation by sense groups (how the meanings connect)</caption>' +
      '<tr><th>Greek phrase</th><th>English</th><th>Notes</th></tr>' + rows + '</table>';
  }

  function vtab(sf) {
    var rows, hint;
    if (sf && sf.vtab && sf.vtab.length) {
      rows = sf.vtab.map(function (r) {
        return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('');
    } else if (sf && sf.vtab) {
      rows = '<tr><td colspan="8" class="hintcell">(this sentence has no finite verb form – check for an ellipsis)</td></tr>';
    } else {
      rows = '<tr><td colspan="8" class="hintcell">(enter the finite verb forms of this sentence here)</td></tr>';
    }
    return '<table class="vtab">' +
      '<tr><th>Form</th><th>Lemma</th><th>Person</th><th>Number</th><th>Tense</th><th>Mood</th>' +
      '<th>Voice</th><th>Subject</th></tr>' + rows +
      '</table>';
  }

  function stepsList() {
    return '<ol class="steps">' +
      SA.STEPS.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
      '</ol>';
  }

  function uebBox(sf) {
    var w = sf && sf.woertlich !== undefined ? esc(sf.woertlich) : '';
    var n = sf && sf.tr !== undefined ? esc(sf.tr) : '';
    return '<div class="ueb"><span class="lab">Translation</span><br>' +
      '<em>literal (wörtlich):</em> ' + w + ' <br><em>natural (natürlich):</em> <b>' + n + '</b></div>';
  }

  function satzBlock(s, sf) {
    return '<div class="satz"><div class="head">Sentence ' + s.n +
      ' – <span class="gk">' + esc(s.greek) + '</span></div><div class="body">' +
      diagram(s.tokens, sf) + chunksTable(s.tokens, sf) + vtab(sf) + stepsList() +
      '<p class="note">Notes: ' + (sf && sf.note ? esc(sf.note) : '') + '</p>' +
      uebBox(sf) + '</div></div>';
  }

  /* Vocabulary table; with a sample corpus (tf = author form + gloss per
   * first-occurrence token) the "Suggested form" column follows the author
   * analysis (no "?") and the gloss falls back to the author's. */
  function vocabTable(vocab, tf) {
    var rows = vocab.map(function (t) {
      var e = SA.dictLookup(t);
      var m = SA.morphLookup(t, e);
      var formTx = tf && tf.form[t] !== undefined ? esc(tf.form[t]) : formText(m);
      var glTx = e ? esc(e.gloss) : (tf && tf.gl[t] !== undefined ? esc(tf.gl[t]) : '');
      return '<tr><td class="gk">' + esc(t) + '</td><td>' +
        (e ? esc(e.lemma) + (e.derived ? ' (ending stripped)' : '') : '') + '</td><td>' + (e ? esc(e.pos) : '') +
        '</td><td>' + formTx +
        '</td><td>' + glTx + '</td><td class="star">' + (e ? '★' : '') + '</td></tr>';
    }).join('');
    return '<table class="vocab">' +
      '<tr><th>Form in text</th><th>Lemma</th><th>POS</th>' +
      '<th>Suggested form</th><th>Gloss</th><th>★</th></tr>' + rows + '</table>' +
      '<p class="note">★ = found in the core dictionary. Blank cells = not found: look it up and fill it in yourself. ' +
      '"(ending stripped)" = guessed back to the dictionary by stripping an ending – verify it. "?" = guessed from the ending table – verify it.</p>';
  }

  /* Pattern box: no fill → empty exercise boxes; with fill (sample corpus)
   * → pre-filled Example / Rule / Recognition tip. */
  function patternBox(n, p) {
    if (p) {
      return '<div class="pat"><div class="pt">Pattern ' + n + '</div><div class="pb">' +
      '<b class="q">Example:</b> ' + esc(p.ex || '') + '<br>' +
      '<b class="q">Rule:</b> ' + esc(p.rule || '') + '<br>' +
      '<b class="q">Recognition tip:</b> ' + esc(p.tip || '') +
      '</div></div>';
    }
    return '<div class="pat"><div class="pt">Pattern ' + n + '</div><div class="pb">' +
      '<b class="q">Example:</b> <br><b class="q">Rule:</b> <br><b class="q">Recognition tip:</b> ' +
      '</div></div>';
  }

  /* Automatic endings table: one row per recognised ending (ending,
   * analysis, examples). Closed-class forms (articles, familiar pronouns,
   * εἰμί) have no ending to strip, so they do not appear here; max 12 rows,
   * the rest is for the learner to add. */
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
      return '<tr><td>-' + esc(r.e) + '</td><td>' + esc(r.a) +
        ' ?</td><td class="gk">' + esc(r.ex.join(', ')) + '</td></tr>';
    }).join('');
    var tail = '';
    if (keys.length === 0) {
      tail = '<tr><td colspan="3" class="hintcell">(no ending recognised yet – write down the endings you meet)</td></tr>';
    } else if (keys.length > 12) {
      tail = '<tr><td colspan="3" class="hintcell">… ' + (keys.length - 12) +
        ' more endings – add them yourself following the pattern above</td></tr>';
    }
    return '<table><tr><th>Ending</th><th>Identifies</th><th>Examples in text</th></tr>' +
      rows + tail + '</table>' +
      '<p class="note">Every row is a suggestion – verify it. Closed-class forms and indeclinable words have no ending, so they never appear in this table.</p>';
  }

  /* build(model, fill): optional sample-corpus fill (FORMAT-SPEC §8):
   * { hint, tr, sentences: [sf per sentence in order] }. Without fill the
   * frame is blank for the learner, as specified in §2. */
  function build(model, fill) {
    var title = model.title || 'Satzanalyse';
    var sub = model.subtitle || 'Ancient Greek sentence analysis';
    var orig = model.sentences.map(function (s) {
      return '(' + s.n + ') <span class="gk">' + esc(s.greek) + '</span>';
    }).join('<br>');

    var satz = model.sentences.map(function (s, i) {
      return satzBlock(s, fill && fill.sentences ? fill.sentences[i] : null);
    }).join('\n');
    var fillPats = fill && fill.patterns ? fill.patterns : [];
    var pats = [0, 1, 2].map(function (i) {
      return patternBox(i + 1, fillPats[i]);
    }).join('\n');
    var focus = fill && fill.hint ? esc(fill.hint) :
      'Frame generated automatically by satzanalyse – the blank cells are yours to fill in';
    var fullTr = fill && fill.tr ? esc(fill.tr) : '';

    /* tf: author form + gloss for the first occurrence of each token (vocab table). */
    var tf = null;
    if (fill && fill.sentences) {
      tf = { form: Object.create(null), gl: Object.create(null) };
      model.sentences.forEach(function (s, i) {
        var sf = fill.sentences[i];
        if (!sf) return;
        s.tokens.forEach(function (t) {
          if (tf.form[t] === undefined && sf.form && sf.form[t] !== undefined) {
            tf.form[t] = sf.form[t];
          }
          if (tf.gl[t] === undefined && sf.gl && sf.gl[t] !== undefined) {
            tf.gl[t] = sf.gl[t];
          }
        });
      });
    }

    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + esc(title) + '</title>\n<style>\n' + CSS + '\n</style>\n</head>\n<body>\n' +
      '<div class="page">\n' +
      '<div class="hint no-print">Print to PDF: <b>Ctrl/Cmd+P → Save as PDF</b> (one sentence per page). The matching .tex file compiles via XeLaTeX (see the Guide page).</div>\n' +
      '<h1>' + esc(title) + '</h1>\n<div class="sub">' + esc(sub) + '</div>\n' +
      '<div class="focus">' + focus + '</div>\n' +
      '<div class="box"><div class="bt">Original text</div><div class="bb orig">' + orig + '</div></div>\n' +
      '<div class="box"><div class="bt">Legend</div><div class="bb">' + chipRow() +
      'Each word block has three layers: <b>sentence function</b> (top) – <b>word</b> (middle) – <b>morphological form</b> (bottom).<br>' +
      'Blank cells = fill them in yourself – the tool never fabricates an analysis. "?" = guessed from an ending, verify it; ' +
      '"invariable" = a particle/conjunction/preposition/adverb that does not decline.<br>' +
      'Sperrstellung (hyphenated attribute position): a genitive between article and noun → three blocks in a row (article | attribute | noun).<br>' +
      'Abbreviations: Sg./Pl. = singular/plural; m./f./n. = masculine/feminine/neuter; Nom./Gen./Dat./Acc./Voc. = nominative/genitive/dative/accusative/vocative; ' +
      '1st/2nd/3rd decl. = declension class; act./mid./pass. = voice.<br>' +
      'Full method description: the Guide page of satzanalyse.</div></div>\n' +
      '<h2 class="sec">PART 1 – Sentence-by-sentence analysis</h2>\n' +
      satz + '\n' +
      '<div class="box"><div class="bt">Full translation</div><div class="bb">' + fullTr + '</div></div>\n' +
      '<h2 class="sec">PART 2 – Vocabulary and patterns</h2>\n' +
      vocabTable(model.vocab, tf) + '\n' + pats + '\n' +
      '<h3 style="font-family:system-ui,Arial,sans-serif;font-size:15.5px;margin:18px 0 8px">' +
      'Endings table</h3>\n' + endungenTable(model.vocab) + '\n' +
      '<footer class="cr">satzanalyse · Compiled by Quoc-Tan Tran · Content CC BY-SA 4.0 · Code MIT<br>' +
      'When citing or reusing: "satzanalyse – Quoc-Tan Tran, ' +
      'https://github.com/qtan-tran/satzanalyse"</footer>\n' +
      '</div>\n</body>\n</html>\n';
  }

  return { build: build, esc: esc };
})();
