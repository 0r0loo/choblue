import "../src/globals.css";
import type { Preview, ReactRenderer } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes';
import { createElement } from 'react';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ["Foundation", "UI"],
      },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) =>
      createElement(
        'div',
        {
          className: 'bg-background text-foreground',
          style: { padding: '1rem' },
        },
        createElement(Story),
      ),
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
};

export default preview;
