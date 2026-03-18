import { makeEnvironmentProviders } from '@angular/core';

import { AUTH_REPOSITORY } from '../../application/ports/auth.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { PLAYER_PROFILE_REPOSITORY } from '../../application/ports/player-profile.repository';
import { LoadEditablePlayerProfileUseCase } from '../../application/use-cases/load-editable-player-profile.use-case';
import { UpdateEditablePlayerProfileUseCase } from '../../application/use-cases/update-editable-player-profile.use-case';
import { HttpPlayerProfileRepository } from '../../infrastructure/repositories/http-player-profile.repository';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/supabase-auth.repository';

export function provideAuthFeature() {
  return makeEnvironmentProviders([
    { provide: AUTH_REPOSITORY, useClass: SupabaseAuthRepository },
    { provide: PLAYER_PROFILE_REPOSITORY, useClass: HttpPlayerProfileRepository },
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    LoadEditablePlayerProfileUseCase,
    UpdateEditablePlayerProfileUseCase,
  ]);
}
