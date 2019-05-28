import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MarkupElement, AppState } from 'src/app/app.models';
import { WorkerService } from '../worker/worker.service';
import { arrangerWorker } from './arranger.worker';
import { saveAs } from 'file-saver';
import * as docx from 'docx';

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
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  async downloadDocument(originalFilename: string, markup: MarkupElement) {
    const filename = originalFilename.replace(/\.[^/\\.]+$/, '.docx');
    const doc = new docx.Document();
    const authors = markup.children[0].children;
    const affiliations = markup.children[1].children;

    if (!authors.length && !affiliations.length) return;

    doc.addParagraph(this.getParagraph(authors));
    if (affiliations) {
      doc.addParagraph(new docx.Paragraph());
      doc.addParagraph(this.getParagraph(affiliations));
    }

    const packer = new docx.Packer();
    saveAs(await packer.toBlob(doc), filename);
  }

  getParagraph(elements: MarkupElement[]) {
    let paragraph = new docx.Paragraph();

    elements.forEach(el => {
      let { tagName, text, attributes, children } = el;

      if (text && text.toString().trim().length == 0) return;
      let textRun = new docx.TextRun(text).size(24);
      if (tagName == 'sup')
        textRun = textRun.superScript();
      if (tagName == 'sub')
        textRun = textRun.subScript();
      if (tagName == 'br')
        paragraph.addRun(new docx.Run().break());
      if (text)
        paragraph.addRun(textRun);
    })

    return paragraph;
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