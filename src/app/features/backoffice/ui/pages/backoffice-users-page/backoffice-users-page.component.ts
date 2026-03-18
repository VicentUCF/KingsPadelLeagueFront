import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import {
  toBackofficeUserCardViewModel,
  type BackofficeUserCardViewModel,
  type BackofficeUserRole,
} from '../../models/backoffice-users.viewmodel';

type UserSegment = 'all' | 'president' | 'player' | 'unlinked';
type ConfirmAction = 'unlink' | 'resend-invite';

interface ConfirmState {
  readonly action: ConfirmAction;
  readonly user: BackofficeUserCardViewModel;
}

type RegisterStep = 0 | 1;

type PlayerFormGroup = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  alias: FormControl<string>;
  email: FormControl<string>;
  preferredPosition: FormControl<'left' | 'right' | 'both'>;
  teamId: FormControl<string>;
  isPresident: FormControl<boolean>;
}>;

type RegisterFormGroup = PlayerFormGroup;

@Component({
  selector: 'app-backoffice-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-users-page' },
  imports: [
    LoadFeedbackComponent,
    LoadingStateComponent,
    LucideAngularModule,
    StatusBadgeComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './backoffice-users-page.component.html',
  styleUrl: './backoffice-users-page.component.scss',
})
export class BackofficeUsersPageComponent implements OnInit {
  private readonly playersStore = inject(BackofficePlayersStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);

  protected readonly chevronDownIcon = ChevronDown;
  protected readonly searchTerm = signal('');
  protected readonly segment = signal<UserSegment>('all');
  protected readonly confirmState = signal<ConfirmState | null>(null);

  // ── Invite modal ─────────────────────────────────────────────────────────
  protected readonly inviteModalOpen = signal(false);
  protected readonly inviteEmail = signal('');
  protected readonly inviteRole = signal<BackofficeUserRole>('player');

