import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RedirectCommand,
  Router,
  Routes,
} from '@angular/router';
import { CATEGORY_META } from './core/config/categories';
import { ALL_CATEGORIES, PartCategory } from './core/models/part.model';
import { Shell } from './layout/shell/shell';

function isPartCategory(value: string | null): value is PartCategory {
  return !!value && (ALL_CATEGORIES as readonly string[]).includes(value);
}

const categoryGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  if (isPartCategory(route.paramMap.get('category'))) {
    return true;
  }
  return new RedirectCommand(inject(Router).createUrlTree(['/builder', 'cpu']));
};

function categoryTitle(route: ActivatedRouteSnapshot): string {
  const meta = CATEGORY_META.find((c) => c.id === route.paramMap.get('category'));
  return meta ? `${meta.label} | PC Forge` : 'Builder | PC Forge';
}

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'PC Forge',
      },
      {
        path: 'builder',
        pathMatch: 'full',
        redirectTo: 'builder/cpu',
      },
      {
        path: 'builder/:category',
        loadComponent: () =>
          import('./features/builder/builder').then((m) => m.Builder),
        title: categoryTitle,
        canActivate: [categoryGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
