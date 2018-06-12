import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  worker: Worker = null;
  initialized: boolean = false;

  constructor(private http: HttpClient) {
    this.worker = new Worker('assets/web-workers/xlsx.js');

    const afterInit = (ev: MessageEvent) => {
      if (ev.data === 'initialized') {
        this.initialized = true;
        this.worker.removeEventListener('message', afterInit);
      }
    }

    this.worker.addEventListener('message', afterInit);
  }

  async parseFile(file: File) {
    const bytes = await this.readFile(file);
    return await this.parse(bytes);
  }

  async parseMetadata(data: ArrayBuffer) {
    return await this.callWorker('readXlsxMetadata', data);
  }

  async parse(data: ArrayBuffer) {
    return await this.callWorker('readXlsx', data);
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

  readRemoteFile(url: string): Promise<ArrayBuffer> {
    return this.http.get(url, {responseType: 'arraybuffer'}).toPromise();
  }

  callWorker(action: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.initialized)
        reject({
          type: 'danger',
          message: 'The workbook parsing service has not yet finished initializing. Please try again in a few moments.'
        });

      const worker = this.worker;
      const jobId = Math.random();

      worker.addEventListener('message', function onMessage(ev: MessageEvent) {
        const data = ev.data;
        if (data.jobId == jobId) {
          resolve(data.payload);
          worker.removeEventListener('message', onMessage);
        }
      });

      worker.addEventListener('error', function onError(ev: ErrorEvent) {
        worker.removeEventListener('error', onError);
        reject(ev);
      });

      worker.postMessage({
        type: action,
        payload: {jobId, data},
      });

    });
  }

}
