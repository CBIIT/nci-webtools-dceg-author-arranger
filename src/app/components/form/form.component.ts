import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';


@Component({
  selector: 'author-arranger-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {

  form: FormGroup;

  fieldOrder = [];

  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private ds: DragulaService) {
    this.form = fb.group({
      file: fb.group({
        filename: '',
        files: null,
        data: [],
      }),

      author: fb.group({
        fields: fb.array([
          fb.group({
            name: 'Title',
            column: 'Title',
            addPeriod: false,
            disabled: false,
            index: 0,
          }),

          fb.group({
            name: 'First',
            column: 'First',
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 1,
          }),

          fb.group({
            name: 'Middle',
            column: 'Middle',
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 2,
          }),

          fb.group({
            name: 'Last',
            column: 'Last',
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 3,
          }),

          fb.group({
            name: 'Degree',
            column: 'Degree',
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 4,
          }),

          fb.group({
            name: 'Other',
            column: 'Other',
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 5,
          }),
        ]),
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
      }),

      affiliation: fb.group({
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
        labelStyle: 'numeric',
      }),
    });

    this.form.valueChanges.subscribe(value => {
      console.log(value);
      this.change.emit(value);
    });

    this.form.get('file.files').valueChanges.subscribe((files: FileList) => {
      if (files.length) {
        const file = files[0];
        this.form.get('file.filename').patchValue(file.name);
      } else {
        this.form.get('file.filename').patchValue('');
      }
    });

    ds.drop.subscribe(value => {
      const group: HTMLElement = value[2];
      const controls = (<FormArray>this.form.get('author.fields')).controls;

      Array.from(group.children)
        .forEach((node, index) => controls
          .find(control => control.value.name == node.getAttribute('data-name'))
          .patchValue({index}))
    });
  }

  getColumns() {
    return ['Title', 'First', 'Middle', 'Last', 'Degree', 'Other']
  }

  useExample() {
    const file = this.form.controls.file as FormGroup;

    file.patchValue({
      filename: 'AuthorArranger Example.xlsx',
      data: [],
    });

    console.log('using example...');
  }
}
