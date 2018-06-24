import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { FileService } from '../../services/file/file.service';
import { FileInfo, DEFAULT_HEADERS } from '../../app.models';

@Component({
  selector: 'author-arranger-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {

  @Output('on-change')
  change: EventEmitter<FileInfo> = new EventEmitter<FileInfo>();

  alerts: {type: string, message: string}[] = [];

  filename: string = null;

  loading: boolean = false;

  constructor(private fileService: FileService) { }

  ngOnInit() {}

  async updateFiles(files: FileList) {
    if (!files || files.length === 0) {
      this.reset();
      return;
    };

    const file = files[0];
    this.filename = file.name;
    this.loading = true;

    try {
      if (!this.fileService.initialized) {
        throw({
          type: 'danger',
          message: 'The AuthorArranger service is initializing. Please try again in a few moments.'
        });
      }

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
      const fileHeaders = sheet.data.shift() as string[];

      if (fileHeaders.length < 2) {
        throw({
          type: 'warning',
          message: 'The file does not contain a valid number of columns.'
        });
      }

      // show warning if file contains non-default headers
      if (fileHeaders.find(header => !DEFAULT_HEADERS.includes(header))) {
        this.alerts.push({
          type: 'warning',
          message: 'The file contains columns not found in the template. Please ensure these columns are properly mapped in the fields below.'
        });
      }

      // update form value

      this.change.emit({
        filename: file.name,
        headers: fileHeaders || [],
        data: sheet.data || [],
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
      this.loading = false;
    }
  }

  reset() {
    this.alerts = [];
    this.loading = false;
    this.filename = null;

    this.change.emit({
       filename: null,
       data: [],
       headers: [],
    });
  }

  async loadSample() {
    try {
      this.reset();
      this.loading = true;

      if (!this.fileService.initialized) {
        throw({
          type: 'danger',
          message: 'The files service is initializing. Please try again in a few moments.'
        });
      }

      this.filename = 'AuthorArranger Template.xlsx';

      const bytes = await this.fileService.readRemoteFile(`assets/files/${this.filename}`);
      const sheets = await this.fileService.getSheets(bytes);
      const data = sheets.find(sheet => sheet.name === 'Example').data;
      const headers = data.shift(); // remove first row (headers)

      // update form value
      this.change.emit({ filename: this.filename, headers, data });

    } catch(e) {
      console.log(e);
      if (e.type && e.message && e.constructor != ErrorEvent)
        this.alerts.push(e);
    } finally {
      this.loading = false;
    }
  }

}
