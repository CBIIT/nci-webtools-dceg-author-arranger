import { Component, Input } from '@angular/core';
import { FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'author-arranger-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css']
})
export class FieldsComponent {

  @Input()
  fileHeaders: string[] = [];

  @Input()
  formArray: FormArray;

  @Input()
  formName: string;

  @Input()
  draggable: boolean = true;

  dragOptions = {
    invalid: (el, handle) =>
      handle.getAttribute('drag-handle') === null,
  }

  constructor(private dragulaService: DragulaService) {
    // set form field indexes when dragged
    this.dragulaService.drop.subscribe(([name, el, parent]: [string, HTMLElement, HTMLElement]) => {
      if (name !== this.formName) return;
      Array.from(parent.children)
        .forEach((node, index) => this.formArray.controls
          .find(control => control.value.name == node.getAttribute('data-name'))
          .patchValue({index}))
    });
  }
}