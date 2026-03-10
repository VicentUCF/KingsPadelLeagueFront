import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the application shell', async () => {
    await render(AppComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('link', { name: /padel fantasy/i })).toBeVisible();
  });
});
