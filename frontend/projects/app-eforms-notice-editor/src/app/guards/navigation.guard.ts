import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot
} from '@angular/router';
import { SdkRouterService } from '@maggioli/sdk-commons';
import { tap } from 'rxjs';
import { ApiService } from '../services/api.service';

export const navigationGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  let routerService: SdkRouterService = inject(SdkRouterService);
  if (route.params['slug'] == 'cannot-load-page') {
    return true;
  }
  return inject(ApiService)
    .canActivate(route.params['slug'])
    .pipe(
      tap((result: boolean) => {
        if (!result) {
          routerService.navigateToPage('cannot-load-page');
        }
      })
    );
};
