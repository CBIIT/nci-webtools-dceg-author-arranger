import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { ParserService } from '../../services/parser/parser.service';

@Component({
  selector: 'author-arranger-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {

  alerts = [];

  form: FormGroup;

  templateHeaders = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Affiliations', 'Other']
  headers = [];

  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private ds: DragulaService,
    private ps: ParserService) {
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
            column: null,
            addPeriod: true,
            disabled: false,
            index: 0,
          }),

          fb.group({
            name: 'First',
            column: null,
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 1,
          }),

          fb.group({
            name: 'Middle',
            column: null,
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 2,
          }),

          fb.group({
            name: 'Last',
            column: null,
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 3,
          }),

          fb.group({
            name: 'Degree',
            column: null,
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 4,
          }),

          fb.group({
            name: 'Other',
            column: null,
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
      this.change.emit(value);
    });

    this.form.get('file.files').valueChanges.subscribe(async (files: FileList) => {
      try {
        const sheets = await ps.parse(files[0])
        let validHeaders = true;

        let sheetData = []
        this.headers = [];
        this.alerts = [];

        const controls = (this.form.get('author.fields') as FormArray).controls;
        controls.forEach(control => control.patchValue({column: null}));

        // if there is more than one sheet
        if (sheets.length > 1) {
          const sheet = sheets.find(sheet => sheet.name == 'Template');
          if (!sheet) {
            this.alerts.push({
              type: 'warning',
              message: 'Please ensure the workbook contains a sheet named "Template".'
            });
            return;
          } else {
            sheetData = sheet.data;
          }
        } else if (sheets.length == 1) {
          sheetData = sheets[0].data;
        }

        if (sheetData.length <= 1) {
          this.alerts.push({
            type: 'warning',
            message: 'No data could be parsed from the file.'
          });
          return;
        }

        this.headers = sheetData[0];

        // attempt to match file headers with form fields
        for (let header of this.headers) {
          const controls = (this.form.get('author.fields') as FormArray).controls;
          controls.forEach(control => control.patchValue({column: null}));
          const control = controls.find((item: FormGroup) => item.value.name == header);
          if (control) {
            setTimeout(() => control.patchValue({column: this.headers.indexOf(header)}), 0);
          } else if (!this.templateHeaders.includes(header)) {
            validHeaders = false;
          }
        }

        if (!validHeaders) {
          this.alerts.push({
            type: 'info',
            message: `The file contains headers not found in the template. Please ensure these headers are mapped properly in the fields below.`
          });
        }

        if (!this.headers.includes('Affiliations')) {
          this.alerts.push({
            type: 'danger',
            message: `The file does not contain an "Affiliations" header.`
          });
          return;
        }

        this.form.get('file').patchValue({data: sheetData});
      } catch (e) {
        this.alerts.push({
          type: 'danger',
          message: 'Please upload a valid excel workbook.'
        });
      }
    })

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

    const controls = this.form.controls;
    const file = this.form.controls.file as FormGroup;
    file.patchValue({
      filename: 'AuthorArranger Example.xlsx',
      data: [
        ["Title","First","Middle","Last","Degree","Affiliations","Other"],
        ["Dr","Mitchell","John","Machiela","ScD; MPH","Integrative Tumor Epidemiology Branch, Division of Cancer Epidemiology and Genetics, National Cancer Institute, Rockville, MD, USA"],
        ["Mr","Geoffrey",null,"Tobias","BS","Office of the Directory, Division of Cancer Epidemiology and Genetics, National Cancer Institute, Rockville, MD, USA"],
        ["Ms","Sue",null,"Pan","MS","Center for Biomedical Informatics and Information Technology, National Cancer Institude, Rockville, MD, USA"]
      ],
    });

    this.headers = [...this.templateHeaders];
    this.headers.forEach((header, index) => {
      setTimeout(() => {
        const controls = (<FormArray>this.form.get('author.fields')).controls;
        let control = controls.find(control => control.value.name == header);
        if (control) {
          let column = this.headers.indexOf(header);
          control.patchValue({column, index})
        };
      }, 0);
    })


  }
}
