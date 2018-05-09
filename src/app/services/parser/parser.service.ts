import { Injectable } from '@angular/core';
import * as xlsx from 'xlsx';
import { resolve } from 'url';
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})
export class ParserService {

  constructor() { }

  async parse(file: File) {
    const byteString = await this.readAsBinary(file);

    const workbook = xlsx.read(byteString, {type: 'binary'});

    const sheets = [];
    for (let name of workbook.SheetNames) {
      let sheet = workbook.Sheets[name];
      let data = xlsx.utils.sheet_to_json(sheet, {header: 1});
      sheets.push({ name, data });
    }

    return sheets;
  }

  readAsBinary(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          resolve(e.target.result);
        } catch (e) {
          reject(e);
        }
      }
      reader.readAsBinaryString(file);
    });
  }

}
