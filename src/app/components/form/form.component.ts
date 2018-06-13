import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { FormatParameters } from '../../app.models';
import { FileService } from '../../services/file/file.service';
import { ArrangerService } from '../../services/arranger/arranger.service';

@Component({
  selector: 'author-arranger-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {

  @Output()
  change: EventEmitter<FormatParameters> = new EventEmitter<FormatParameters>();

  alerts: {type: string, message: string}[] = [];

  loading: boolean = false;

  form: FormGroup = null;

  dragOptions = {
    invalid: (el, handle) => handle.getAttribute('drag-handle') === null
  }

  defaultHeaders = ["Title", "First", "Middle", "Last", "Degree", "Other", "Email", "Department", "Division", "Institute", "Street", "City", "State", "Postal Code", "Country"];

  defaultParameters: FormatParameters = {
    file: {
      filename: '',
      files: null,
      data: [],
      headers: [],
    },

    author: {
      fields: [
        {
          name: 'Title',
          column: null,
          addPeriod: true,
          disabled: false,
          index: 0,
        },

        {
          name: 'First',
          column: null,
          abbreviate: false,
          addPeriod: false,
          removeSpace: false,
          disabled: false,
          index: 1,
        },

        {
          name: 'Middle',
          column: null,
          abbreviate: false,
          addPeriod: false,
          removeSpace: false,
          disabled: false,
          index: 2,
        },

        {
          name: 'Last',
          column: null,
          abbreviate: false,
          addPeriod: false,
          disabled: false,
          index: 3,
        },

        {
          name: 'Degree',
          column: null,
          addComma: false,
          addPeriod: false,
          disabled: false,
          index: 4,
        },

        {
          name: 'Other',
          column: null,
          addComma: false,
          addPeriod: false,
          disabled: false,
          index: 5,
        },
      ],
      separator: 'comma',
      customSeparator: '',
      labelPosition: 'superscript',
    },

    affiliation: {
      fields: [
        {
          name: 'Department',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 0,
        },

        {
          name: 'Division',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 1,
        },

        {
          name: 'Institute',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 2,
        },

        {
          name: 'Street',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 3,
        },

        {
          name: 'City',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 4,
        },

        {
          name: 'State',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 5,
        },

        {
          name: 'Postal Code',
          column: null,
          addComma: true,
          addPeriod: false,
          index: 6,
        },

        {
          name: 'Country',
          column: null,
          addComma: false,
          addPeriod: false,
          index: 7,
        },
      ],
      separator: 'comma',
      customSeparator: '',
      labelPosition: 'superscript',
      labelStyle: 'numbers',
    },

    email: {
      field:{
        name: 'Email',
        column: null,
        index: 0,
      }
    },
  };

  constructor(
    private fb: FormBuilder,
    private as: ArrangerService,
    private ds: DragulaService,
    private fs: FileService) {

    this.form = fb.group({
      file: fb.group({
        filename: '',
        files: null,
        data: [],
        headers: [],
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
            removeSpace: false,
            disabled: false,
            index: 1,
          }),

          fb.group({
            name: 'Middle',
            column: null,
            abbreviate: false,
            addPeriod: false,
            removeSpace: false,
            disabled: false,
            index: 2,
          }),

          fb.group({
            name: 'Last',
            column: null,
            addComma: false,
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
        fields: fb.array([
          fb.group({
            name: 'Department',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 0,
          }),

          fb.group({
            name: 'Division',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 1,
          }),

          fb.group({
            name: 'Institute',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 2,
          }),

          fb.group({
            name: 'Street',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 3,
          }),

          fb.group({
            name: 'City',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 4,
          }),

          fb.group({
            name: 'State',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 5,
          }),

          fb.group({
            name: 'Postal Code',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 6,
          }),

          fb.group({
            name: 'Country',
            column: null,
            addComma: false,
            addPeriod: false,
            index: 7,
          }),
        ]),
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
        labelStyle: 'numbers',
      }),

      email: fb.group({
        field: fb.group({
          name: 'Email',
          column: null,
          index: 0,
        }),
      }),
    });

    this.form.valueChanges.subscribe((value: FormatParameters) => {
      this.change.emit(value);
    });

    this.form.get('file.files').valueChanges.subscribe(async (files: FileList) => {
      try {
        this.resetForm({file: {
          filename: '',
          files: files,
          data: []
        }});

        // early exit if no file exists
        if (!files || files.length == 0) return;

        this.loading = true;
        const file = files[0];

        // read file bytes into ArrayBuffer
        const bytes = await this.fs.readFile(file);

        // validate workbook metadata (avoid loading invalid workbooks)
        const properties = await this.fs.getProperties(bytes);

        // ensure the workbook contains an "Authors" sheet
        if (properties && !(properties.SheetNames || []).includes('Authors')) {
          throw({
            type: 'danger',
            message: 'Please ensure the workbook contains an "Authors" sheet.'
          });
        }

        const sheets = await fs.getSheets(bytes);

        // if there is only one sheet, use the first sheet
        const sheet = sheets.length === 1
          ? sheets[0]
          : sheets.find(sheet => sheet.name == 'Authors');

        if (sheet.data.length <= 1) {
          throw({
            type: 'info',
            message: sheet.name == 'Authors'
              ? 'The input file contains no data in the Authors sheet.'
              : 'The input file contains no data.'
          });
        }

        // retrieve file headers
        const fileHeaders = sheet.data.shift() as Array<any>;

        if (fileHeaders.length < 2) {
          throw({
            type: 'warning',
            message: 'The file does not contain valid columns.'
          });
        }

        // map file headers to columns with the same name
        if (!this.mapHeaders(fileHeaders)) {
          this.alerts.push({
            type: 'warning',
            message: 'The file contains columns not found in the template. Please ensure these columns are properly mapped in the fields below.'
          });
        }

        // update form value
        this.form.get('file').patchValue({
          filename: file.name,
          headers: fileHeaders,
          data: sheet.data,
        });

      } catch (e) {
        this.resetForm();

        if (e.type && e.message && e.constructor != ErrorEvent) {
          this.alerts.push(e);
        } else {
          console.log(e);
          this.alerts.push({
            type: 'danger',
            message: 'An error occured while parsing the workbook.',
          });
        }
      } finally {
        this.change.emit(this.form.value);
        this.loading = false;
      }
    });

    // set form field indexes when dragged
    ds.drop.subscribe((value: [string, HTMLElement, HTMLElement]) => {
      const parent = value[2];
      const formArray = value[0];

      if (!['author.fields', 'affiliation.fields'].includes(formArray))
        return;

      Array.from(parent.children)
        .forEach((node, index) => (<FormArray>this.form.get(formArray)).controls
          .find(control => control.value.name == node.getAttribute('data-name'))
          .patchValue({index}))
    });
  }

  mapHeaders(headers: string[]): boolean {
    let validHeaders = true;

    headers.forEach((header, column) => {

      if (this.defaultHeaders.includes(header)) {
        let control = [
          ...(<FormArray>this.form.get('author.fields')).controls,
          ...(<FormArray>this.form.get('affiliation.fields')).controls,
          this.form.get('email.field')
        ].find((item: FormGroup) => item.value.name == header);

        control && control.patchValue({column});
      }

      // otherwise, unknown headers must be manually mapped
      else
        validHeaders = false;
    });

    return validHeaders;
  }

  resetForm(parameters = {}) {
    this.alerts = [];
    this.form.reset({
      ...this.defaultParameters,
      ...parameters
    }, {emitEvent: false});
    this.form.updateValueAndValidity();
  }

  async useExample() {
    try {
      this.loading = true;
      const bytes = await this.fs.readRemoteFile('assets/files/AuthorArranger Template.xlsx');
      const sheets = await this.fs.getSheets(bytes);

      const data = sheets.find(sheet => sheet.name === 'Example').data;
      data.shift(); // remove first row (headers)

      this.resetForm({
        file: {
          filename: 'AuthorArranger Sample.xlsx',
          headers: [...this.defaultHeaders],
          data,
        }
      });
      this.mapHeaders(this.defaultHeaders);
    } catch(e) {
      console.log(e);
    } finally {
      this.loading = false;
    }
  }
}
