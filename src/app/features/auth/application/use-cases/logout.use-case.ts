import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY } from '../ports/auth.repository';

@Injectable()
export class LogoutUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY);

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
