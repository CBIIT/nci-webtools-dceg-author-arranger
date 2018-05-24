import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as xlsx from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  async parse(file: File) {
    const byteString = await this.readFile(file);
    const workbook = xlsx.read(byteString, {type: 'binary'});

    const sheets = [];
    for (let name of workbook.SheetNames) {
      let sheet = workbook.Sheets[name];
      let data = xlsx.utils.sheet_to_json(sheet, {header: 1});
      sheets.push({ name, data });
    }

    return sheets;
  }

  async parseXlsx(byteString: string) {
    const workbook = xlsx.read(byteString, {type: 'binary'});

    const sheets = [];
    for (let name of workbook.SheetNames) {
      let sheet = workbook.Sheets[name];
      let data = xlsx.utils.sheet_to_json(sheet, {header: 1});
      sheets.push({ name, data });
    }

    return sheets;
  }

  toByteString(buffer: ArrayBuffer): string {
    let byteString = '';
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i ++) {
      byteString += String.fromCharCode(bytes[i]);
    }
    return byteString;
  }

  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const buffer = e.target.result as ArrayBuffer;
          resolve(this.toByteString(buffer));
        } catch (e) {
          reject(e);
        }
      }
      reader.readAsArrayBuffer(file);
    });
  }

  readRemoteFile(url: string): Promise<string> {
    return this.http.get(url, {responseType: 'arraybuffer'})
      .pipe(map(e => this.toByteString(e)))
      .toPromise();
  }

  fillMissingColumns(rows, columns: number[] = [], skip = 1) {
    let buffer = [];
    if (!columns || columns.length === 0) {
      columns = [];
      for (let i = 0; i < (rows[0] || []).length; i ++)
        columns.push(i);
    }

    return rows.map((row, rowIndex) => {
      // Return rows as-is if they contain a value
      // in the first entry, or they should be skipped
      if (rowIndex <= skip || row[0]) {
        buffer = [...row];
        return row;
      }

      // Otherwise, use the previous row's values.
      // These values are specified as column
      // indexes in the 'columns' array
      for (let i = 0; i < rows[0].length; i ++) {
        if (!row[i] && columns.includes(i)) {
          row[i] = buffer[i];
        }
      }
      return row;
    });
  }

}
