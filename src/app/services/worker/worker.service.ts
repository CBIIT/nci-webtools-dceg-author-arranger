import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor() { }

  getWorker(fn) {
    return new Worker(URL.createObjectURL(new Blob([`(${fn})()`])));
  }

  callMethod(worker: Worker, method: string, parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = Math.random();

      worker.addEventListener(
        'message',
        function messageListener({data}: MessageEvent) {
          if (data.messageId !== undefined && data.messageId !== messageId) return;
          worker.removeEventListener('message', messageListener);
          if (data.result !== undefined)
            resolve(data.result);
          else
            resolve(null);
        },
      );

      worker.addEventListener(
        'error',
        (event: ErrorEvent) => reject(event),
        {once: true},
      );

      worker.postMessage({messageId, method, parameters});
    });
  }
}
