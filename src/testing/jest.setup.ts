import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

expect.extend(toHaveNoViolations);

setupZonelessTestEnv();
