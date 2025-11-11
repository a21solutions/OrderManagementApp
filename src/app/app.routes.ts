import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Products & Order Details'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders-list/orders-list.component').then(m => m.OrdersListComponent),
    canActivate: [ (route, state) => inject(AuthGuard).withRoles(['admin','superadmin']).canActivate(route, state) ],
    title: 'Orders'
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./features/placeholder/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [ (route, state) => inject(AuthGuard).withRoles(['superadmin']).canActivate(route, state) ],
    title: 'Admin Dashboard'
  },
  {
    path: 'admin/users/new',
    loadComponent: () => import('./features/admin/superadmin-signup/superadmin-signup.component').then(m => m.SuperadminSignupComponent),
    canActivate: [ (route, state) => inject(AuthGuard).withRoles(['superadmin']).canActivate(route, state) ],
    title: 'Create User'
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/placeholder/shop.component').then(m => m.ShopComponent),
    title: 'Shop'
  },
  {
    path: 'logout',
    loadComponent: () => import('./features/auth/logout/logout.component').then(m => m.LogoutComponent),
    title: 'Logout'
  },
  {
    path: '**',
    redirectTo: 'products'
  }
];
