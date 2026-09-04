import { Component, signal } from '@angular/core';
import {
  StetArrowDirective,
  StetCircleDirective,
  StetHighlightDirective,
  StetMarkDirective,
  StetStickyDirective,
  StetUnderlineDirective,
} from 'stet/angular';

@Component({
  selector: 'app-root',
  imports: [
    StetArrowDirective,
    StetCircleDirective,
    StetHighlightDirective,
    StetMarkDirective,
    StetStickyDirective,
    StetUnderlineDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('stet');
}
