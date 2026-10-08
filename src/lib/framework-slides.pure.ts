export interface LocalizedText {
  en: string;
  de: string;
}
export interface LocalizedList {
  en: string[];
  de: string[];
}

export interface FrameworkSlideData {
  id: string;
  step: string;
  letter: LocalizedText;
  phase: LocalizedText;
  shortTitle: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  tag: LocalizedText;
  bullets: LocalizedList;
  deliverable: LocalizedText;
  iconName: 'cpu' | 'users' | 'target' | 'gauge' | 'sparkles';
}

export const FRAMEWORK_SLIDES: readonly FrameworkSlideData[] = [
  {
    id: 'alignment',
    step: '01',
    letter: { en: 'A', de: 'V' },
    phase: { en: 'ALIGNMENT', de: 'VERSTÄNDNIS' },
    shortTitle: { en: 'Alignment', de: 'Verständnis' },
    title: { en: 'Shared Understanding', de: 'Gemeinsames Verständnis' },
    subtitle: {
      en: 'Create shared understanding of the problem space, across people and technology.',
      de: 'Gemeinsames Verständnis des Problemraums schaffen — über Mensch und Technologie hinweg.',
    },
    bullets: {
      en: [
        'Map how the business actually operates before touching code, prompts, or tooling',
        'Bridge the communication gap between executive strategy and engineering reality',
        'Rigorous clarity on actual constraints beats premature technical solutions every time',
      ],
      de: [
        'Abbilden, wie das Unternehmen wirklich arbeitet — vor jeder Zeile Code oder Tooling',
        'Die Kluft zwischen Führungsebene und operativer Engineering-Realität schließen',
        'Reale Engpässe verstehen schlägt verfrühte technologische Scheinlösungen',
      ],
    },
    deliverable: {
      en: 'Deliverable: Problem-Space Architecture & Constraint Dossier',
      de: 'Ergebnis: Problemraum-Architektur & Engpass-Dossier',
    },
    tag: { en: 'SHARED UNDERSTANDING', de: 'GEMEINSAMES VERSTÄNDNIS' },
    iconName: 'cpu',
  },
  {
    id: 'people',
    step: '02',
    letter: { en: 'P', de: 'M' },
    phase: { en: 'PEOPLE', de: 'MENSCH' },
    shortTitle: { en: 'People', de: 'Mensch' },
    title: { en: 'People at the Center', de: 'Der Mensch im Zentrum' },
    subtitle: {
      en: 'People are always at the center of the problem and solution space — AI only accelerates in both directions.',
      de: 'Der Mensch steht immer im Zentrum von Problem und Lösung — KI beschleunigt lediglich in beide Richtungen.',
    },
    bullets: {
      en: [
        'Technology accelerates existing culture: it amplifies both excellence and organizational debt',
        'Workflows designed around human judgment, agency, and verified decision loops',
        'Fostering psychological safety and mastery so engineers embrace tools without resistance',
      ],
      de: [
        'Technologie beschleunigt bestehende Kultur: sie verstärkt Exzellenz wie Reibungsverluste',
        'Workflows um menschliche Urteilskraft und verifizierte Entscheidungsschleifen bauen',
        'Kompetenz und Sicherheit stärken, damit Teams neue Werkzeuge mit Überzeugung adaptieren',
      ],
    },
    deliverable: {
      en: 'Principle: Human-Centric Enablement, Zero Tool Fatigue',
      de: 'Leitsatz: Menschzentriertes Enablement, keine Tool-Überlastung',
    },
    tag: { en: 'HUMAN CENTRICITY', de: 'MENSCH IM ZENTRUM' },
    iconName: 'users',
  },
  {
    id: 'focus',
    step: '03',
    letter: { en: 'F', de: 'F' },
    phase: { en: 'FOCUS', de: 'FOKUS' },
    shortTitle: { en: 'Focus', de: 'Fokus' },
    title: { en: 'The Multiplier Wedge', de: 'Der Multiplikator-Fokus' },
    subtitle: {
      en: 'Start with something focused and isolated that delivers a massive multiplier effect directly with stakeholders.',
      de: 'Fokussiert und isoliert starten — mit einem Hebel, der direkt bei den Beteiligten maximale Wirkung entfaltet.',
    },
    bullets: {
      en: [
        'Identify the single operational friction point causing disproportionate downstream drag',
        'Build a targeted, high-impact wedge directly at the front line with working teams',
        'Early tangible wins build organizational conviction faster than grand theoretical roadmaps',
      ],
      de: [
        'Den einzelnen Engpass isolieren, der überproportional viel operative Reibung erzeugt',
        'Einen präzisen Hebel direkt an der Basis gemeinsam mit den betroffenen Teams umsetzen',
        'Frühe sichtbare Erfolge schaffen Überzeugung schneller als theoretische Masterpläne',
      ],
    },
    deliverable: {
      en: 'Deliverable: High-Multiplier Prototype & Production Seam',
      de: 'Ergebnis: High-Multiplier-Prototyp & Produktiv-Schnittstelle',
    },
    tag: { en: 'FOCUSED MULTIPLIER', de: 'FOKUSSIERTER HEBEL' },
    iconName: 'target',
  },
  {
    id: 'metrics',
    step: '04',
    letter: { en: 'M', de: 'M' },
    phase: { en: 'METRICS', de: 'METRIKEN' },
    shortTitle: { en: 'Metrics', de: 'Metriken' },
    title: { en: 'Quantifiable Truth', de: 'Quantifizierbare Wahrheit' },
    subtitle: {
      en: 'Define quantifiable metrics that serve business goals and the people.',
      de: 'Quantifizierbare Metriken definieren, die den Unternehmenszielen und den Menschen dienen.',
    },
    bullets: {
      en: [
        'Tie every architectural decision directly to empirical P&L and velocity indicators',
        'Measure cognitive load reduction, throughput gains, and deterministic test accuracy',
        'Hard benchmark harness eliminates subjective opinions, vendor hype, and vanity metrics',
      ],
      de: [
        'Jede Maßnahme direkt an messbare GuV- und Durchsatz-Indikatoren koppeln',
        'Entlastung von Ingenieuren, Zykluszeiten und deterministische Prüfquoten objektiv messen',
        'Zahlenbasierte Benchmarks eliminieren Meinungen, Hype und Schein-Erfolge',
      ],
    },
    deliverable: {
      en: 'Deliverable: Deterministic Metrics Dashboard & Eval Benchmark Suite',
      de: 'Ergebnis: Deterministisches Metrik-Dashboard & Eval-Benchmark-Suite',
    },
    tag: { en: 'QUANTIFIABLE METRICS', de: 'QUANTIFIZIERBARE METRIKEN' },
    iconName: 'gauge',
  },
  {
    id: 'scale',
    step: '05',
    letter: { en: 'S', de: 'S' },
    phase: { en: 'SCALE', de: 'SKALIERUNG' },
    shortTitle: { en: 'Scale', de: 'Skalierung' },
    title: { en: 'Transfer & Scale', de: 'Transfer & Skalierung' },
    subtitle: {
      en: 'Transfer complete ownership to your team and scale repeatable impact across the organization.',
      de: 'Verantwortung vollständig an Ihr Team übergeben und Wirkung in der Organisation skalieren.',
    },
    bullets: {
      en: [
        'Victory is not delivery — victory is your internal team running and improving it without us',
        'Documented, version-controlled systems and self-updating architectural harnesses',
        'Repeatable blueprints that expand proven workflows from one unit to the entire enterprise',
      ],
      de: [
        'Erfolg ist nicht die Übergabe — Erfolg ist, wenn Ihr Team das System eigenständig weiterentwickelt',
        'Dokumentierte, versionierte Systeme und selbstprüfende Wissens-Harnesses',
        'Wiederholbare Blaupausen, die sich von einem Team auf das gesamte Unternehmen übertragen lassen',
      ],
    },
    deliverable: {
      en: 'Deliverable: Full Team Autonomy, Handover Playbook & Enterprise Blueprint',
      de: 'Ergebnis: Vollständige Team-Autonomie, Handover-Playbook & Blaupause',
    },
    tag: { en: 'TRANSFER & SCALE', de: 'TRANSFER & SKALIERUNG' },
    iconName: 'sparkles',
  },
];
