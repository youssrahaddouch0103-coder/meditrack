import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: Theme = 'dark';

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.currentTheme = savedTheme;
      }
    }
    this.applyTheme(this.currentTheme);
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  public toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-theme', this.currentTheme);
    }
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (theme === 'light') {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
      } else {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
      }
    }
  }
}
