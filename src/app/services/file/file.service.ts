import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as xlsx from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  async parseFile(file: File) {
    const bytes = await this.readFile(file);
    return await this.parse(bytes);
  }

  async parseMetadata(bytes: ArrayBuffer) {
    const workbook = xlsx.read(bytes, {
      type: 'array',
      bookProps: true,
    });

    return workbook.Props;

  }

  async parseOld(bytes: ArrayBuffer) {
    const workbook = xlsx.read(bytes, {type: 'array'});

    // return an array of sheets
    return Object.entries(workbook.Sheets).map(
      ([name, sheet]) => ({
        name,
        data: xlsx.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
        })
      })
    )
  }

  readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = e => {
        reader.abort();
        reject(e);
      }

      reader.readAsArrayBuffer(file);
    });
  }

  parse(data: ArrayBuffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('assets/web-workers/xlsx.js');

      worker.onerror = error => reject(error);
      worker.onmessage = message => resolve(message.data);
      worker.postMessage({
        type: 'readXlsx',
        payload: data,
      });
    });
  }


  readRemoteFile(url: string): Promise<ArrayBuffer> {
    return this.http.get(url, {responseType: 'arraybuffer'}).toPromise();
  }
}
