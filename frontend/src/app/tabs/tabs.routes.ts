import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('../home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'search',
    loadComponent: () => import('../search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'favorites',
    loadComponent: () => import('../favorites/favorites.page').then((m) => m.FavoritesPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('../admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
