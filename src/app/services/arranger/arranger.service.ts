import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MarkupElement, AppState } from 'src/app/app.models';
import { WorkerService } from '../worker/worker.service';
import { arrangerWorker } from './arranger.worker';
import { saveAs } from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';
import * as entities from 'html-entities';

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

  downloadPreview(originalFilename: string, element: HTMLElement) {
    const filename = originalFilename.replace(/\.[^/\\.]+$/, '.docx');
    const html = element.innerHTML;

    // first, decode to normalize html (avoid double-encoding)
    const decodedHtml = entities.AllHtmlEntities.decode(html);

    // escape entities, but ensure that brackets are preserved
    const encodedHtml = entities.AllHtmlEntities.encodeNonUTF(decodedHtml)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const htmlDoc = `<!DOCTYPE html><html><head></head>
      <body>${encodedHtml}</body></html>`

    saveAs(htmlDocx.asBlob(htmlDoc), filename);
  }

  arrange(appState: AppState): Promise<Partial<AppState>> {
    return this.workerService.callMethod<Partial<AppState>>(
      this.worker, 'arrange', appState
    );
  }

  reorder(appState: AppState): Promise<Partial<AppState>> {
    return this.workerService.callMethod<Partial<AppState>>(
      this.worker, 'reorder', appState
    );
  }

  createElement(markup: MarkupElement, async: boolean = false) {
    const r = this.renderer;
    const htmlElement = r.createElement(markup.tagName);

    if (markup.text)
      r.appendChild(htmlElement, r.createText(markup.text));

    for (const key in markup.attributes || {}) {
      const value = markup.attributes[key];
      if (value !== null && value !== undefined)
        r.setAttribute(htmlElement, key, value)
    }

    for (const child of markup.children || []) {
      if (async)
        setTimeout(() =>
          r.appendChild(htmlElement, this.createElement(child)), 0
        );

      else
        r.appendChild(htmlElement, this.createElement(child));
    }

    return htmlElement;
  }
}