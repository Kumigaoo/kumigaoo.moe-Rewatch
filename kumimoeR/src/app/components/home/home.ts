import { Component } from '@angular/core';
import { SidebarComponent } from '../side-bar/side-bar';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
