import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { INITIAL_APP_STATE } from '../../app.models';
import { FormArray, FormGroup } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { range as rangeFn } from 'lodash';

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

  @ViewChild('container')
  container: ElementRef;;

  dragOptions = {
    invalid: (el, handle) =>
      handle.getAttribute('drag-handle') === null,
  }

  range = rangeFn;

  constructor(private dragulaService: DragulaService) {
    // set form field indexes when dragged
    this.dragulaService.drop.subscribe(([name, el, parent]: [string, HTMLElement, HTMLElement]) => {
      if (name !== this.formName) return;
      this.reindexControls();
    });
  }

  handleKeyboardEvent(event) {
    if (!this.container) return;

    const containerEl = this.container.nativeElement as HTMLDivElement;
    const rowEl = event.target as HTMLDivElement;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      const nextSibling = rowEl.nextSibling;

      if (nextSibling && nextSibling.constructor === HTMLDivElement) {
        containerEl.insertBefore(nextSibling, rowEl);
        this.reindexControls();
        setTimeout(e => rowEl.focus(), 0);
      }


    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      const previousSibling = rowEl.previousSibling;
      if (previousSibling && previousSibling.constructor === HTMLDivElement) {
        containerEl.insertBefore(rowEl, previousSibling);
        this.reindexControls();
        setTimeout(e => rowEl.focus(), 0);
      }
    }
  }

  reindexControls() {
    const parent = this.container.nativeElement as HTMLDivElement;
    Array.from(parent.children)
    .forEach((node, index) => this.formArray.controls
      .find(control => control.value.name == node.getAttribute('data-name'))
      .patchValue({index}));

    this.formArray.controls = this.formArray.controls.map((control, index, controls) =>
      controls.find(c => c.value.index === index)
    )
  }

  reset(field: FormGroup) {
    const defaultFields = [
      ...INITIAL_APP_STATE.format.author.fields,
      ...INITIAL_APP_STATE.format.affiliation.fields,
    ];

    const defaultValue = defaultFields
      .find(e => e.name === field.value.name);

    field.reset(defaultValue);
  }



}