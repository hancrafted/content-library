import { describe, expect, it } from 'vitest';
import { isolationProblems } from './isolation.pure.ts';

const WORKSPACE = '/private/var/folders/x/T/eval-run-1';
const ALIAS = '/var/folders/x/T/eval-run-1';
const roots = [WORKSPACE, ALIAS];

describe('isolation', () => {
  describe('success cases', () => {
    it('passes file tools and commands that stay in the workspace, under either spelling of it', () => {
      // ARRANGE
      const tools = [
        { name: 'Read', input: { file_path: `${WORKSPACE}/handoff.md` } },
        { name: 'Write', input: { file_path: `${ALIAS}/page.html`, content: 'see /Users/someone/notes.md' } },
        { name: 'Glob', input: { pattern: '**/*.md' } },
        { name: 'Grep', input: { pattern: 'ink', path: 'skill/references' } },
        {
          name: 'Bash',
          input: { command: `ls -la ${WORKSPACE} && node skill/scripts/grade.ts page.html 2>/dev/null` },
        },
      ];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual([]);
    });
  });

  describe('failure cases', () => {
    it('fails a file tool that reads outside the workspace', () => {
      // ARRANGE
      const tools = [{ name: 'Read', input: { file_path: '/Users/someone/repo/AGENTS.md' } }];
      const expected = ['Read touches /Users/someone/repo/AGENTS.md, outside the run workspace'];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('fails a command that reaches outside, by absolute path, home or parent folder', () => {
      // ARRANGE
      const tools = [
        { name: 'Bash', input: { command: 'cat ~/.claude/CLAUDE.md' } },
        { name: 'Bash', input: { command: 'cd .. && ls ../other-run' } },
        { name: 'Grep', input: { pattern: 'ink', path: '/Users/someone/repo' } },
      ];
      const expected = [
        'Bash touches ~/.claude/CLAUDE.md, outside the run workspace',
        'Bash touches .., outside the run workspace',
        'Bash touches ../other-run, outside the run workspace',
        'Grep touches /Users/someone/repo, outside the run workspace',
      ];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('does not mistake a sibling folder sharing the workspace prefix for the workspace', () => {
      // ARRANGE
      const tools = [{ name: 'Read', input: { file_path: `${WORKSPACE}-2/page.html` } }];
      const expected = [`Read touches ${WORKSPACE}-2/page.html, outside the run workspace`];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('ignores URLs, the null device, system tools and the body of a heredoc', () => {
      // ARRANGE
      const heredoc = `cat > page.html <<'EOF'\n<div></div>\n<script src="/Users/x.js"></script>\nEOF\n/usr/bin/open page.html`;
      const tools = [
        {
          name: 'Bash',
          input: { command: 'curl -s https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/m.js >/dev/null' },
        },
        { name: 'Bash', input: { command: heredoc } },
        { name: 'WebFetch', input: { url: 'https://example.com/a' } },
      ];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual([]);
    });

    it('resolves a parent folder from where the command changed directory to', () => {
      // ARRANGE
      const tools = [
        { name: 'Bash', input: { command: `cd ${WORKSPACE}/.work && cat head.html > ../ink.html` } },
        { name: 'Bash', input: { command: 'cd .work && cd .. && cd .. && ls' } },
      ];
      const expected = ['Bash touches .., outside the run workspace'];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('reads markup and sed expressions as text: a path outside starts at a real root folder', () => {
      // ARRANGE
      const tools = [
        { name: 'Bash', input: { command: "printf '    </script>\\n  </body>\\n</html>\\n' >> page.html" } },
        { name: 'Bash', input: { command: "sed -i '' 's/a/out/; s/const x/const y/' ui.js" } },
        { name: 'Bash', input: { command: 'cat /etc/hosts' } },
      ];
      const expected = ['Bash touches /etc/hosts, outside the run workspace'];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });

    it('lets a run find an installed browser, and nothing else in the home folder', () => {
      // ARRANGE
      const tools = [
        {
          name: 'Bash',
          input: { command: '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless' },
        },
        { name: 'Bash', input: { command: 'ls ~/.cache/ms-playwright ~/Library/Caches/ms-playwright' } },
        { name: 'Bash', input: { command: 'ls /Applications | grep -i chrome' } },
        { name: 'Bash', input: { command: 'ls ~/Library/Caches/other' } },
      ];
      const expected = ['Bash touches ~/Library/Caches/other, outside the run workspace'];

      // ACT
      const problems = isolationProblems(tools, roots);

      // ASSERT
      expect(problems).toEqual(expected);
    });
  });
});
