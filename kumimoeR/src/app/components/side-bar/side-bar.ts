import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  visibility?: string | number;
  exp?: number;
  [claim: string]: unknown;
}

interface NavItem {
  label: string;
  route: string;
  icon: string; // inline SVG path data (24x24, stroke based)
  adminOnly?: boolean; // requires visibility === "0" in the JWT
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  /** localStorage key where the login JWT is stored. */
  readonly tokenKey = input('token');

  readonly collapsed = signal(false);

  private readonly items: NavItem[] = [
    {
      label: 'Users',
      route: '/users',
      adminOnly: true,
      icon: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0',
    },
    {
      label: 'Friend Tree',
      route: '/friend-tree',
      adminOnly: true,
      icon: 'M12 3v6m0 0-6 5m6-5 6 5M6 14v4m12-4v4M4 20h4m8 0h4M10 20h4',
    },
    {
      label: 'Calendar',
      route: '/calendar',
      icon: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 4h16M8 3v4m8-4v4',
    },
    {
      label: 'Recommendations',
      route: '/recommendations',
      icon: 'm12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-.9L12 3Z',
    },
    {
      label: 'DnD Campaign',
      route: '/dnd-campaign',
      icon: 'm12 2 9 5v10l-9 5-9-5V7l9-5Zm0 0v20M3 7l9 5 9-5',
    },
  ];

  /** Bumped to force the token to be re-read from storage. */
  private readonly tick = signal(0);

  /**
   * False on the server and during the first client render, so both render
   * the same HTML (no admin items) and hydration doesn't mismatch.
   */
  private readonly ready = signal(false);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly payload = computed(() => {
    this.tick();
    return this.ready() ? this.readToken() : null;
  });

  constructor() {
    // Runs in the browser only, after the first render has been hydrated.
    afterNextRender(() => this.ready.set(true));

    // Re-read the token after every navigation, so logging in (which usually
    // redirects) updates the sidebar without a page reload.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.refresh());
  }

  /** True only when the token is valid, not expired, and visibility is "0". */
  readonly canSeeAdminItems = computed(() => {
    const p = this.payload();
    if (!p || this.isExpired(p)) return false;
    return String(p.visibility) === '0';
  });

  readonly visibleItems = computed(() =>
    this.items.filter((item) => !item.adminOnly || this.canSeeAdminItems()),
  );

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  /** Call after login/logout if the sidebar stays mounted across auth changes. */
  refresh(): void {
    this.tick.update((n) => n + 1);
  }

  private isExpired(payload: JwtPayload): boolean {
    return !!payload.exp && payload.exp * 1000 < Date.now();
  }

  private readToken(): JwtPayload | null {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(this.tokenKey()) ?? localStorage.getItem(this.tokenKey());
      const token = raw?.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '');
      return token ? jwtDecode<JwtPayload>(token) : null;
    } catch {
      return null; // storage unavailable, or jwt-decode rejected a malformed token
    }
  }
}
