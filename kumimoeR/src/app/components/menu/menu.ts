import { Component } from '@angular/core';
import { LoginService } from '../../../service/loginService/login-service';
@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  constructor(private authService: LoginService) {}
  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe({
      next: (response) => {
        sessionStorage.setItem('token', response.token);
      },
      error: (error) => {
        console.error('Login failed', error);
      },
    });
  }
}
