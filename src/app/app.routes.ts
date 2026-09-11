import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

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
        loadComponent: () =>
          import('./features/builder/builder').then((m) => m.Builder),
        title: 'Builder | PC Forge',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
