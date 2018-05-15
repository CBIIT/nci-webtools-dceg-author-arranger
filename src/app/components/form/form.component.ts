import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { ParserService } from '../../services/parser/parser.service';
import { FormatParameters } from '../../app.models';

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

  defaultHeaders = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Affiliations', 'Other']

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
      column: null,
      separator: 'comma',
      customSeparator: '',
      labelPosition: 'superscript',
      labelStyle: 'numbers',
    },
  };

  constructor(
    private fb: FormBuilder,
    private ds: DragulaService,
    private ps: ParserService) {

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
        column: null,
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
        labelStyle: 'numbers',
      }),
    });

    this.form.valueChanges.subscribe((value: FormatParameters) => {
      this.change.emit(value);
    });

    this.form.get('file.files').valueChanges.subscribe(async (files: FileList) => {
      try {
        this.alerts = [];
        this.resetForm({file: {
          filename: '',
          files: files,
          data: []
        }});

        if (!files || files.length == 0) {
          return;
        }

        const file = files[0];

        // only show loading indicator if file is above 512 kb
        if (file.size > 512 * 1024)
          this.loading = true;

        const sheets = await ps.parse(file);
        this.loading = false;
        this.alerts.pop();

        if (sheets.length == 0) {
          throw({
            type: 'danger',
            message: 'The workbook contains no sheets.'
          });
        }

        // if there is only one sheet, use the first sheet
        const sheet = sheets.length === 1
          ? sheets[0]
          : sheets.find(sheet => sheet.name == 'Authors');

        if (!sheet) {
          throw({
            type: 'warning',
            message: 'Please ensure the workbook contains an "Authors" sheet.'
          });
        }

        if (sheet.data.length <= 1) {
          throw({
            type: 'warning',
            message: 'No data could be parsed from the file.'
          });
        }

        const fileHeaders = sheet.data.shift();
        this.form.get('file').patchValue({
          filename: file.name,
          headers: fileHeaders,
          data: sheet.data,
        });

        // attempt to map file headers to columns with the same name
        if (!this.mapHeaders(fileHeaders)) {
          this.alerts.push({
            type: 'info',
            message: 'The file contains headers not found in the template. Please ensure these headers are mapped properly in the fields below.'
          });
        }

      } catch (e) {
        this.loading = false;
        if (e.type && e.message) {
          this.alerts.push(e);
        } else {
          console.log(e);
          this.alerts.push({
            type: 'danger',
            message: 'Please upload a valid excel workbook.',
          });
        }
        this.resetForm();
        this.change.emit(this.form.value);
      }
    });


    // set form field indexes when dragged
    ds.drop.subscribe((value: [string, HTMLElement, HTMLElement]) => {
      const parent = value[2];
      Array.from(parent.children)
        .forEach((node, index) => (<FormArray>this.form.get('author.fields')).controls
          .find(control => control.value.name == node.getAttribute('data-name'))
          .patchValue({index}))
    });
  }

  mapHeaders(headers: string[]): boolean {
    let validHeaders = true;

    headers.forEach((header, column) => {

      // update the affiliation column
      if (header === 'Affiliations')
        this.form.get('affiliation')
          .patchValue({column})

      // update author field mappings
      else if (this.defaultHeaders.includes(header))
        (<FormArray>this.form.get('author.fields')).controls
          .find((item: FormGroup) => item.value.name == header)
          .patchValue({column})

      // otherwise, unknown headers must be manually mapped
      else
        validHeaders = false;
    })

    return validHeaders;
  }

  resetForm(parameters = {}) {
    this.form.reset({
      ...this.defaultParameters,
      ...parameters
    }, {emitEvent: false});
    this.form.updateValueAndValidity();
  }

  useExample(): void {
    this.resetForm({
      file: {
        filename: 'AuthorArranger Example.xlsx',
        file: null,
        headers: [...this.defaultHeaders],
        data: [
          ["Dr","Mitchell","John","Machiela","ScD; MPH","Integrative Tumor Epidemiology Branch, Division of Cancer Epidemiology and Genetics, National Cancer Institute, Rockville, MD, USA"],
          ["Mr","Geoffrey",null,"Tobias","BS","Office of the Directory, Division of Cancer Epidemiology and Genetics, National Cancer Institute, Rockville, MD, USA"],
          ["Ms","Sue",null,"Pan","MS","Center for Biomedical Informatics and Information Technology, National Cancer Institute, Rockville, MD, USA"],
          ["Dr","Ye",null,"Wu","MS; PhD","Center for Biomedical Informatics and Information Technology, National Cancer Institute, Rockville, MD, USA"],
        ],
      }
    });
    this.mapHeaders(this.defaultHeaders);
  }
}
