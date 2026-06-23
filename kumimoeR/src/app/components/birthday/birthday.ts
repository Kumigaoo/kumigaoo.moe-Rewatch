import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-birthday',
  imports: [],
  templateUrl: './birthday.html',
  styleUrl: './birthday.css',
})
export class Birthday implements OnInit, OnDestroy {
  segundos = '00';
  minutos = '00';
  horas = '00';
  dias = '00';

  private end = 1794524400;
  private interval: any;
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.interval = setInterval(() => {
      const left = this.end - Math.floor(new Date().getTime() / 1e3);

      if (left <= 0) {
        clearInterval(this.interval);
        console.log(left);
        return;
      }

      const segundos = Math.floor(left % 60);
      const minutos = Math.floor((left / 60) % 60);
      const horas = Math.floor((left / 3600) % 24);
      const dias = Math.floor(left / 86400);

      this.segundos = segundos.toString().padStart(2, '0');
      this.minutos = minutos.toString().padStart(2, '0');
      this.horas = horas.toString().padStart(2, '0');
      this.dias = dias.toString().padStart(2, '0');
      this.cdr.markForCheck();
    }, 500);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
