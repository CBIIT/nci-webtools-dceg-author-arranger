import { Component } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormParameters } from '../../app.models';
import { FileService } from '../../services/file/file.service';
import { StoreService } from '../../services/store/store.service';
import { createFormObject } from '../../services/createFormObject';
import { merge, cloneDeep } from 'lodash';

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
    private fileService: FileService,
    private storeService: StoreService) {

    this.formGroup = createFormObject(
      this.storeService.initialAppState.form
    ) as FormGroup;

    this.formGroup
      .valueChanges
      .subscribe(value => this.storeService.patchState({form: value}))

    this.formGroup.get('file.files')
      .valueChanges
      .subscribe(this.updateFiles);

    this.formGroup.patchValue(
      this.storeService.appState.form
    );
  }

  async updateFiles(files: FileList) {
    // do not show spinner if load takes less than 250 ms
    const loadingTimeout = setTimeout(() => this.loading = true, 250);

    try {
      this.reset({file: { files }});

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
      if (properties &&
        properties.SheetNames &&
        properties.SheetNames.length > 1 &&
        !properties.SheetNames.includes('Authors')) {
        throw({
          type: 'danger',
          message: 'Please ensure the workbook contains an Authors sheet.'
        });
      }

      const sheets = await this.fileService.getSheets(bytes);

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
          message: 'The file does not contain a valid number of columns.'
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
      this.formGroup.get('file').patchValue({
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
