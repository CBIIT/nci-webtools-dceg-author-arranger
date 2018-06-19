import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkerService } from '../worker/worker.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  worker: Worker = null;
  initialized: boolean = false;

  constructor(private http: HttpClient, private workerService: WorkerService) {
    this.worker = new Worker('web-workers/xlsx.js');
    this.worker.addEventListener(
      'message',
      (function onMessage({data}: MessageEvent) {
        if (data !== 'initialized') return;
        this.worker.removeEventListener('message', onMessage);
        this.initialized = true;
      }).bind(this)
    );
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

  async getProperties(data: ArrayBuffer) {
    return await this.workerService
      .callMethod(this.worker, 'getProperties', data);
  }

  async getSheets(data: ArrayBuffer): Promise<{name: string, data: any[]}[]> {
    return await this.workerService
      .callMethod(this.worker, 'getSheets', data);
  }
}