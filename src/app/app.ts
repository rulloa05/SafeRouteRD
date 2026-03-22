import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`:host {
    display: block;
    max-width: 430px;
    margin: 0 auto;
    min-height: 100dvh;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 60% at 5%   5%,  rgba(13,185,150,.45) 0%, transparent 55%),
      radial-gradient(ellipse 60% 55% at 95%  95%, rgba(80,0,180,.4)    0%, transparent 55%),
      radial-gradient(ellipse 50% 70% at 40%  45%, rgba(0,60,180,.35)   0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 80%  15%, rgba(180,0,100,.2)   0%, transparent 50%),
      #060d1a;
    box-shadow: 0 0 80px rgba(0,0,0,.6);
  }`],
})
export class App {}
