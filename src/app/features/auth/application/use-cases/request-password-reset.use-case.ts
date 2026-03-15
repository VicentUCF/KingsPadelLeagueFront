import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY } from '../ports/auth.repository';

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY);

  execute(email: string): Promise<void> {
    return this.authRepository.requestPasswordReset(email);
  }
}
