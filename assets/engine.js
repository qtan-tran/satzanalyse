/* satzanalyse – engine.js
 * Ancient Greek text engine: sentence splitting (Satz) + word-block
 * tokenisation. Philosophy: NEVER FABRICATE ANALYSIS – the tool only
 * produces a predetermined frame; anything it cannot determine is left
 * blank for the learner to fill in.
 * Dictionary (Part 2, assets/dict.js, optional): a lookup hit pre-fills the
 * gloss; a miss or an ambiguous form stays blank – no guessing.
 * Morphology hints (Part 2, assets/morph.js, optional): closed-class forms
 * are certain; ending guesses are marked with "?" for the learner to verify.
 * Code: MIT License. ES5, no dependencies, runs fully client-side. */
var SA = (function () {
  'use strict';

  /* Input threshold per paste run (fixed by the owner, shown in UI + docs). */
  var LIMIT = 1500;

  /* 14 sentence functions: keys match the LaTeX macros (\labKEY), labels in
   * English. Standard colours shared by the tool UI, the exported HTML and
   * the .tex canvas format. */
  var FN = [
    { k: 'Prad', en: 'predicate' },
    { k: 'Subj', en: 'subject' },
    { k: 'Akk', en: 'direct object (acc.)' },
    { k: 'Dat', en: 'indirect object (dat.)' },
    { k: 'Attr', en: 'attribute' },
    { k: 'PN', en: 'predicate nominative' },
    { k: 'Adv', en: 'adverbial' },
    { k: 'Inf', en: 'infinitive' },
    { k: 'Neg', en: 'negation' },
    { k: 'Part', en: 'particle' },
    { k: 'AcIS', en: 'AcI subject' },
    { k: 'Konj', en: 'conjunction' },
    { k: 'App', en: 'apposition' },
    { k: 'Vok', en: 'vocative' }
  ];
  var COLORS = {
    Prad: '#1F5FBF', Subj: '#C0392B', Akk: '#1E8449', Dat: '#16877A',
    Attr: '#8E44AD', PN: '#D9730D', Adv: '#8A6D1D', Inf: '#B03A6F',
    Neg: '#000000', Part: '#7F8C8D', AcIS: '#E0457B', Konj: '#5D6D7E',
    App: '#2E4A9E', Vok: '#4A235A'
  };

  /* The seven analysis steps – pre-filled as method prompts (FORMAT-SPEC §4). */
  var STEPS = [
    'Find every finite verb form. If there is no predicate, check for an ellipsis (usually ἐστί(ν)/εἰσί(ν)).',
    'Determine the subject of each verb. If the subject is not written out, it is inside the verb ending (e.g. -ω = 1st person singular); do not draw a separate subject box.',
    'Group words into blocks (Wortblock) via article + ending. A genitive between article and noun (Sperrstellung, hyphenated attribute position) makes three blocks in a row: article | genitive attribute | noun.',
    'Note the government (case government) of each verb and the case required by each preposition.',
    'Look for infinitives and check for an AcI (accusativus cum infinitivo). With several accusatives in an AcI, separate subject and object by meaning, position, article and context.',
    'Negation (οὐ/οὐκ/οὐχ, μή): what exactly does it negate?',
    'Translate: literal version (wörtlich), then natural version (natürlich).'
  ];

  var GREEK_CHAR = /[\u0370-\u03FF\u1F00-\u1FFF]/;
  /* A token is a run of Greek characters plus elision apostrophes
   * (’ U+2019, ʼ U+02BC, ASCII '), and must contain at least one Greek char. */
  var RAW_RE = /[\u0370-\u03FF\u1F00-\u1FFF\u2019\u02BC']+/g;

  /* Sentence split: cut after . · ; ! and newlines, but only when the next
   * character is whitespace or the end of the text.
   * (; is the Greek question mark, · the Greek semicolon.) */
  function splitSentences(text) {
    var out = [], buf = '', i, n = text.length, ch, nxt;
    for (i = 0; i < n; i++) {
      ch = text.charAt(i);
      buf += ch;
      if (ch === '.' || ch === '·' || ch === ';' || ch === '!' || ch === '\n') {
        nxt = i + 1 < n ? text.charAt(i + 1) : '';
        if (nxt === '' || /\s/.test(nxt)) { out.push(buf); buf = ''; }
      }
    }
    if (buf.trim()) out.push(buf);
    return out;
  }

  /* Tokenise one sentence into candidate word blocks. */
  function tokenize(sentence) {
    var toks = [], words = sentence.split(/\s+/), w, m, j;
    for (w = 0; w < words.length; w++) {
      RAW_RE.lastIndex = 0;
      m = words[w].match(RAW_RE);
      if (!m) continue;
      for (j = 0; j < m.length; j++) {
        if (m[j] && GREEK_CHAR.test(m[j])) toks.push(m[j]);
      }
    }
    return toks;
  }

  /* ---- Dictionary + morphology hooks (Part 2) -----------------------------
   * assets/dict.js (window.SA_DICT) and assets/morph.js (window.SA_MORPH)
   * are loaded via <script> BEFORE engine.js. Tiered lookup, ported and
   * extended from the satzanalyse-vn engine:
   *   tier 0 – exact key: accents dropped, breathings/iota kept
   *   tier 1 – key 0 minus breathings, subscript iota, diaeresis
   *   tier 2 – bare letters (accent-folded), gate: >= 2 base letters
   *   tier 3 – endings stripped (derived entry, marked "ending stripped")
   * An ambiguous key at any tier yields null – never a guess (philosophy).
   * SA_DICT may be a plain TSV string or an object with a .tsv property. */

  function dictRaw() {
    var d = window.SA_DICT;
    if (!d) return '';
    return typeof d === 'string' ? d : (d.tsv || '');
  }

  /* ---- Unicode keys ------------------------------------------------------
   * All keys are NFD-folded so decomposed (NFD) input matches NFC input.
   * keyA keeps accents (grave normalised to acute) – tier 0.5 for the rare
   * accent-only homonyms (ἦν/ἤν); key0 drops accents but keeps breathings,
   * subscript iota and diaeresis (so ἤ/ἦ/ἥ stay distinct); key1 drops
   * those too; key2/bk keeps only letters (final ς normalised to σ). */
  var ACC = /[\u0300\u0301\u0302\u0311\u0340\u0341\u0342\u030C\u0304\u0306]/g;
  var BREATH = /[\u0313\u0314\u0345\u0308]/g;
  var MARKS = /[\u0300-\u036F]/g;
  function nfd(s) { return String(s).toLowerCase().normalize('NFD'); }
  function keyA(s) { return nfd(s).replace(/\u0300/g, '\u0301').replace(/[\u2019\u02BC']+$/, '').replace(/ς/g, 'σ'); }
  function key0(s) { return keyA(s).replace(ACC, ''); }
  function key1(s) { return key0(s).replace(BREATH, ''); }
  function bk(s) { return nfd(s).replace(MARKS, '').replace(/[\u2019\u02BC']+$/, '').replace(/ς/g, 'σ'); }

  var VOWELS = 'αεηιουω';
  function isV(ch) { return VOWELS.indexOf(ch) >= 0; }

  /* Preverbs (accent-folded) for augment reconstruction: after a preverb the
   * augment epsilon may sit (κατέ-βασις? -> ἐπέ-τρεπον style) or the preverb
   * vowel itself is lengthened (κατέλυσε <- κατα + ε + λυσε). */
  var PREVERBS = ['προσ', 'υπερ', 'αντι', 'αμφι', 'περι', 'κατα', 'παρα',
    'μετα', 'δια', 'επι', 'υπο', 'απο', 'ανα', 'συν', 'προ', 'εισ',
    'εκ', 'εν', 'δυσ'];
  var TEMPORAL = [['ω', 'ο'], ['η', 'ε'], ['η', 'α'], ['ει', 'ι'], ['ευ', 'ευ']];

  /* Editorial form keys (claim below lemma keys): high-frequency irregular
   * forms the ending rules cannot rebuild. Value = lemma in the dictionary. */
  var EXACT_EXTRA = {
    /* article oblique forms -> the article lemma (ὁ) */
    'τόν': 'ὁ', 'τοῦ': 'ὁ', 'τῷ': 'ὁ', 'τό': 'ὁ', 'οἱ': 'ὁ',
    'τούς': 'ὁ', 'τοῖς': 'ὁ', 'τῶν': 'ὁ', 'τήν': 'ὁ', 'τῆς': 'ὁ',
    'τῇ': 'ὁ', 'αἱ': 'ὁ', 'τάς': 'ὁ', 'ταῖς': 'ὁ', 'τά': 'ὁ',
    /* elisions, proclitic variants and the neuter αὐτό */
    'ἡ': 'ὁ', 'αὐτό': 'αὐτός',
    'δι’': 'διά', 'ὑπ’': 'ὑπό', 'ἐπ’': 'ἐπί', 'ἀπ’': 'ἀπό',
    'ἐξ’': 'ἐκ', 'ἀλλ’': 'ἀλλά', 'μετ’': 'μετά', 'παρ’': 'παρά',
    'κατ’': 'κατά', 'οὐκ': 'οὐ', 'οὐχ': 'οὐ',
    /* λαμβάνω second aorist (stems λαβ/λημ missing from the TSV) */
    'ἔλαβον': 'λαμβάνω', 'ἔλαβες': 'λαμβάνω', 'ἔλαβεν': 'λαμβάνω',
    'ἔλαβομεν': 'λαμβάνω', 'ἔλαβετε': 'λαμβάνω', 'ἐλάβομεν': 'λαμβάνω',
    'λαβεῖν': 'λαμβάνω', 'λαβέ': 'λαμβάνω', 'λάβε': 'λαμβάνω',
    'λαβών': 'λαμβάνω', 'λαβούσα': 'λαμβάνω', 'λαβόν': 'λαμβάνω',
    'ἦ': 'εἰμί', 'ἦς': 'εἰμί', 'ἦν': 'εἰμί', 'ἦμεν': 'εἰμί', 'ἦτε': 'εἰμί',
    'ἦσαν': 'εἰμί', 'ἐστί': 'εἰμί', 'ἐστίν': 'εἰμί', 'εἰσί': 'εἰμί',
    'εἰσίν': 'εἰμί', 'ἔσομαι': 'εἰμί', 'ἔσῃ': 'εἰμί', 'ἐσόμεθα': 'εἰμί',
    'ἔσεσθε': 'εἰμί', 'ἔσονται': 'εἰμί',
    'οἶσθα': 'οἶδα', 'οἶδε': 'οἶδα',
    'φησί': 'φημί', 'φασί': 'φημί', 'φασίν': 'φημί',
    'γέγονε': 'γίγνομαι'
  };

  /* ---- index ------------------------------------------------------------ */
  var READY = false, ENTRIES = [], BY_LEMMA = {}, IDXA, IDX0, IDX1, IDX2;
  var STEM_N, STEM_V, STEM_VM, AMB = {};
  var CACHE_DICT = {}, CACHE_MORPH = {}, MDEX = null;

  function claim(idx, k, e) {
    if (idx[k] === undefined) idx[k] = e;
    else if (idx[k] && idx[k].lemma !== e.lemma) idx[k] = AMB;
  }
  function claimIfFree(idx, k, e) {
    if (idx[k] === undefined) idx[k] = e;
  }
  /* Stem claims resolve by frequency instead of going AMB: the TSV is
   * sorted by corpus frequency (rank = row order), so when two entries
   * share a folded stem the more frequent lemma wins - e.g. λόγος keeps
   * "λογ" over the rare λογάς. Lemma keys (tier 0-2) stay strictly AMB:
   * a wrong lemma guess is worse than no hit (philosophy). */
  function stemClaim(idx, k, e) {
    var c = idx[k];
    if (c === undefined || (c !== AMB && c.lemma !== e.lemma && e.rank < c.rank)) {
      idx[k] = e;
    }
  }

  /* Ending tables allowed for tier 3, per part of speech (kept on the
   * entry as e.cls), plus endings that are impossible for the entry's
   * gender/class (e.bad). This is the validation that keeps a neuter
   * -μα noun from claiming "λε-λυ-κα" as 1st declension feminine. */
  var T_NOUN12 = ['noun12'], T_NOUN3 = ['noun3'],
      T_NOUN_ALL = ['noun12', 'noun3'],
      T_VERB = ['verb', 'sig', 'theta', 'verbMid', 'part', 'perf'],
      T_ALL = T_NOUN_ALL.concat(T_VERB);
  function classOf(pos) {
    if (pos === 'N-1f') return { cls: T_NOUN12, bad: ['οσ', 'ου', 'οι', 'οισ', 'ον', 'ε', 'ωσ', 'εισ', 'ουσ', 'ω'] };
    if (pos === 'N-1m') return { cls: T_NOUN12, bad: '' };
    if (pos === 'N-2f') return { cls: T_NOUN12, bad: '' };
    if (pos === 'N-2m') {
      return { cls: T_NOUN12, bad: ['η', 'ησ', 'α', 'αι', 'αισ', 'ασ'] };
    }
    if (pos === 'N-2n') {
      return { cls: T_NOUN12, bad: ['η', 'ησ', 'αι', 'αισ', 'ασ'] };
    }
    if (pos === 'N-3m') return { cls: T_NOUN3, bad: ['ιν'] };
    if (pos === 'N-3n') return { cls: T_NOUN3, bad: ['ασ', 'ιν', 'εισ', 'ησ', 'ωσ'] };
    if (pos === 'N-3f') return { cls: T_NOUN3, bad: '' };
    if (pos === 'ADJ-12') return { cls: T_NOUN12, bad: '' };
    if (pos === 'ADJ-3') return { cls: T_NOUN3, bad: ['ιν'] };
    if (/^N-/.test(pos)) return { cls: T_NOUN_ALL, bad: '' }; /* N-P etc. */
    if (/^V-/.test(pos)) return { cls: T_VERB, bad: '' };
    if (/^(PRON|NUM)/.test(pos)) return { cls: T_NOUN_ALL, bad: '' };
    return { cls: T_ALL, bad: '' };
  }
  /* Present-only endings: never combine with an augment-stripped
   * candidate (an augmented form is past-tense by definition). */
  var PRESENT_ONLY = { 'ουσιν': 1, 'ουσι': 1, 'ουμεν': 1, 'ετε': 1,
    'εισ': 1, 'ει': 1, 'ω': 1, 'ομαι': 1, 'εται': 1, 'ονται': 1,
    'ομεθα': 1, 'ειν': 1 };

  function indexEntry(e) {
    var co = classOf(e.pos);
    e.cls = co.cls;
    e.bad = co.bad;
    var noun = co.cls !== T_ALL && co.cls[0] !== T_VERB[0] &&
      (/^(N-|ADJ|PRON|NUM)/.test(e.pos) && e.pos !== 'N-ART');
    var verb = /^V-/.test(e.pos);
    var med = /μαι$/.test(bk(e.lemma));
    e.med = med;
    e.stems.forEach(function (s) {
      var k = bk(s);
      if (noun) stemClaim(STEM_N, k, e);
      if (verb) {
        stemClaim(STEM_V, k, e);
        if (med) stemClaim(STEM_VM, k, e);
      }
    });
    if (!noun && !verb) return;
    var bl = bk(e.lemma);
    /* -μα neuters (σῶμα, πρᾶγμα, δέρμα) add the syncopated stem +τ
     * (σωματ-, πραγματ-) for their true 3rd-declension forms. */
    if (noun && /μα$/.test(bl)) stemClaim(STEM_N, bl + 'τ', e);
    /* -ις nouns keep the stem with the final sigma dropped (πολισ ->
     * πολι), so πόλιν resolves over the similar stem of πολύς. */
    if (noun && /ισ$/.test(bl)) stemClaim(STEM_N, bl.slice(0, -1), e);
    /* Vowel-final noun lemmas index the lemma body itself (γῆ -> "γη"),
     * covering movable-ν forms like γῆν. */
    if (noun && isV(bl.charAt(bl.length - 1))) stemClaim(STEM_N, bl, e);
    /* Lemmas whose stems column just repeats the lemma (αὐτός, and many
     * pronouns/adjectives) index the -ος/-ον stripped body as a stem, so
     * oblique cases (αὐτοῦ, αὐτῷ) can claim them back. */
    if (noun && /οσ$/.test(bl)) stemClaim(STEM_N, bl.slice(0, -2), e);
    if (noun && /ον$/.test(bl)) stemClaim(STEM_N, bl.slice(0, -2), e);
    /* Contract verbs: index the stem minus its final vowel (τιμα -> τιμ)
     * and the lengthened grades (τιμη, τιμω) for contracted endings. */
    if (verb) {
      e.stems.forEach(function (s) {
        var k = bk(s);
        if (k.length > 1 && isV(k.charAt(k.length - 1))) {
          stemClaim(STEM_V, k.slice(0, -1), e);
          stemClaim(STEM_V, k.slice(0, -1) + 'η', e);
          stemClaim(STEM_V, k.slice(0, -1) + 'ω', e);
          if (med) stemClaim(STEM_VM, k.slice(0, -1), e);
        }
      });
    }
  }

  function ensure() {
    if (READY) return;
    READY = true;
    IDXA = Object.create(null); IDX0 = Object.create(null);
    IDX1 = Object.create(null); IDX2 = Object.create(null);
    BY_LEMMA = Object.create(null);
    STEM_N = Object.create(null); STEM_V = Object.create(null);
    STEM_VM = Object.create(null); ENTRIES = [];
    var raw = dictRaw();
    if (!raw) return;
    raw.split('\n').forEach(function (line) {
      if (!line) return;
      var c = line.split('\t');
      if (c.length !== 4) return;
      var e = { lemma: c[0], stems: c[1].split('|'), pos: c[2], gloss: c[3], derived: false, rank: ENTRIES.length };
      ENTRIES.push(e);
      BY_LEMMA[e.lemma] = e;
      claim(IDXA, keyA(e.lemma), e);
      claim(IDX0, key0(e.lemma), e);
      claim(IDX1, key1(e.lemma), e);
      claim(IDX2, bk(e.lemma), e);
      indexEntry(e);
    });
    for (var f in EXACT_EXTRA) {
      var t = BY_LEMMA[EXACT_EXTRA[f]];
      if (t) { claimIfFree(IDXA, keyA(f), t); claimIfFree(IDX0, key0(f), t); }
    }
  }

  /* ---- tier 3: ending-stripping lookup ---------------------------------- */
  function hit(idx, stem) {
    var e = idx[stem];
    return (e && e !== AMB) ? e : null;
  }
  /* res maps lemma -> {e, cov} with the best coverage kept. Coverage is
   * how much of the token the reconstruction explains (augment and
   * reduplication count), so "ε + λυ + θη" (λύω) ties with "ελυ + θη"
   * (ἐλύω) and frequency decides. */
  function addRes(res, e, cov, len) {
    var cur = res[e.lemma];
    if (!cur || cov > cur.cov || (cov === cur.cov && len > cur.len)) {
      res[e.lemma] = { e: e, cov: cov, len: len };
    }
  }

  /* ψ/ξ are stem-consonant + σ fusions: expand to try the unaspirated pair
   * (γραψα -> γραφ+σα, φραξαι -> φρακ+σαι, σσσ-contracts included). */
  function expand(c) {
    var out = [c];
    if (c.indexOf('ψ') >= 0) {
      ['π', 'β', 'φ'].forEach(function (r) { out.push(c.split('ψ').join(r + 'σ')); });
    }
    if (c.indexOf('ξ') >= 0) {
      ['κ', 'γ', 'χ', 'σσ'].forEach(function (r) { out.push(c.split('ξ').join(r + 'σ')); });
    }
    return out;
  }

  function tryEnds(c, pfx, noNoun, res) {
    var vs = expand(c), i, j;
    for (i = 0; i < vs.length; i++) {
      var v = vs[i];
      for (j = 0; j < M.endAll.length; j++) {
        var pair = M.endAll[j], tab = pair[0], end = pair[2];
        if (!end || v.length <= end.length || v.slice(-end.length) !== end) continue;
        /* a subscript-iota token can be a Dat. Sg. or a 2 Sg. contract
         * middle form; both readings stay in - the middle reading gets
         * its bonus at resolution (τιμᾷ -> τιμάω over τίμη acc.). */
        /* an augment-stripped candidate cannot carry a present-only ending */
        if (pfx > 0 && PRESENT_ONLY[end]) continue;
        var stem = v.slice(0, -end.length);
        var e;
        if (tab === 'noun12' || tab === 'noun3') {
          e = hit(STEM_N, stem);
          /* Dat. Pl. -σι rebuilds the interstitial vowel: ανδρασι -> ανδρ. */
          if (!e && end === 'σι' && stem.length > 1 && isV(stem.charAt(stem.length - 1))) {
            e = hit(STEM_N, stem.slice(0, -1));
            if (e) stem = stem.slice(0, -1);
          }
        } else if (tab === 'verbMid') {
          /* Middle endings prefer a medium paradigm: ἐργάζεται -> ἐργάζομαι */
          e = hit(STEM_VM, stem) || hit(STEM_V, stem);
        } else {
          e = hit(STEM_V, stem);
        }
        if (!e) continue;
        /* validation: the ending table must belong to the entry's class,
         * and the ending must be possible for its gender/declension. */
        if (e.cls.indexOf(tab) < 0) continue;
        if (e.bad.indexOf(end) >= 0) continue;
        /* augment/reduplication credit is doubled: it explains one
         * character but also certifies a whole morphological step. */
        /* A contracted -όω 3 Sg. (δηλό-ει -> δηλοῖ) fused its stem vowel
         * into the ending, so that reading explains one extra character. */
        var cb = (tab === 'verb' && end === 'οι' && e.pos === 'V-2') ? 1 : 0;
        addRes(res, e, stem.length + end.length + 2 * pfx + cb, stem.length);
      }
    }
  }

  function tier3(t) {
    if (!M) ensureMorph();
    var bare = bk(t);
    if (bare.length < 3) return null;
    var cands = [{ c: bare, pfx: 0 }], i;
    /* movable nu (πολεσιν -> πολεσι, εστιν -> εστι): only after a vowel */
    if (bare.length > 3 && bare.charAt(bare.length - 1) === 'ν' &&
        isV(bare.charAt(bare.length - 2))) {
      cands.push({ c: bare.slice(0, -1), pfx: 0 });
    }
    /* simple augment */
    if (bare.charAt(0) === 'ε' && bare.length > 3) cands.push({ c: bare.slice(1), pfx: 1 });
    /* temporal augment (lengthened initial vowel) */
    for (i = 0; i < TEMPORAL.length; i++) {
      if (bare.slice(0, TEMPORAL[i][0].length) === TEMPORAL[i][0]) {
        cands.push({ c: TEMPORAL[i][1] + bare.slice(TEMPORAL[i][0].length), pfx: 1 });
      }
    }
    /* augment after a preverb: drop it, or restore a contract vowel */
    for (i = 0; i < PREVERBS.length; i++) {
      var pv = PREVERBS[i];
      if (bare.slice(0, pv.length) === pv && bare.length > pv.length + 1) {
        var rest = bare.slice(pv.length);
        if (isV(rest.charAt(0))) {
          /* drop the augment, or drop preverb + augment (simplex: κατέλαβεν
           * -> ελαβεν as well as καταλαβεν, both reach λαμβάνω) */
          cands.push({ c: pv + rest.slice(1), pfx: 0 });
          cands.push({ c: rest.slice(1), pfx: 0 });
        }
      }
      if (pv.length >= 3 && isV(pv.charAt(pv.length - 1))) {
        var sh = pv.slice(0, -1);
        if (bare.slice(0, sh.length) === sh && bare.length > sh.length + 1 &&
            isV(bare.charAt(sh.length))) {
          cands.push({ c: pv + bare.slice(sh.length + 1), pfx: 0 });
          cands.push({ c: bare.slice(sh.length + 1), pfx: 0 });
        }
      }
    }
    /* perfect reduplication: λε-λυ-κα -> λυ-κα */
    if (bare.length > 2 && !isV(bare.charAt(0)) && bare.charAt(0) === bare.charAt(2)) {
      cands.push({ c: bare.slice(2), pfx: 2 });
    }
    var noNoun = /\u0345/.test(nfd(t));
    var res = Object.create(null);
    for (i = 0; i < cands.length; i++) {
      tryEnds(cands[i].c, cands[i].pfx, noNoun, res);
    }
    /* Resolution: the reconstruction covering most of the token wins; on
     * a tie frequency decides only if the gap is clear (rank gap >= 300),
     * otherwise the form is genuinely ambiguous and stays null - no guessing.
     * A subscript iota certifies the 2 Sg. contract middle reading, so
     * medium entries get a small coverage bonus (τιμᾷ -> τιμάω). */
    var list = [];
    for (var k in res) list.push(res[k]);
    if (!list.length) return null;
    if (noNoun) {
      list.forEach(function (r) { if (/^V-/.test(r.e.pos)) r.cov += 1; });
    }
    list.sort(function (a, b) { return (b.cov - a.cov) || (a.e.rank - b.e.rank); });
    var best = list[0];
    if (list.length > 1 && list[1].cov === best.cov &&
        list[1].e.rank - best.e.rank < 300) return null;
    var e = best.e;
    return { lemma: e.lemma, stems: e.stems, pos: e.pos, gloss: e.gloss, derived: true };
  }

  /* Lookup a token; returns an entry {lemma, stems, pos, gloss, derived}
   * or null (not found / ambiguous). */
  function dictLookup(token) {
    if (!dictRaw()) return null;
    ensure();
    var t = String(token);
    if (CACHE_DICT[t] !== undefined) return CACHE_DICT[t];
    var e = IDXA[keyA(t)];
    if (e === undefined || e === AMB) e = IDX0[key0(t)];
    if (e === undefined || e === AMB) e = IDX1[key1(t)];
    if ((e === undefined || e === AMB) && bk(t).length >= 2) e = IDX2[bk(t)];
    if (e === undefined || e === AMB) e = tier3(t);
    CACHE_DICT[t] = (e && e !== AMB) ? e : null;
    return CACHE_DICT[t];
  }

  /* ---- morphology hints --------------------------------------------------- */
  /* Normalised ending lists, shared by tier 3 and morphLookup. Built once:
   * endN = noun endings (longest first), endV = verb endings. pair = table
   * name, analysis, folded ending. */
  var M = null;
  function ensureMorph() {
    if (M) return M;
    var src = window.SA_MORPH || {};
    M = { exact: src.exact || {}, tables: {}, endN: [], endV: [] };
    ['noun12', 'noun3', 'verb', 'sig', 'theta', 'verbMid', 'part', 'perf']
      .forEach(function (name) {
        M.tables[name] = (src[name] || []).map(function (p) {
          return [name, p[1], bk(p[0])];
        });
      });
    M.endN = M.tables.noun12.concat(M.tables.noun3);
    M.endV = M.tables.verb.concat(M.tables.sig, M.tables.theta,
      M.tables.verbMid, M.tables.part, M.tables.perf);
    M.endAll = M.endN.concat(M.endV);
    [M.endN, M.endV, M.endAll].forEach(function (list) {
      list.sort(function (a, b) { return b[2].length - a[2].length; });
    });
    MDEX = Object.create(null);
    for (var k in M.exact) {
      var k0 = key0(k);
      if (MDEX[k0] === undefined) MDEX[k0] = M.exact[k];
    }
    return M;
  }

  /* Morphology hint for a token; entry = dictionary result (optional),
   * used to pick the right ending table. Returns {cat, a, e, conf} or null.
   * conf 2 = certain (exact table / invariable); conf 1 = ending guess,
   * rendered with "?" by the exporters. */
  function morphLookup(token, entry) {
    if (!window.SA_MORPH) return null;
    ensureMorph();
    var t = String(token);
    if (CACHE_MORPH[t] !== undefined) return CACHE_MORPH[t];
    var r = morphRun(t, entry);
    CACHE_MORPH[t] = r;
    return r;
  }

  function morphRun(t, entry) {
    var ex = MDEX[key0(t)];
    if (ex) return { cat: ex[0], a: ex[1], e: '', conf: 2 };
    if (entry && /^(ADV|CONJ|PREP|PART|INTERJ)/.test(entry.pos)) {
      return { cat: 'invariable', a: 'invariable form', e: '', conf: 2 };
    }
    var bare = bk(t);
    if (bare.length < 3) return null;
    /* subscript iota: contract 2 Sg. mid./pass. or Dat. Sg. */
    if (/\u0345/.test(nfd(t))) {
      if (entry && /^V-/.test(entry.pos)) {
        return { cat: 'verb', a: '2 Sg. pres. mid./pass. (contract)', e: '', conf: 1 };
      }
      if (entry && /^(N-|ADJ|PRON|NUM)/.test(entry.pos)) {
        return { cat: 'noun', a: 'Dat. Sg. (iota subscript)', e: '', conf: 1 };
      }
    }
    var lists;
    if (entry && /^V-/.test(entry.pos)) {
      lists = ['verb', 'sig', 'theta', 'verbMid', 'part', 'perf'];
    } else if (entry && /^(N-3|ADJ-3)/.test(entry.pos)) {
      lists = ['noun3', 'noun12'];
    } else if (entry && /^(N-|ADJ|PRON|NUM)/.test(entry.pos)) {
      lists = ['noun12', 'noun3'];
    } else {
      lists = ['noun12', 'verb'];
    }
    var variants = expand(bare);
    if (bare.charAt(0) === 'ε') variants = variants.concat(variants.map(function (v) {
      return v.slice(1);
    }));
    var out = [], seen = {};
    lists.forEach(function (name) {
      M.tables[name].forEach(function (pair) {
        if (out.length >= 2) return;
        var end = pair[2];
        if (!end) return;
        for (var i = 0; i < variants.length; i++) {
          var v = variants[i];
          if (v.length > end.length && v.slice(-end.length) === end) {
            if (!seen[pair[1]]) {
              seen[pair[1]] = 1;
              out.push({ cat: name === 'noun12' || name === 'noun3' ? 'noun' : 'verb', a: pair[1], e: '-' + pair[2], conf: 1 });
            }
            break;
          }
        }
      });
    });
    if (!out.length) return null;
    out.sort(function (a, b) { return b.e.length - a.e.length; });
    return out[0];
  }

  /* Analyse the input; returns the model for both exporters, or a friendly
   * error code. The pasted text is normalised to Unicode NFC first, so text
   * typed or pasted in decomposed form (NFD) still matches dictionary keys
   * and renders consistently. */
  function analyze(raw, opts) {
    opts = opts || {};
    var text = String(raw || '').replace(/\r\n?/g, '\n').normalize('NFC');
    var trimmed = text.trim();
    var chars = Array.from(trimmed).length;
    if (chars === 0) return { ok: false, code: 'empty' };
    if (chars > LIMIT) return { ok: false, code: 'limit', chars: chars, limit: LIMIT };

    var sentences = [];
    splitSentences(trimmed).forEach(function (s) {
      var t = tokenize(s);
      if (t.length > 0) sentences.push({ greek: s.replace(/\s+/g, ' ').trim(), tokens: t });
    });
    if (sentences.length === 0) return { ok: false, code: 'nogreek' };

    var seen = Object.create(null), vocab = [];
    sentences.forEach(function (s, i) {
      s.n = i + 1;
      s.tokens.forEach(function (t) {
        var key = t.toLowerCase();
        if (!seen[key]) { seen[key] = 1; vocab.push(t); }
      });
    });

    return {
      ok: true, chars: chars,
      title: String(opts.title || '').trim(),
      subtitle: String(opts.subtitle || '').trim(),
      sentences: sentences,
      vocab: vocab
    };
  }

  return {
    LIMIT: LIMIT, FN: FN, COLORS: COLORS, STEPS: STEPS,
    analyze: analyze, splitSentences: splitSentences, tokenize: tokenize,
    dictLookup: dictLookup, morphLookup: morphLookup, stats: function () { ensure(); return { entries: ENTRIES.length }; }
  };
})();
