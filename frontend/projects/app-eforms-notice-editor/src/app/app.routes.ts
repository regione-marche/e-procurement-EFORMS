import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Routes
} from '@angular/router';
import {
  SdkConfigResolverService,
  SdkEmptyLayoutWidget
} from '@maggioli/sdk-widgets';
import { BackwardGuard } from './guards/backward.guard';
import { navigationGuard } from './guards/navigation.guard';
import { SdkAppWidget } from './modules/sdk-pages/sdk-app.widget';
import { SdkNotFoundWidget } from './modules/sdk-pages/sdk-not-found.widget';
import { LoadingResolver } from './resolvers/loading.resolver';

export const routes: Routes = [
  {
    path: 'page/:slug',
    component: SdkAppWidget,
    resolve: {
      config: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        inject(SdkConfigResolverService).resolve(route, state)
    },
    canActivate: [navigationGuard],
    canDeactivate: [() => inject(BackwardGuard).canDeactivate()]
  },
  {
    path: '',
    component: SdkEmptyLayoutWidget,
    resolve: {
      loading: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        inject(LoadingResolver).resolve(route, state)
    }
  },
  { path: '**', component: SdkNotFoundWidget }
];
