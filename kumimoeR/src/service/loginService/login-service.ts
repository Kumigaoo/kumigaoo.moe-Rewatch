import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>('https://localhost:7230/Login/login', { email, password });
  }
}
