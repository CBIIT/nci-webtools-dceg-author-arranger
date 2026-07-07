import { Component, Input } from '@angular/core';
import { INITIAL_APP_STATE } from '../../app.models';
import { FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { range as rangeFn } from 'lodash';

@Component({
  selector: 'author-arranger-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.css'],
  standalone: false,
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

  range = rangeFn;

  drop(event: CdkDragDrop<unknown>) {
    this.moveControl(event.previousIndex, event.currentIndex);
  }

  handleKeyboardEvent(event: KeyboardEvent, index: number) {
    if (!this.draggable) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      if (index < this.formArray.controls.length - 1) {
        this.moveControl(index, index + 1);
        this.refocus(index + 1);
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      if (index > 0) {
        this.moveControl(index, index - 1);
        this.refocus(index - 1);
      }
    }
  }

  private moveControl(previousIndex: number, currentIndex: number) {
    moveItemInArray(this.formArray.controls, previousIndex, currentIndex);
    this.formArray.controls.forEach((control, index) => control.patchValue({ index }));
    this.formArray.updateValueAndValidity();
  }

  private refocus(index: number) {
    setTimeout(() => {
      const name = this.formArray.controls[index]?.value.name;
      const el = document.querySelector(`[data-name="${name}"]`) as HTMLElement;
      if (el) el.focus();
    }, 0);
  }

  reset(field: FormGroup) {
    const defaultFields = [
      ...INITIAL_APP_STATE.format.author.fields,
      ...INITIAL_APP_STATE.format.affiliation.fields,
      ...INITIAL_APP_STATE.format.email.fields,
    ];

    const defaultValue = defaultFields
      .find(e => e.name === field.value.name);

    field.reset(defaultValue);
  }
}
