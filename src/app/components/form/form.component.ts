import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Format, INITIAL_APP_STATE } from '../../app.models';
import { createFormObject } from '../../services/createFormObject';
import { isEmpty, cloneDeep, isEqual } from 'lodash';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'author-arranger-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnChanges {

  @Input()
  fileHeaders: string[] = [];

  @Output('on-change')
  change: EventEmitter<Format> = new EventEmitter<Format>();

  alerts: {type: string, message: string}[] = [];

  formGroup: FormGroup = createFormObject(
    cloneDeep(INITIAL_APP_STATE.format)
  ) as FormGroup;

  ngOnInit() {
    this.formGroup.valueChanges
      .pipe(debounceTime(200))
      .subscribe(value => this.change.emit(value));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileHeaders) {
      const { currentValue, previousValue } = changes.fileHeaders;
      if (!isEqual(currentValue, previousValue))
        this.mapHeaders();
    }
  }

  mapHeaders() {
    this.reset();
    if (isEmpty(this.fileHeaders)) return;

    const headers: string[] = this.fileHeaders.map(header => header.trim());
    const controls = [
      ...(<FormArray>this.formGroup.get('author.fields')).controls,
      ...(<FormArray>this.formGroup.get('affiliation.fields')).controls,
      ...(<FormArray>this.formGroup.get('email.fields')).controls,
    ];

    controls.forEach(control => {
      const name = control.value.name;
      const column = headers.indexOf(name);
      if (column != -1) {
        control.patchValue({column});
      }
    });
  }

  reset() {
    this.formGroup.reset(INITIAL_APP_STATE.format);
  }

}