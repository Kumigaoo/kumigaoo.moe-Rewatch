import { Routes } from '@angular/router';
import { Menu } from './components/menu/menu';
import { Birthday } from './components/birthday/birthday';
import { Home } from './components/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Menu,
    title: 'Menu',
  },
  {
    path: 'birthday',
    component: Birthday,
  },
  {
    path: 'home',
    component: Home,
  },
];
