import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Check, Minus } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { parseMatrix } from './matrix.pure';
import matrixYml from './matrix.yml';

const MATRIX = parseMatrix(matrixYml);
const TRACKS = ['enablement', 'engineering'] as const;

export const matrix = slide({
  slug: 'matrix',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'table' }],
  content: ({ t, target }) => {
    const label = (kind: 'groups' | 'rows', key: string) => t(`${kind}.${key}` as Parameters<typeof t>[0]);
    return (
      <SlideFrame className="justify-center">
        <div className="overflow-x-auto">
          <table {...target('table')} data-track-matrix="" className="w-full border-collapse text-body">
            <thead>
              <tr className="border-b border-border text-caption font-semibold tracking-widest text-muted-foreground uppercase">
                <th scope="col" className="py-2 pr-4 text-left">
                  {t('topic')}
                </th>
                {TRACKS.map((track) => (
                  <th key={track} scope="col" className="w-1/6 px-2 py-2 text-center">
                    {t(`columns.${track}`)}
                  </th>
                ))}
              </tr>
            </thead>
            {MATRIX.groups.map((group) => (
              <tbody key={group.key}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={3}
                    className="pt-3 pb-1 text-left text-caption font-semibold tracking-widest text-muted-foreground uppercase"
                  >
                    {label('groups', group.key)}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.key} data-matrix-row={row.key} className="border-b border-border">
                    <th scope="row" className="py-1.5 pr-4 text-left font-normal">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {label('rows', row.key)}
                        {row.today && (
                          <span className="rounded-full bg-brand-accent/15 px-2.5 text-caption font-semibold tracking-wide text-brand-accent uppercase">
                            {t('today')}
                          </span>
                        )}
                      </span>
                    </th>
                    {TRACKS.map((track) => (
                      <td key={track} className="px-2 py-1.5 text-center">
                        {row[track] ? (
                          <Check aria-hidden="true" className="inline size-6 text-foreground" />
                        ) : (
                          <Minus aria-hidden="true" className="inline size-5 text-muted-foreground" />
                        )}
                        <span className="sr-only">{t(row[track] ? 'marks.yes' : 'marks.no')}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </SlideFrame>
    );
  },
});
