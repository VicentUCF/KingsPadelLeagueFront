import { Router, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  it('renders the public shell on the site root', async () => {
    const { fixture } = await render(AppComponent, {
      providers: [provideRouter(routes)],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(screen.getByRole('link', { name: /KingsPadelLeague/i })).toBeVisible();
    expect(screen.queryByRole('heading', { name: /^Dashboard$/i })).not.toBeInTheDocument();
  });

  it('renders the backoffice shell on the backoffice entry route', async () => {
    const { fixture } = await render(AppComponent, {
      providers: [provideRouter(routes)],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    expect(await screen.findByRole('heading', { name: /^Dashboard$/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /KingsPadelLeague/i })).not.toBeInTheDocument();
  });
});