  // ── Edit modal ────────────────────────────────────────────────────────────
  protected readonly editModalOpen = signal(false);
  protected readonly editTarget = signal<BackofficeUserCardViewModel | null>(null);
  protected readonly editForm: PlayerFormGroup = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    alias: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    preferredPosition: new FormControl<'left' | 'right' | 'both'>('right', { nonNullable: true }),
    teamId: new FormControl('', { nonNullable: true }),
    isPresident: new FormControl(false, { nonNullable: true }),
  });

  // ── Register (dar de alta) modal ──────────────────────────────────────────
  protected readonly registerModalOpen = signal(false);
  protected readonly registerStep = signal<RegisterStep>(0);
  protected readonly registerForm: RegisterFormGroup = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    alias: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    preferredPosition: new FormControl<'left' | 'right' | 'both'>('right', { nonNullable: true }),
    teamId: new FormControl('', { nonNullable: true }),
    isPresident: new FormControl(false, { nonNullable: true }),
  });

  // ── Derived data ──────────────────────────────────────────────────────────
  protected readonly allCards = computed<readonly BackofficeUserCardViewModel[]>(() => {
    const players = this.playersStore.players();
    const teams = this.teamsStore.teams();
    return players.map((p) =>
      toBackofficeUserCardViewModel(p, teams.find((t) => t.id === p.teamId) ?? null),
    );
  });

  protected readonly filteredCards = computed<readonly BackofficeUserCardViewModel[]>(() => {
    const term = this.searchTerm().toLowerCase();
    const seg = this.segment();
    return this.allCards().filter((c) => {
      if (seg !== 'all' && c.role !== seg) return false;
      if (!term) return true;
      return (
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.teamName.toLowerCase().includes(term)
      );
    });
  });

  protected readonly linkedCount = computed(() => this.allCards().filter((c) => c.hasEmail).length);
  protected readonly presidentCount = computed(
    () => this.allCards().filter((c) => c.role === 'president').length,
  );
  protected readonly unlinkedCount = computed(
    () => this.allCards().filter((c) => c.role === 'unlinked').length,
  );
  protected readonly isLoading = computed(
    () => this.playersStore.isLoading() || this.teamsStore.isLoading(),
  );
  protected readonly hasContent = computed(
    () => this.playersStore.hasContent() && this.teamsStore.hasContent(),
  );
  protected readonly errorMessage = computed(
    () => this.playersStore.errorMessage() ?? this.teamsStore.errorMessage(),
  );

  protected readonly segments: readonly {
    value: UserSegment;
    label: string;
    count: () => number;
  }[] = [
    { value: 'all', label: 'Todos', count: () => this.allCards().length },
    { value: 'president', label: 'Presidentes', count: () => this.presidentCount() },
    {
      value: 'player',
      label: 'Jugadores',
      count: () => this.allCards().filter((c) => c.role === 'player').length,
    },
    { value: 'unlinked', label: 'Sin cuenta', count: () => this.unlinkedCount() },
  ];

  protected readonly roleOptions: readonly { value: BackofficeUserRole; label: string }[] = [
    { value: 'player', label: 'Jugador' },
    { value: 'president', label: 'Presidente' },
  ];

  protected readonly positionOptions: readonly {
    value: 'left' | 'right' | 'both';
    label: string;
  }[] = [
    { value: 'right', label: 'Drive (Derecha)' },
    { value: 'left', label: 'Revés (Izquierda)' },
    { value: 'both', label: 'Ambas posiciones' },
  ];

  ngOnInit(): void {
    void this.playersStore.load();
    void this.teamsStore.load();
  }

  protected reloadUsers(): void {
    void Promise.all([this.playersStore.load(true), this.teamsStore.load(true)]);
  }

  // ── Confirm ───────────────────────────────────────────────────────────────

  protected openConfirm(action: ConfirmAction, user: BackofficeUserCardViewModel): void {
    this.confirmState.set({ action, user });
  }

  protected closeConfirm(): void {
    this.confirmState.set(null);
  }

  protected confirmAction(): void {
    // TODO: wire to API
    this.confirmState.set(null);
  }

  protected confirmLabel(action: ConfirmAction): string {
    return action === 'unlink' ? 'Desvincular cuenta' : 'Reenviar invitación';
  }

  protected confirmDescription(state: ConfirmState): string {
    if (state.action === 'unlink') {
      return `Se eliminará la vinculación de cuenta de ${state.user.fullName}. El jugador quedará sin acceso hasta que se vuelva a vincular.`;
    }
    return `Se enviará un correo de invitación a ${state.user.email} para que ${state.user.fullName} configure su acceso.`;
  }

  // ── Register (dar de alta) ────────────────────────────────────────────────

  protected openRegisterModal(): void {
    this.registerForm.reset({
      firstName: '',
      lastName: '',
      alias: '',
      email: '',
      preferredPosition: 'right',
      teamId: '',
      isPresident: false,
    });
    this.registerStep.set(0);
    this.registerModalOpen.set(true);
  }

  protected closeRegisterModal(): void {
    this.registerModalOpen.set(false);
  }

  protected registerNextStep(): void {
    const { firstName, lastName } = this.registerForm.controls;
    if (firstName.invalid || lastName.invalid) {
      firstName.markAsTouched();
      lastName.markAsTouched();
      return;
    }
    this.registerStep.set(1);
  }

  protected registerPrevStep(): void {
    this.registerStep.set(0);
  }

  protected submitRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    // TODO: wire to API
    this.registerModalOpen.set(false);
  }

  protected hasRegisterError(control: keyof RegisterFormGroup['controls']): boolean {
    const c = this.registerForm.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  protected openEditModal(user: BackofficeUserCardViewModel): void {
    this.editTarget.set(user);
    this.editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      alias: user.alias,
      email: user.email,
      preferredPosition: user.preferredPosition,
      teamId: user.teamId ?? '',
      isPresident: user.role === 'president',
    });
    this.editModalOpen.set(true);
  }

  protected closeEditModal(): void {
    this.editModalOpen.set(false);
  }

  protected submitEdit(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    // TODO: wire to API
    this.editModalOpen.set(false);
  }

  protected hasEditError(control: keyof PlayerFormGroup['controls']): boolean {
    const c = this.editForm.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }
}
