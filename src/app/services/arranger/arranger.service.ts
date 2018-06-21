import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MarkupElement, AppState } from 'src/app/app.models';
import { WorkerService } from '../worker/worker.service';
import { arrangerWorker } from './arranger.worker';

@Injectable({
  providedIn: 'root',
})
export class ArrangerService {

  renderer: Renderer2;
  worker: Worker = null;

  constructor(
    private rendererFactory: RendererFactory2,
    private workerService: WorkerService) {
    this.worker = this.workerService.getWorker(arrangerWorker);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  arrange(appState: AppState): Promise<Partial<AppState>> {
    return this.workerService.callMethod<Partial<AppState>>(
      this.worker, 'arrange', appState
    );
  }

  createElement(markup: MarkupElement) {
    const r = this.renderer;
    const htmlElement = r.createElement(markup.tagName);

    if (markup.text)
      r.appendChild(htmlElement, r.createText(markup.text));

    for (const key in markup.attributes || {}) {
      const value = markup.attributes[key];
      if (value !== null && value !== undefined)
        r.setAttribute(htmlElement, key, value)
    }

    for (const child of markup.children || [])
      r.appendChild(htmlElement, this.createElement(child));

    return htmlElement;
  }
}
