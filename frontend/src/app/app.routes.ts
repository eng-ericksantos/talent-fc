import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.component').then((m) => m.TabsComponent),
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
