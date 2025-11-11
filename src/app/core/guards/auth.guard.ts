import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // Factory method to create a guard with required roles
  withRoles(requiredRoles: UserRole[]): CanActivate {
    return {
      canActivate: (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => this.checkAuthorization(requiredRoles, state.url)
    } as CanActivate;
  }

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    // Default guard behavior: only check that user is logged in
    return this.checkAuthorization(['admin','superadmin','user'], state.url);
  }

  private checkAuthorization(requiredRoles: UserRole[], returnUrl: string): Observable<boolean | UrlTree> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl } }));
        }
        return this.authService.isAuthorized(requiredRoles).pipe(
          map(isOk => isOk ? true : this.router.createUrlTree(['/login'], { queryParams: { returnUrl } })),
          catchError(() => of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl } })))
        );
      })
    );
  }
}
