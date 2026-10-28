import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PollQuestion, type PollQuestionProps } from './poll-question';

function render(props: PollQuestionProps): string {
  return renderToStaticMarkup(createElement('ol', null, createElement(PollQuestion, props)));
}

describe('success cases', () => {
  it('prints the question and every answer as text', () => {
    // ARRANGE
    const question = 'What is AI most like for you?';
    const answers = ['a smarter search engine', 'a chat I ask questions'];
    // ACT
    const html = render({ marker: 1, question, answers, tone: 'info' });
    // ASSERT
    expect(html).toContain(question);
    for (const answer of answers) expect(html).toContain(answer);
  });

  it('shows the hint for a question that takes several answers', () => {
    // ARRANGE
    const hint = 'tick all that apply';
    // ACT
    const html = render({
      marker: 2,
      question: 'What do you do with AI today?',
      hint,
      answers: ['nothing yet'],
      tone: 'accent',
    });
    // ASSERT
    expect(html).toContain(hint);
  });

  it("prints each answer's vote count on its chip, zero included", () => {
    // ARRANGE
    const answers = ['often', 'sometimes', 'never'];
    // ACT
    const html = render({ marker: 1, question: 'Seen it?', answers, votes: [3, 6, 0], tone: 'info' });
    // ASSERT
    expect([...html.matchAll(/data-poll-votes=""[^>]*>(\d+)</g)].map((m) => m[1])).toEqual(['3', '6', '0']);
  });
});

describe('failure cases', () => {
  it('shows only the tag of a "tag – explanation" answer, the whole answer as its title', () => {
    // ARRANGE
    const tag = 'Chat';
    const explanation = 'ein Gesprächspartner für meine Fragen';
    const answer = `${tag} – ${explanation}`;
    // ACT
    const html = render({ marker: 1, question: 'Was ist KI für dich?', answers: [answer], tone: 'info' });
    // ASSERT
    expect(html).toContain(`>${tag}</li>`);
    expect(html).toContain(`title="${answer}"`);
  });

  it('prints no hint line for a question that takes one answer', () => {
    // ARRANGE
    const props: PollQuestionProps = {
      marker: 1,
      question: 'Which describes your work?',
      answers: ['technical'],
      tone: 'info',
    };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).not.toContain('data-poll-hint');
  });
});

describe('edge cases', () => {
  it('renders one list item per answer, in the order given', () => {
    // ARRANGE
    const first = 'often';
    const last = 'never';
    const answers = [first, 'sometimes', last];
    // ACT
    const html = render({ marker: 1, question: 'Seen it?', answers, tone: 'info' });
    // ASSERT
    expect(html.match(/data-poll-answer/g)).toHaveLength(answers.length);
    expect(html.indexOf(first)).toBeLessThan(html.indexOf(last));
  });

  it('prints no vote count when the question has none', () => {
    // ARRANGE
    const answers = ['often'];
    // ACT
    const html = render({ marker: 1, question: 'Seen it?', answers, tone: 'info' });
    // ASSERT
    expect(html).not.toContain('data-poll-votes');
  });
});
