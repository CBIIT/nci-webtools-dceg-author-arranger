import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FullProperties } from 'xlsx';
import { Worksheet } from '../../app.models';
import { WorkerService } from '../worker/worker.service';
import { fileWorker } from './file.worker';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  worker: Worker = null;
  initialized: boolean = false;

  constructor(
    private http: HttpClient,
    private workerService: WorkerService) {

    this.worker = this.workerService.getWorker(fileWorker);
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

  getProperties(data: ArrayBuffer): Promise<FullProperties> {
    return this.workerService.callMethod<FullProperties>(
      this.worker, 'getProperties', data
    );
  }

  getSheets(data: ArrayBuffer): Promise<Worksheet[]> {
    return this.workerService.callMethod<Worksheet[]>(
      this.worker, 'getSheets', data
    );
  }
}