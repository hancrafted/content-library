import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('success cases', () => {
  it.each(['text-body', 'text-caption', 'text-subheading', 'text-heading', 'text-hero'])(
    'keeps the type role %s beside the colour after it',
    (role) => {
      // ARRANGE
      const colour = 'text-foreground';

      // ACT
      const merged = cn(role, colour);

      // ASSERT
      expect(merged).toBe(`${role} text-foreground`);
    },
  );
});

describe('failure cases', () => {
  it('drops the earlier of two colours', () => {
    // ARRANGE
    const classes = ['text-body text-muted-foreground', 'text-foreground'];

    // ACT
    const merged = cn(...classes);

    // ASSERT
    expect(merged).toBe('text-body text-foreground');
  });
});

describe('edge cases', () => {
  it('lets a later type role replace an earlier one', () => {
    // ARRANGE
    const classes = ['text-body', 'text-caption'];

    // ACT
    const merged = cn(...classes);

    // ASSERT
    expect(merged).toBe('text-caption');
  });
});
