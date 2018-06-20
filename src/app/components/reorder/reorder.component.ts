import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'author-arranger-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.css']
})
export class ReorderComponent implements OnInit {

  dragOptions = {
    direction: 'horizontal',
    copy: false,
    copySortSource: true,
    invalid: (el, handle) => handle.getAttribute('drag-handle') === null,
  }

  constructor() { }

  ngOnInit() {
  }

}
