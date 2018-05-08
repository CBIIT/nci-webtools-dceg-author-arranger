import { Component } from '@angular/core';

@Component({
  selector: 'author-arranger-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  navbarCollapsed: boolean = true;
}
