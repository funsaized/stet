import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, stet');
  });

  it('should render every Stet annotation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    for (const kind of ['arrow', 'circle', 'highlight', 'sticky', 'underline']) {
      expect(document.querySelectorAll(`.stet-overlay--${kind}`).length).toBe(1);
    }
    expect(document.querySelectorAll('.stet-overlay--mark').length).toBe(2);
    expect(document.querySelector('.stet-mark--right')).not.toBeNull();
    expect(document.querySelector('.stet-mark--wrong')).not.toBeNull();
  });
});
