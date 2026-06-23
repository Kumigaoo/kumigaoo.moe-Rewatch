import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../service/loginService/login-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  @ViewChild('titleScreen', { static: false }) titleRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('instructions', { static: false }) instructionsRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('output', { static: false }) outputRef!: ElementRef<HTMLDivElement>;
  @ViewChild('commandInput', { static: false }) commandInputRef!: ElementRef<HTMLSpanElement>;
  isOnPC = false;
  showPrompt = false;
  showCursor = false;
  isZoomed = false;
  zoomStep = 0;
  private loginState: 'none' | 'awaitingUser' | 'awaitingPassword' = 'none';
  private loginUser = '';
  private realPassword = '';
  constructor(
    private authService: LoginService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}
  async ngOnInit(): Promise<void> {}
  login(email: string, password: string): void {
    console.log(email, password);
    this.authService.login(email, password).subscribe({
      next: (response) => {
        sessionStorage.setItem('token', response.token);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        const output = this.outputRef.nativeElement;
        console.log(error);
        if (error.statusText == 'OK') {
          const msg = error?.error;
          this.writeText(output, `error: ${msg}`);
        } else {
          const msg = error?.statusText || 'Login failed';
          this.writeText(output, `error: ${msg}`);
        }
      },
    });
  }
  async startInput(): Promise<void> {
    if (this.isOnPC) {
      await this.triggerZoom();
    } else {
      this.isOnPC = true;
      const audio = new Audio('assets/PCBOOT.mp3');
      audio.play();
      this.showPrompt = true;
      this.showCursor = true;

      this.cdr.detectChanges();
      await this.writeText(this.titleRef.nativeElement, 'Welcome to KumiOS');
    }
  }

  async triggerZoom(): Promise<void> {
    if (this.zoomStep < 3) {
      this.zoomStep++;
    }
    this.isZoomed = this.zoomStep > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const box = document.getElementById('mainBox');
    if (this.isZoomed && box && !box.contains(event.target as Node)) {
      this.isZoomed = false;
      this.zoomStep = 0;
    }
  }
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    this.handleKeypress(e);
  }

  private writeText(target: HTMLElement, content: string, delay = 10): Promise<void> {
    return new Promise((resolve) => {
      const contentArray = content.split('');
      let current = 0;
      target.innerHTML = '';
      while (current < contentArray.length) {
        ((curr) => {
          setTimeout(() => {
            console.log(target.innerHTML);
            target.innerHTML += contentArray[curr];
            if (typeof window !== 'undefined') {
              console.log('HOLAA');
              window.scrollTo(0, document.body.scrollHeight);
            }
            if (curr === contentArray.length) {
              resolve();
            }
          }, delay * curr);
        })(current++);
      }
    });
  }
  private handleKeypress(e: KeyboardEvent): void {
    const input = this.commandInputRef.nativeElement;
    const output = this.outputRef.nativeElement;

    if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.innerText.trim();
      input.innerHTML = '';

      if (this.loginState === 'awaitingUser') {
        this.loginUser = command;
        this.loginState = 'awaitingPassword';
        output.innerHTML += `<br><strong>${command}</strong><br>`;
        this.writeText(output, 'password:');
      } else if (this.loginState === 'awaitingPassword') {
        this.loginState = 'none';
        output.innerHTML += `<br><strong>********</strong><br>`;
        this.login(this.loginUser, this.realPassword); // use realPassword, not command
        this.loginUser = '';
        this.realPassword = '';
      } else {
        output.innerHTML += `<br><strong>${command}</strong><br>`;
        const result = this.execute(command);
        this.writeText(output, result);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      input.innerHTML = input.innerHTML.substring(0, input.innerHTML.length - 1);
      if (this.loginState === 'awaitingPassword') {
        this.realPassword = this.realPassword.slice(0, -1);
      }
    } else if (e.key.length === 1) {
      if (this.loginState === 'awaitingPassword') {
        this.realPassword += e.key; // store real char
        input.insertAdjacentText('beforeend', '*'); // show * visually
      } else {
        input.insertAdjacentText('beforeend', e.key);
      }
    }
  }

  private execute(command: string): string {
    switch (command.toLowerCase()) {
      case 'login':
        this.loginState = 'awaitingUser';
        return 'user:';
      // ... your other commands
      case '21':
        this.router.navigate(['/birthday']);
        return '';
      default:
        return `command not found: ${command}`;
    }
  }
}
