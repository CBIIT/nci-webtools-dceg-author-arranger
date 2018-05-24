import { Injectable } from '@angular/core';
import * as xlsx from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ParserService {

  constructor() { }

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

  readFile(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          let byteString = '';
          let bytes = new Uint8Array(e.target.result);
          for (let i = 0; i < bytes.byteLength; i ++) {
            byteString += String.fromCharCode(bytes[i]);
          }
          resolve(byteString);
        } catch (e) {
          reject(e);
        }
      }
      reader.readAsArrayBuffer(file);
    });
  }

}
