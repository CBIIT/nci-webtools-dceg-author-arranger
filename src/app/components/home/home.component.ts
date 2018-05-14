import { Component } from '@angular/core';
import { FormatParameters } from '../../app.models';

@Component({
  selector: 'author-arranger-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  formValue: FormatParameters;
}
