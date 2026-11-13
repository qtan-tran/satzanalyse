/* satzanalyse – assets/morph.js
 * Morphology hints for the Satzanalyse engine (window.SA_MORPH).
 *
 * Two kinds of data, kept strictly apart:
 *  - exact: closed-class forms analysed with certainty (conf 2):
 *    article, εἰμί, pronouns, numerals. Keys are stored accented in
 *    NFC; the engine normalises keys and tokens with the same folding
 *    (accents dropped, breathings/iota kept), so grave/acute variants
 *    (τό/τὸ) match automatically.
 *  - ending tables: [ending, analysis] pairs per word class. The
 *    engine sorts by ending length, matches the longest first and
 *    marks every guess with "?" (conf 1). Endings are stored as plain
 *    vowel sequences; the engine folds them at load.
 *    ψ/ξ spellings from sigmatic fusion (γράψα = γραφ+σα) are rebuilt
 *    by the engine; the tables only list the σ spellings.
 *
 * Code and tables: MIT license, see LICENSE. Part of the Satzanalyse
 * draft (formats follow docs/FORMAT-SPEC.md sections 5 and 6). */
window.SA_MORPH = {

  /* ---- exact forms (conf 2) ------------------------------------------- */
  exact: {
    /* Article */
    'ὁ': ['article', 'Nom. Sg. m.'],
    'τόν': ['article', 'Acc. Sg. m.'],
    'τοῦ': ['article', 'Gen. Sg. m./n.'],
    'τῷ': ['article', 'Dat. Sg. m./n.'],
    'ἡ': ['article', 'Nom. Sg. f.'],
    'τήν': ['article', 'Acc. Sg. f.'],
    'τῆς': ['article', 'Gen. Sg. f.'],
    'τῇ': ['article', 'Dat. Sg. f.'],
    'τό': ['article', 'Nom./Acc. Sg. n.'],
    'οἱ': ['article', 'Nom. Pl. m.'],
    'τούς': ['article', 'Acc. Pl. m.'],
    'τοῖς': ['article', 'Dat. Pl. m./n.'],
    'τῶν': ['article', 'Gen. Pl. m./f./n.'],
    'αἱ': ['article', 'Nom. Pl. f.'],
    'τάς': ['article', 'Acc. Pl. f.'],
    'ταῖς': ['article', 'Dat. Pl. f.'],
    'τά': ['article', 'Nom./Acc. Pl. n.'],
    'ὦ': ['interjection', 'Voc. particle'],

    /* εἰμί */
    'εἰμί': ['verb (εἰμί)', '1 Sg. pres.'],
    'εἶ': ['verb (εἰμί)', '2 Sg. pres.'],
    'ἐστί': ['verb (εἰμί)', '3 Sg. pres.'],
    'ἐστίν': ['verb (εἰμί)', '3 Sg. pres.'],
    'ἐσμέν': ['verb (εἰμί)', '1 Pl. pres.'],
    'ἐστέ': ['verb (εἰμί)', '2 Pl. pres.'],
    'εἰσί': ['verb (εἰμί)', '3 Pl. pres.'],
    'εἰσίν': ['verb (εἰμί)', '3 Pl. pres.'],
    'ἦ': ['verb (εἰμί)', '1/3 Sg. impf.'],
    'ἦς': ['verb (εἰμί)', '2 Sg. impf.'],
    'ἦν': ['verb (εἰμί)', '3 Sg. impf.'],
    'ἦμεν': ['verb (εἰμί)', '1 Pl. impf.'],
    'ἦτε': ['verb (εἰμί)', '2 Pl. impf.'],
    'ἦσαν': ['verb (εἰμί)', '3 Pl. impf.'],
    'ἔσομαι': ['verb (εἰμί)', '1 Sg. fut.'],
    'ἔσῃ': ['verb (εἰμί)', '2 Sg. fut.'],
    'ἔσται': ['verb (εἰμί)', '3 Sg. fut.'],
    'ἐσόμεθα': ['verb (εἰμί)', '1 Pl. fut.'],
    'ἔσεσθε': ['verb (εἰμί)', '2 Pl. fut.'],
    'ἔσονται': ['verb (εἰμί)', '3 Pl. fut.'],
    'εἶναι': ['verb (εἰμί)', 'inf. pres.'],
    'ὤν': ['verb (εἰμί)', 'Nom. Sg. m. part. pres.'],
    'οὖσα': ['verb (εἰμί)', 'Nom. Sg. f. part. pres.'],
    'ὄν': ['verb (εἰμί)', 'Nom./Acc. Sg. n. part. pres.'],
    'ὄντος': ['verb (εἰμί)', 'Gen. Sg. m./n. part. pres.'],
    'οὔσης': ['verb (εἰμί)', 'Gen. Sg. f. part. pres.'],

    /* Personal pronouns */
    'ἐγώ': ['pronoun', 'Nom. Sg. 1st person'],
    'ἐμοῦ': ['pronoun', 'Gen. Sg. 1st person'],
    'ἐμοί': ['pronoun', 'Dat. Sg. 1st person'],
    'ἐμέ': ['pronoun', 'Acc. Sg. 1st person'],
    'με': ['pronoun', 'Acc. Sg. 1st person (enclitic)'],
    'σύ': ['pronoun', 'Nom. Sg. 2nd person'],
    'σοῦ': ['pronoun', 'Gen. Sg. 2nd person'],
    'σοί': ['pronoun', 'Dat. Sg. 2nd person'],
    'σέ': ['pronoun', 'Acc. Sg. 2nd person'],
    'σε': ['pronoun', 'Acc. Sg. 2nd person (enclitic)'],
    'ἡμεῖς': ['pronoun', 'Nom. Pl. 1st person'],
    'ἡμῶν': ['pronoun', 'Gen. Pl. 1st person'],
    'ἡμῖν': ['pronoun', 'Dat. Pl. 1st person'],
    'ἡμᾶς': ['pronoun', 'Acc. Pl. 1st person'],
    'ὑμεῖς': ['pronoun', 'Nom. Pl. 2nd person'],
    'ὑμῶν': ['pronoun', 'Gen. Pl. 2nd person'],
    'ὑμῖν': ['pronoun', 'Dat. Pl. 2nd person'],
    'ὑμᾶς': ['pronoun', 'Acc. Pl. 2nd person'],

    /* αὐτός */
    'αὐτός': ['pronoun', 'Nom. Sg. m. (αὐτός)'],
    'αὐτοῦ': ['pronoun', 'Gen. Sg. m./n. (αὐτός)'],
    'αὐτῷ': ['pronoun', 'Dat. Sg. m./n. (αὐτός)'],
    'αὐτόν': ['pronoun', 'Acc. Sg. m. (αὐτός)'],
    'αὐτή': ['pronoun', 'Nom. Sg. f. (αὐτός)'],
    'αὐτῆς': ['pronoun', 'Gen. Sg. f. (αὐτός)'],
    'αὐτῇ': ['pronoun', 'Dat. Sg. f. (αὐτός)'],
    'αὐτήν': ['pronoun', 'Acc. Sg. f. (αὐτός)'],
    'αὐτό': ['pronoun', 'Nom./Acc. Sg. n. (αὐτός)'],
    'αὐτοί': ['pronoun', 'Nom. Pl. m. (αὐτός)'],
    'αὐτῶν': ['pronoun', 'Gen. Pl. (αὐτός)'],
    'αὐτοῖς': ['pronoun', 'Dat. Pl. m./n. (αὐτός)'],
    'αὐτούς': ['pronoun', 'Acc. Pl. m. (αὐτός)'],
    'αὐταί': ['pronoun', 'Nom. Pl. f. (αὐτός)'],
    'αὐτάς': ['pronoun', 'Acc. Pl. f. (αὐτός)'],
    'αὐτά': ['pronoun', 'Nom./Acc. Pl. n. (αὐτός)'],

    /* Relative pronoun */
    'ὅς': ['pronoun', 'Nom. Sg. m. (relative)'],
    'ἥ': ['pronoun', 'Nom. Sg. f. (relative)'],
    'ὅ': ['pronoun', 'Nom./Acc. Sg. n. (relative)'],
    'οὗ': ['pronoun', 'Gen. Sg. m./n. (relative)'],
    'ᾧ': ['pronoun', 'Dat. Sg. m./n. (relative)'],
    'ᾗ': ['pronoun', 'Dat. Sg. f. / Adv. (relative)'],
    'ὅν': ['pronoun', 'Acc. Sg. m. (relative)'],
    'ἥν': ['pronoun', 'Acc. Sg. f. (relative)'],
    'οἵ': ['pronoun', 'Nom. Pl. m. (relative)'],
    'αἵ': ['pronoun', 'Nom. Pl. f. (relative)'],
    'ἅ': ['pronoun', 'Nom./Acc. Pl. n. (relative)'],
    'ἅς': ['pronoun', 'Acc. Pl. f. (relative)'],
    'οἷς': ['pronoun', 'Dat. Pl. m./n. (relative)'],

    /* Demonstrative οὗτος */
    'οὗτος': ['pronoun', 'Nom. Sg. m. (demonstrative)'],
    'τούτου': ['pronoun', 'Gen. Sg. m./n. (demonstrative)'],
    'τούτῳ': ['pronoun', 'Dat. Sg. m./n. (demonstrative)'],
    'τοῦτον': ['pronoun', 'Acc. Sg. m. (demonstrative)'],
    'αὕτη': ['pronoun', 'Nom. Sg. f. (demonstrative)'],
    'ταύτης': ['pronoun', 'Gen. Sg. f. (demonstrative)'],
    'ταύτῃ': ['pronoun', 'Dat. Sg. f. (demonstrative)'],
    'ταύτην': ['pronoun', 'Acc. Sg. f. (demonstrative)'],
    'τοῦτο': ['pronoun', 'Nom./Acc. Sg. n. (demonstrative)'],
    'οὗτοι': ['pronoun', 'Nom. Pl. m. (demonstrative)'],
    'τούτων': ['pronoun', 'Gen. Pl. (demonstrative)'],
    'τούτοις': ['pronoun', 'Dat. Pl. m./n. (demonstrative)'],
    'τούτους': ['pronoun', 'Acc. Pl. m. (demonstrative)'],
    'αὗται': ['pronoun', 'Nom. Pl. f. (demonstrative)'],
    'ταύτας': ['pronoun', 'Acc. Pl. f. (demonstrative)'],
    'ταῦτα': ['pronoun', 'Nom./Acc. Pl. n. (demonstrative)'],

    /* Interrogative / indefinite */
    'τίς': ['pronoun', 'Nom. Sg. m./f. (interrogative)'],
    'τί': ['pronoun', 'Nom./Acc. Sg. n. (interrogative)'],
    'τίνος': ['pronoun', 'Gen. Sg. (interrogative/indefinite)'],
    'τίνι': ['pronoun', 'Dat. Sg. (interrogative/indefinite)'],
    'τίνα': ['pronoun', 'Acc. Sg. m./f. (interrogative/indefinite)'],
    'τίνες': ['pronoun', 'Nom. Pl. (interrogative/indefinite)'],
    'τίνων': ['pronoun', 'Gen. Pl. (interrogative/indefinite)'],
    'τίσι': ['pronoun', 'Dat. Pl. (interrogative/indefinite)'],
    'τίσιν': ['pronoun', 'Dat. Pl. (interrogative/indefinite)'],
    'τίνας': ['pronoun', 'Acc. Pl. (interrogative/indefinite)'],
    'τις': ['pronoun', 'Nom. Sg. m./f. (indefinite)'],
    'τι': ['pronoun', 'Nom./Acc. Sg. n. (indefinite)'],
    'τινά': ['pronoun', 'Acc. Sg. m./f. / Nom. Sg. f. (indefinite)'],
    'τινές': ['pronoun', 'Nom. Pl. (indefinite)'],
    'τινῶν': ['pronoun', 'Gen. Pl. (indefinite)'],
    'τισί': ['pronoun', 'Dat. Pl. (indefinite)'],
    'τινάς': ['pronoun', 'Acc. Pl. (indefinite)'],

    /* Reflexive */
    'ἑαυτοῦ': ['pronoun', 'Gen. Sg. m. (reflexive)'],
    'ἑαυτῷ': ['pronoun', 'Dat. Sg. m. (reflexive)'],
    'ἑαυτόν': ['pronoun', 'Acc. Sg. m. (reflexive)'],
    'ἑαυτῆς': ['pronoun', 'Gen. Sg. f. (reflexive)'],
    'ἑαυτῇ': ['pronoun', 'Dat. Sg. f. (reflexive)'],
    'ἑαυτήν': ['pronoun', 'Acc. Sg. f. (reflexive)'],
    'ἑαυτῶν': ['pronoun', 'Gen. Pl. (reflexive)'],
    'ἑαυτοῖς': ['pronoun', 'Dat. Pl. m./n. (reflexive)'],
    'ἑαυτούς': ['pronoun', 'Acc. Pl. m. (reflexive)'],
    'ἑαυτάς': ['pronoun', 'Acc. Pl. f. (reflexive)'],

    /* Numerals */
    'εἷς': ['numeral', 'one (Nom. Sg. m.)'],
    'μία': ['numeral', 'one (Nom. Sg. f.)'],
    'ἕν': ['numeral', 'one (Nom./Acc. Sg. n.)'],
    'δύο': ['numeral', 'two'],
    'δυοῖν': ['numeral', 'two (Gen./Dat.)'],
    'τρεῖς': ['numeral', 'three (Nom./Acc. m./f.)'],
    'τρία': ['numeral', 'three (Nom./Acc. n.)'],
    'τέσσαρες': ['numeral', 'four'],
    'πέντε': ['numeral', 'five'],
    'ἕξ': ['numeral', 'six'],
    'ἑπτά': ['numeral', 'seven'],
    'ὀκτώ': ['numeral', 'eight'],
    'ἐννέα': ['numeral', 'nine'],
    'δέκα': ['numeral', 'ten'],
    'εἴκοσι': ['numeral', 'twenty'],
    'ἑκατόν': ['numeral', 'hundred'],
    'χίλιοι': ['numeral', 'thousand'],
    'μυρίοι': ['numeral', 'ten thousand']
  },

  /* ---- ending tables (conf 1, rendered with "?") ---------------------- */

  /* 1st and 2nd declension (nouns, adjectives; endings folded at load) */
  noun12: [
    ['ας', 'Acc. Pl. f. (1st decl.)'],
    ['αις', 'Dat. Pl. f. (1st decl.)'],
    ['αι', 'Nom. Pl. f. (1st decl.)'],
    ['ης', 'Gen. Sg. f. (1st decl.)'],
    ['οις', 'Dat. Pl. m. (2nd decl.)'],
    ['οι', 'Nom. Pl. m. (2nd decl.)'],
    ['ου', 'Gen. Sg. (2nd decl.)'],
    ['ον', 'Acc. Sg. m./n. (2nd decl.)'],
    ['ων', 'Gen. Pl. (1st/2nd decl.)'],
    ['ως', 'Gen. Pl. (2nd decl.)'],
    ['ω', 'Dat. Sg. (2nd decl.)'],
    ['η', 'Nom. Sg. f. (1st decl.)'],
    ['α', 'Acc. Sg. f. / Nom. Sg. f. (1st decl., alpha)'],
    ['ος', 'Nom. Sg. m. (2nd decl.)'],
    ['ε', 'Voc. Sg. (2nd decl.)'],
    ['ν', 'Acc. Sg. (movable ν, rare)']
  ],

  /* 3rd declension */
  noun3: [
    ['ων', 'Gen. Sg. / Gen. Pl. (3rd decl.)'],
    ['ους', 'Gen. Sg. (3rd decl., -ους)'],
    ['εις', 'Nom./Acc. Pl. (3rd decl.)'],
    ['ας', 'Acc. Pl. (3rd decl.)'],
    ['ης', 'Gen. Sg. f. (3rd decl., -ης)'],
    ['ιν', 'Acc. Sg. f. (3rd decl., -ιν: πόλιν, χάριν)'],
    ['σι', 'Dat. Pl. (3rd decl., vowel/consonant rebuilt by engine)'],
    ['ι', 'Dat. Sg. (3rd decl.)'],
    ['ες', 'Nom. Pl. m./f. / Nom. Acc. Pl. n. (3rd decl.)'],
    ['ως', 'Gen. Sg. f. (3rd decl., -εως)'],
    ['ος', 'Gen. Sg. (3rd decl.)'],
    ['α', 'Nom./Acc. Sg. n. (3rd decl., e.g. σῶμα)'],
    ['ν', 'Acc. Sg. (movable ν, e.g. γῆν)'],
    ['αι', '']
  ],

  /* Finite verb endings: present/imperfect/future thematic + aorist */
  verb: [
    ['ουσιν', '3 Pl. pres. act.'],
    ['ουσι', '3 Pl. pres. act.'],
    ['ουμεν', '1 Pl. pres. act.'],
    ['ομεν', '1 Pl. pres. act. (poetic)'],
    ['ετε', '2 Pl. pres. act.'],
    ['ατε', '2 Pl. pres. act. (contract)'],
    ['εις', '2 Sg. pres. act.'],
    ['ει', '3 Sg. pres. act.'],
    ['ειν', 'inf. act.'],
    ['οι', '3 Sg. pres. act. (contract -όω, e.g. δηλοῖ)'],
    ['ναι', 'inf. (aor./perf.)'],
    ['ον', '3 Sg. impf. / 1 Sg. aor. act.'],
    ['ες', '2 Sg. impf./aor. act.'],
    ['ε', '3 Sg. impf./aor. act.'],
    ['εν', '3 Sg. impf. act. (movable ν)'],
    ['ω', '1 Sg. pres. act.'],
    ['αμεν', '1 Pl. aor. act.'],
    ['ατε', '2 Pl. aor. act.'],
    ['αν', '3 Pl. aor. act.'],
    ['ας', '2 Sg. aor. act.'],
    ['α', '1 Sg. aor. act.'],
    ['σ', '2 Sg. pres. act. (contract, e.g. τιμᾷς)']
  ],

  /* Future / sigmatic aorist (-σ-, with ψ/ξ rebuilt by the engine) */
  sig: [
    ['σουσιν', '3 Pl. fut. act.'],
    ['σουσι', '3 Pl. fut. act.'],
    ['σει', '3 Sg. fut. act.'],
    ['σεις', '2 Sg. fut. act.'],
    ['σετε', '2 Pl. fut. act.'],
    ['σομεν', '1 Pl. fut. act.'],
    ['σειν', 'inf. fut. act.'],
    ['σω', '1 Sg. fut. act.'],
    ['σαμεν', '1 Pl. aor. act.'],
    ['σατε', '2 Pl. aor. act.'],
    ['σας', '2 Sg. aor. act.'],
    ['σαν', '3 Pl. aor. act.'],
    ['σε', '3 Sg. aor. act.'],
    ['σεν', '3 Sg. aor. act. (movable ν)'],
    ['σα', '1 Sg. aor. act.'],
    ['σαι', '2 Sg. aor. mid. / inf. aor. act.'],
    ['σατο', '3 Sg. aor. mid.'],
    ['σαντο', '3 Pl. aor. mid.'],
    ['σαμην', '1 Sg. aor. mid.']
  ],

  /* Passive -θη- */
  theta: [
    ['θησεται', '3 Sg. fut. pass.'],
    ['θησονται', '3 Pl. fut. pass.'],
    ['θησεσθε', '2 Pl. fut. pass.'],
    ['θησομαι', '1 Sg. fut. pass.'],
    ['θησομεν', '1 Pl. fut. pass.'],
    ['θησετε', '2 Pl. fut. pass.'],
    ['θησαν', '3 Pl. aor. pass.'],
    ['θημεν', '1 Pl. aor. pass.'],
    ['θηναι', 'inf. aor. pass.'],
    ['θητε', '2 Pl. aor. pass.'],
    ['θης', '2 Sg. aor. pass.'],
    ['θην', '1/3 Sg. aor. pass.'],
    ['θη', '3 Sg. aor. pass.']
  ],

  /* Middle/passive endings (perfect included; reduplication is
   * handled by the engine on the candidate, not the ending) */
  verbMid: [
    ['ομενος', 'Nom. Sg. m. pres. mid./pass. part.'],
    ['ομαι', '1 Sg. pres. mid./pass.'],
    ['ονται', '3 Pl. pres. mid./pass.'],
    ['εται', '3 Sg. pres. mid./pass.'],
    ['οντο', '3 Pl. impf. mid./pass.'],
    ['ετο', '3 Sg. impf. mid./pass.'],
    ['ομεθα', '1 Pl. pres. mid./pass.'],
    ['ομην', '1 Sg. impf. mid./pass.'],
    ['εσθε', '2 Pl. pres./impf. mid./pass.'],
    ['εσθαι', 'inf. mid./pass.'],
    ['σθαι', 'inf. mid./pass.'],
    ['σαι', '2 Sg. aor./perf. mid.'],
    ['μαι', '1 Sg. perf. mid./pass.'],
    ['ται', '3 Sg. perf. mid./pass.'],
    ['νται', '3 Pl. perf. mid./pass.'],
    ['μεθα', '1 Pl. perf. mid./pass.'],
    ['σθε', '2 Pl. perf. mid./pass.'],
    ['σο', '2 Sg. impf./aor. mid. (poetic)']
  ],

  /* Participles (active) */
  part: [
    ['ουσαι', 'Nom. Pl. f. pres. act. part.'],
    ['ουσης', 'Gen. Sg. f. pres. act. part.'],
    ['ουσας', 'Acc. Pl. f. pres. act. part.'],
    ['ουσαν', 'Acc. Sg. f. pres. act. part.'],
    ['ουσα', 'Nom. Sg. f. pres. act. part.'],
    ['οντες', 'Nom. Pl. m. pres. act. part.'],
    ['οντας', 'Acc. Pl. m. / Gen. Sg. m. pres. act. part.'],
    ['οντα', 'Nom./Acc. Pl. n. pres. act. part.'],
    ['ασα', 'Nom. Sg. f. aor. act. part.'],
    ['σασα', 'Nom. Sg. f. aor. act. part.'],
    ['ων', 'Nom. Sg. m. pres. act. part.'],
    ['ας', 'Nom. Sg. m. aor. act. part.'],
    ['σας', 'Nom. Sg. m. aor. act. part.'],
    ['σαν', 'Nom./Acc. Pl. n. aor. act. part.'],
    ['ως', 'Nom. Sg. m. perf. act. part.'],
    ['υια', 'Nom. Sg. f. perf. act. part.'],
    ['μενος', 'Nom. Sg. m. mid./pass. part.'],
    ['μενη', 'Nom. Sg. f. mid./pass. part.'],
    ['μενον', 'Nom./Acc. Sg. n. mid./pass. part.']
  ],

  /* Perfect active (reduplication handled by the engine) */
  perf: [
    ['κασιν', '3 Pl. perf. act.'],
    ['κασι', '3 Pl. perf. act.'],
    ['καμεν', '1 Pl. perf. act.'],
    ['κατε', '2 Pl. perf. act.'],
    ['κας', '2 Sg. perf. act.'],
    ['κεν', '3 Sg. perf. act. (or aor. sig.)'],
    ['κε', '3 Sg. perf. act.'],
    ['κα', '1 Sg. perf. act.'],
    ['ειν', 'pluperf. act.']
  ]
};
