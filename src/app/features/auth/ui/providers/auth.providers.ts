import { makeEnvironmentProviders } from '@angular/core';

import { AUTH_REPOSITORY } from '../../application/ports/auth.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/supabase-auth.repository';

export function provideAuthFeature() {
  return makeEnvironmentProviders([
    { provide: AUTH_REPOSITORY, useClass: SupabaseAuthRepository },
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
  ]);
}
