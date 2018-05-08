import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'author-arranger-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  navbarCollapsed: boolean = true;

  constructor(public router: Router) {}
}
