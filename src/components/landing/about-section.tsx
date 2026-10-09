import { AboutAnchor } from '@/components/landing/about-anchor.client';
import caseStyles from '@/components/landing/fieldnote-case.module.css';
import { FieldnoteSketch } from '@/components/landing/fieldnote-sketch';
import styles from '@/components/landing/fieldnotes.module.css';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/locale.pure';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type AboutT = Awaited<ReturnType<typeof getTranslations<'landing.about'>>>;
type CaseId = 'rib' | 'audi' | 'selfbits';

const CASES = ['rib', 'audi', 'selfbits'] as const;
const PHASES = ['before', 'intervention', 'result'] as const;

function Identity({ t }: { t: AboutT }) {
  return (
    <aside className={styles.identity} aria-label={t('identity.label')}>
      <span className={styles.monogram} aria-hidden="true">
        hc.
      </span>
      <div>
        <p className={styles.name}>{t('identity.name')}</p>
        <p className={styles.practice}>{t('identity.practice')}</p>
      </div>
      <p className={styles.identityBody}>{t('identity.body')}</p>
      <a
        href="https://www.linkedin.com/in/han-che/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.profileLink}
      >
        <span>
          {t('identity.link')} <span className={styles.newTab}>({t('identity.newTab')})</span>
        </span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </aside>
  );
}

function CaseSequence({ id, t }: { id: CaseId; t: AboutT }) {
  return (
    <ol className={caseStyles.sequence}>
      {PHASES.map((phase) => (
        <li key={phase} className={caseStyles.phase} data-phase={phase}>
          <p className={caseStyles.phaseLabel}>
            {t(`phases.${phase}`)} <ArrowDown size={14} aria-hidden="true" />
          </p>
          <FieldnoteSketch story={id} phase={phase} />
          <h4>{t(`cases.${id}.${phase}.title`)}</h4>
        </li>
      ))}
    </ol>
  );
}

function WorkingNote({ id, t }: { id: CaseId; t: AboutT }) {
  return (
    <details className={caseStyles.evidence}>
      <summary>
        <span>{t('readNote')}</span>
        <Plus size={18} className={caseStyles.detailsIcon} aria-hidden="true" />
      </summary>
      <div className={caseStyles.evidenceBody}>
        {PHASES.map((phase) => (
          <p key={phase}>{t(`cases.${id}.${phase}.body`)}</p>
        ))}
        <p>{t(`cases.${id}.note`)}</p>
        <p className={caseStyles.source}>{t(`cases.${id}.source`)}</p>
      </div>
    </details>
  );
}

function CaseSummary({ id, index, t }: { id: CaseId; index: number; t: AboutT }) {
  return (
    <summary className={caseStyles.summary}>
      <span className={caseStyles.company}>
        <span className={caseStyles.number} aria-hidden="true">
          0{index + 1}
        </span>
        <span id={`about-${id}`}>{t(`cases.${id}.company`)}</span>
      </span>
      <span className={caseStyles.outcome}>
        <strong>{t(`cases.${id}.metric`)}</strong>
        <span>{t(`cases.${id}.unit`)}</span>
      </span>
      <span className={caseStyles.disclosure}>
        <span>{t('exploreCase')}</span>
        <Plus size={20} className={caseStyles.detailsIcon} aria-hidden="true" />
      </span>
    </summary>
  );
}

function CaseNote({ id, index, t }: { id: CaseId; index: number; t: AboutT }) {
  return (
    <article className={caseStyles.case} aria-labelledby={`about-${id}`}>
      <details open={index === 0}>
        <CaseSummary id={id} index={index} t={t} />
        <div className={caseStyles.flow}>
          <header className={caseStyles.context}>
            <h3>{t(`cases.${id}.title`)}</h3>
            <span>{t(`cases.${id}.role`)}</span>
          </header>
          <CaseSequence id={id} t={t} />
          <p className={caseStyles.scopeNote}>
            <span>{t('scope')}</span>
            {t(`cases.${id}.scope`)}
          </p>
          <WorkingNote id={id} t={t} />
        </div>
      </details>
    </article>
  );
}

function Introduction({ t }: { t: AboutT }) {
  return (
    <div className={styles.intro}>
      <header>
        <h2 id="about-heading">
          {t('headline')} <em>{t('headlineAccent')}</em>
        </h2>
        <p className={styles.lead}>{t('lead')}</p>
      </header>
      <Identity t={t} />
    </div>
  );
}

function AboutContact({ t }: { t: AboutT }) {
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.contactTitle}>{t('contactTitle')}</p>
        <p>{t('closing')}</p>
      </div>
      <Button asChild className={styles.contactButton}>
        <a href="https://calendly.com/hanche2001/30min" target="_blank" rel="noopener noreferrer">
          {t('contact')} <ArrowUpRight size={18} aria-hidden="true" />
          <span className="sr-only"> ({t('identity.newTab')})</span>
        </a>
      </Button>
    </footer>
  );
}

/** Outcomes stay in each summary; native disclosure reveals the process and its scope. */
export async function AboutSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing.about' });
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <AboutAnchor />
      <div className={styles.inner}>
        <div className={styles.masthead}>
          <p>{t('eyebrow')}</p>
          <span>{t('edition')}</span>
        </div>
        <Introduction t={t} />
        <div className={styles.readingKey}>
          <p>{t('readingKey')}</p>
          <span>{t('schematic')}</span>
        </div>
        <div>
          {CASES.map((id, index) => (
            <CaseNote key={id} id={id} index={index} t={t} />
          ))}
        </div>
        <AboutContact t={t} />
      </div>
    </section>
  );
}
