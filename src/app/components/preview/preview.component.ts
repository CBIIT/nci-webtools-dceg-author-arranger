import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  @Input()
  data: any;

  constructor() { }

  downloadPreview() {
    console.log('generating download...')
  }

  ngOnInit() {
  }

}
