import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../service/loginService/login-service';
@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  @ViewChild('instructions', { static: true }) instructionsRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('output', { static: true }) outputRef!: ElementRef<HTMLDivElement>;
  @ViewChild('commandInput', { static: true }) commandInputRef!: ElementRef<HTMLSpanElement>;

  showPrompt = false;
  showCursor = false;

  constructor(private authService: LoginService) {}
  async ngOnInit(): Promise<void> {
    await this.writeText(this.instructionsRef.nativeElement, 'Enter a command');
    this.showPrompt = true;
    this.showCursor = true;
  }
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
  startInput(): void {
    //remind hacer click 1 vez puedes comenzar a escribir y se enciende el pc
    //click 2 veces y hace zoom la pantalla y el fondo, recuerda que tienes el sonido del pc encendiendose en el chat con alicia hyperflip
    //click fuera deberia salir del zoom pero ya lo pensaras
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
      while (current < contentArray.length + 1) {
        ((curr) => {
          setTimeout(() => {
            console.log(target.innerHTML);
            target.innerHTML += contentArray[curr];
            if (typeof window !== 'undefined') {
              console.log('HOLAA');
              window.scrollTo(0, document.body.scrollHeight);
            }
            if (curr === contentArray.length + 1) {
              resolve();
            }
          }, delay * curr);
        })(current++);
      }
    });
  }

  private handleKeypress(e: KeyboardEvent): void {
    console.log(this.commandInputRef);
    console.log(this.outputRef);
    const input = this.commandInputRef.nativeElement;
    const output = this.outputRef.nativeElement;

    if (e.key === 'Enter') {
      e.preventDefault();
      const command = input.innerText.trim();
      input.innerHTML = '';
      output.innerHTML += `<br><strong>${command}</strong><br>`;
      this.writeText(output, this.execute(command));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      input.innerHTML = input.innerHTML.substring(0, input.innerHTML.length - 1);
    } else if (e.key.length === 1) {
      // Only printable characters
      input.insertAdjacentText('beforeend', e.key);
    }
  }

  private execute(command: string): string {
    switch (command) {
      case 'test':
        return 'Test successful!';
      default:
        return `Unknown command: "${command}"`;
    }
  }
}
