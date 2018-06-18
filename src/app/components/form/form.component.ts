import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { FormParameters } from '../../app.models';
import { FileService } from '../../services/file/file.service';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { Observable } from 'rxjs';
import { StoreService } from '../../services/store/store.service';
import { merge, isArray, isObject } from 'lodash';

@Component({
  selector: 'author-arranger-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {

  alerts: {type: string, message: string}[] = [];

  defaultHeaders = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Other', 'Email', 'Department', 'Division', 'Institute', 'Street', 'City', 'State', 'Postal Code', 'Country'];

  formGroup: FormGroup = null;

  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private arrangerService: ArrangerService,
    private fileService: FileService,
    private storeService: StoreService) {

    const group = this.formBuilder.group.bind(formBuilder);
    const array = this.formBuilder.array.bind(formBuilder);
    const control = this.formBuilder.control.bind(formBuilder);


    const createFormObject = (item, accumulator) => {

    }


    this.formGroup = group({
      file: group({
        filename: '',
        files: null,
        data: [],
        headers: [],
      }),

      author: group({
        fields: array([
          group({
            name: 'Title',
            column: null,
            addPeriod: true,
            disabled: false,
            index: 0,
          }),

          group({
            name: 'First',
            column: null,
            abbreviate: false,
            addPeriod: false,
            removeSpace: false,
            disabled: false,
            index: 1,
          }),

          group({
            name: 'Middle',
            column: null,
            abbreviate: false,
            addPeriod: false,
            removeSpace: false,
            disabled: false,
            index: 2,
          }),

          group({
            name: 'Last',
            column: null,
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 3,
          }),

          group({
            name: 'Degree',
            column: null,
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 4,
          }),

          group({
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

      affiliation: group({
        fields: array([
          group({
            name: 'Department',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 0,
          }),

          group({
            name: 'Division',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 1,
          }),

          group({
            name: 'Institute',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 2,
          }),

          group({
            name: 'Street',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 3,
          }),

          group({
            name: 'City',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 4,
          }),

          group({
            name: 'State',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 5,
          }),

          group({
            name: 'Postal Code',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 6,
          }),

          group({
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

      email: group({
        field: group({
          name: 'Email',
          column: null,
          index: 0,
        }),
      }),
    });

    this.formGroup.get('file.files').valueChanges.subscribe(
      async (files: FileList) => {

      // set loading to true after 250 milliseconds
      // do not show loading indicator if load takes less than 250 ms
      const loadingTimeout = setTimeout(() => this.loading = true, 250);

      try {
        this.reset({file: { files }});

        // early exit if no file exists
        if (!files || files.length == 0) return;

        if (!this.fileService.initialized) {
          throw({
            type: 'danger',
            message: 'The AuthorArranger service is initializing. Please try again in a few moments.'
          });
        }

        const file = files[0];

        // read file bytes into ArrayBuffer
        const bytes = await this.fileService.readFile(file);

        // validate workbook properties (avoid loading invalid workbooks)
        const properties = await this.fileService.getProperties(bytes);

        // ensure the workbook contains an "Authors" sheet
        if (properties && !(properties.SheetNames || []).includes('Authors')) {
          throw({
            type: 'danger',
            message: 'Please ensure the workbook contains an Authors sheet.'
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
        this.reset();

        if (e.type && e.message && e.constructor !== ErrorEvent) {
          this.alerts.push(e);
        } else {
          this.alerts.push({
            type: 'danger',
            message: 'An error occured while reading the file.',
          });
        }
      } finally {
        clearTimeout(loadingTimeout);
        this.loading = false;
      }
    });
  }

  mapHeaders(headers: string[] = this.defaultHeaders): boolean {
    let validHeaders = true;

    headers.forEach((header, column) => {

      if (this.defaultHeaders.includes(header)) {
        let control = [
          ...(<FormArray>this.formGroup.get('author.fields')).controls,
          ...(<FormArray>this.formGroup.get('affiliation.fields')).controls,
          this.formGroup.get('email.field')
        ].find((item: FormGroup) => item.value.name == header);

        control && control.patchValue({column});
      }

      // otherwise, unknown headers must be manually mapped
      else
        validHeaders = false;
    });

    return validHeaders;
  }

  reset(value = {}) {
    this.alerts = [];

    const formValue = merge(
      this.storeService.initialAppState.form,
      value
    );

    this.formGroup.reset(formValue, { emitEvent: false });
    this.formGroup.updateValueAndValidity();
    this.storeService.patchState({form: formValue});
  }

  async useExample() {
    try {
      this.loading = true;
      this.reset();

      if (!this.fileService.initialized) {
        throw({
          type: 'danger',
          message: 'The files service is initializing. Please try again in a few moments.'
        });
      }

      const filename = 'AuthorArranger Template.xlsx';
      const bytes = await this.fileService.readRemoteFile(`assets/files/${filename}`);
      const sheets = await this.fileService.getSheets(bytes);

      const data = sheets.find(sheet => sheet.name === 'Example').data;
      const headers = data.shift(); // remove first row (headers)

      this.reset({file: { filename, headers, data }});
      this.mapHeaders();

    } catch(e) {
      console.log(e);
      if (e.type && e.message && e.constructor != ErrorEvent)
        this.alerts.push(e);

    } finally {
      this.loading = false;
    }
  }
}
