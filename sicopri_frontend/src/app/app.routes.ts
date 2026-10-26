import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoginComponent } from './login/login.component';
import { Not404Component } from './pages/not404/not404.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'pages', component: LayoutComponent, loadChildren: () =>import('./pages/pages.routes').then((x) => x.pagesRoutes), },
  { path: 'not-404', component: Not404Component},
  { path: '**', redirectTo: 'not-404'}
];


