import { ApplicationRef, Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  constructor(private zone: NgZone, private appRef: ApplicationRef) { }

  getWorker(fn: Function): Worker {
    if (!environment.production)
      console.log(fn.toString());
    return new Worker(URL.createObjectURL(new Blob([`(${fn})()`])));
  }

  callMethod<E>(worker: Worker, method: string, parameters: any): Promise<E> {
    return new Promise((resolve, reject) => {
      const messageId = Math.random();

      const messageListener = ({data}: MessageEvent) => {
        if (data.messageId !== undefined && data.messageId !== messageId) return;
        worker.removeEventListener('message', messageListener);
        // resolve within the Angular zone, then run change detection so
        // state changes driven by worker responses are rendered; a
        // macrotask is used so all await continuations settle first
        this.zone.run(() => {
          if (data.result !== undefined)
            resolve(data.result as E);
          else
            resolve(null);
        });
        setTimeout(() => this.appRef.tick());
      };
      worker.addEventListener('message', messageListener);

      worker.addEventListener(
        'error',
        (event: ErrorEvent) => {
          this.zone.run(() => reject(event));
          setTimeout(() => this.appRef.tick());
        },
        {once: true},
      );

      worker.postMessage({messageId, method, parameters});
    });
  }
}
