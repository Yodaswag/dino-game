// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Controls } from './Controls.jsx';

describe('Controls', () => {
  it('renders a single difficulty slider for the embedded layout', () => {
    render(
      <Controls
        speed={2}
        onSpeedChange={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getAllByRole('slider')).toHaveLength(1);
  });
});
