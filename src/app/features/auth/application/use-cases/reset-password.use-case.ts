import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY } from '../ports/auth.repository';

@Injectable()
export class ResetPasswordUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY);

  execute(newPassword: string): Promise<void> {
    return this.authRepository.resetPassword(newPassword);
  }
}
