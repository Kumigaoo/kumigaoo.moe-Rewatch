import { Routes } from '@angular/router';
import { Menu } from './components/menu/menu';
import { Birthday } from './components/birthday/birthday';

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
];
