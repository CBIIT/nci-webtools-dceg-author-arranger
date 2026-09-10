import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'author-arranger-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
