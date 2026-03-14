import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  type OnDestroy,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-base-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onWindowResize()' },
  template: `
    <section
      class="app-modal"
      [class]="modalClasses()"
      [attr.role]="role()"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-label]="ariaLabel() || null"
    >
      <header class="app-modal__header" [class.app-modal__header--sticky]="headerSticky()">
        <ng-content select="[modalHeader]" />
      </header>
      <div #body class="app-modal__body" (scroll)="onBodyScroll()">
        <ng-content select="[modalBody]" />
        <ng-content />
      </div>
      <footer class="app-modal__footer" [class.app-modal__footer--sticky]="footerSticky()">
        <ng-content select="[modalFooter]" />
      </footer>
    </section>
  `,
})
export class BaseModalComponent implements AfterViewInit, OnDestroy {
  readonly size = input<ModalSize>('md');
  readonly panelClass = input('');
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly ariaLabel = input('');
  readonly ariaLabelledby = input('');
  readonly ariaDescribedby = input('');
  readonly headerSticky = input(true);
  readonly footerSticky = input(true);

  private readonly bodyRef = viewChild<ElementRef<HTMLElement>>('body');
  private resizeObserver?: ResizeObserver;

  private readonly hasOverflow = signal(false);
  private readonly bodyScrolled = signal(false);
  private readonly atEnd = signal(true);

  protected readonly modalClasses = computed(() => {
    const classes = [`app-modal--${this.size()}`, this.panelClass()].filter(Boolean);
    if (this.hasOverflow()) classes.push('app-modal--has-overflow');
    if (this.bodyScrolled()) classes.push('app-modal--body-scrolled');
    if (this.atEnd()) classes.push('app-modal--body-at-end');
    return classes.join(' ');
  });

  ngAfterViewInit(): void {
    this.updateScrollState();
    if (typeof ResizeObserver !== 'undefined' && this.bodyRef()?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.updateScrollState());
      this.resizeObserver.observe(this.bodyRef()!.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected onWindowResize(): void {
    this.updateScrollState();
  }

  protected onBodyScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const body = this.bodyRef()?.nativeElement;
    if (!body) return;
    const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight);
    const scrollTop = Math.max(0, body.scrollTop);
    const threshold = 2;
    this.hasOverflow.set(maxScroll > threshold);
    this.bodyScrolled.set(scrollTop > threshold);
    this.atEnd.set(maxScroll - scrollTop <= threshold);
  }
}
