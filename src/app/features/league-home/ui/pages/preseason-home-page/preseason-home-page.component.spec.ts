import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { PreseasonHomePageComponent } from './preseason-home-page.component';

describe('PreseasonHomePageComponent', () => {
  it('renders the temporary preseason message, champion and RedLions update', async () => {
    await render(PreseasonHomePageComponent);

    expect(screen.getByRole('heading', { name: /Pretemporada KingsPadelLeague/i })).toBeVisible();
    expect(screen.getByText(/Titanics cerró la temporada como campeón/i)).toBeVisible();
    expect(screen.getByText(/RedLions se une/i)).toBeVisible();
    expect(screen.getByText(/Nuevas noticias próximamente/i)).toBeVisible();
    expect(screen.getByAltText(/Escudo de Titanics/i)).toBeVisible();
    expect(screen.getByAltText(/Escudo de RedLions/i)).toBeVisible();
  });

  it('publishes the final ranking in the requested order without creating RedLions links', async () => {
    await render(PreseasonHomePageComponent);

    const ranking = screen.getByRole('list', {
      name: /Ranking final de la temporada terminada/i,
    });
    const renderedEntries = within(ranking).getAllByRole('listitem');

    expect(renderedEntries.map((entry) => entry.textContent?.replace(/\s+/g, '').trim())).toEqual([
      '1TitanicsCampeón',
      '2MagicCity2ªposición',
      '3Thormentadores3ªposición',
      '4BarbaridadTeam4ªposición',
      '5KingsOfFavar5ªposición',
    ]);
    const rankingLogos = Array.from(
      ranking.querySelectorAll<HTMLImageElement>('.preseason-home-page__ranking-logo'),
    );

    expect(rankingLogos.map((logo) => logo.getAttribute('src'))).toEqual([
      '/teams_logos/titanics_no_bg.webp',
      '/teams_logos/magic_ng_bg.webp',
      '/teams_logos/Thormentadores.webp',
      '/teams_logos/barbarida_no_bg.webp',
      '/teams_logos/Kings_of_Favar_no_bg.webp',
    ]);
    expect(screen.queryByRole('link', { name: /RedLions/i })).not.toBeInTheDocument();
  });

  it('has no accessibility violations in the preseason snapshot', async () => {
    const { container } = await render(PreseasonHomePageComponent);

    expect(screen.getByRole('heading', { name: /Pretemporada KingsPadelLeague/i })).toBeVisible();

    expect(await axe(container)).toHaveNoViolations();
  });
});
