import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'author-arranger-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  formValue: any = {};

  constructor() { }

  ngOnInit() {
  }

}
