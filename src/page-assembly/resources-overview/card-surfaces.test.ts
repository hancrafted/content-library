import { CardShell } from '@/shared/components/ui/card-shell';
import type { CardVisualPosition } from '@/shared/components/ui/card-visual';
import { load } from 'cheerio';
import { PanelsTopLeft } from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

function surface(visualPosition?: CardVisualPosition, visual?: string, media?: string) {
  return load(
    renderToStaticMarkup(
      createElement(CardShell, {
        variant: 'compact',
        linked: true,
        accent: '--primary',
        icon: PanelsTopLeft,
        data: { 'data-resource-card': 'reading' },
        visualPosition,
        visual,
        media,
        children: createElement('h2', null, 'Reading surface'),
      }),
    ),
  );
}

describe('success cases', () => {
  it('renders an explicit none surface with its body and no panel', () => {
    // ARRANGE
    const position = 'none';
    const title = 'Reading surface';
    // ACT
    const $ = surface(position);
    // ASSERT
    expect($('article').attr('data-card-visual-position')).toBe(position);
    expect($('[data-card-body] h2').text()).toBe(title);
    expect($('[data-card-visual], article svg').length).toBe(0);
  });
});

describe('failure cases', () => {
  it('ignores supplied artwork and media when the position is none', () => {
    // ARRANGE
    const artwork = 'Decorative artwork';
    const media = 'Media strip';
    // ACT
    const $ = surface('none', artwork, media);
    // ASSERT
    expect($('article').text()).not.toContain(artwork);
    expect($('article').text()).not.toContain(media);
    expect($('[data-card-visual], [data-card-media], article svg').length).toBe(0);
  });
});

describe('edge cases', () => {
  it('keeps the unrelated legacy media contract when placement is omitted', () => {
    // ARRANGE
    const media = 'Legacy media';
    // ACT
    const $ = surface(undefined, undefined, media);
    // ASSERT
    expect($('article').attr('data-card-visual-position')).toBeUndefined();
    expect($('[data-card-media]').text()).toBe(media);
    expect($('[data-card-body]').length).toBe(0);
  });
});
