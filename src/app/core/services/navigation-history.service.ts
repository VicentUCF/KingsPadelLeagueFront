import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private readonly router = inject(Router);
  private readonly history: string[] = [];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.history.push(event.urlAfterRedirects);
      });
  }

  goBack(fallback = '/'): void {
    this.history.pop();
    const previous = this.history.pop();
    void this.router.navigateByUrl(previous ?? fallback);
  }

  canGoBack(): boolean {
    return this.history.length > 1;
  }
}
