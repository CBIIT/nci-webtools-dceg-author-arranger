import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ViewChild, ElementRef, AfterViewInit, ApplicationRef } from '@angular/core';

import { FormatParameters, ArrangedAuthors } from '../../app.models';
import * as FileSaver from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { DragulaService } from 'ng2-dragula';
import * as _ from 'lodash';

interface Author {
  rowId: number;

}

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
  providers: [ApplicationRef],
})
export class PreviewComponent implements OnChanges, AfterViewInit {

  @Input()
  config: FormatParameters;

  @ViewChild('preview')
  preview: ElementRef;

  alerts: {type: string, message: string}[] = [];

  arrangedAuthors: ArrangedAuthors;

  authors: {
    id: number,
    name: string,
    affiliations: number[],
    fields: any,
    removed: boolean,
    duplicate: boolean;
  }[] = [];

  selectedTab = 'preview';

  dragOptions = {
    direction: 'horizontal',
    copy: false,
    copySortSource: true,
    invalid: (el, handle) => handle.getAttribute('drag-handle') === null,
  }

  constructor(
    private renderer: Renderer2,
    private arranger: ArrangerService,
    private dragula: DragulaService,
    private applicationRef: ApplicationRef
  ) {

    dragula.drop.subscribe((value: [string, HTMLElement, HTMLElement, HTMLElement]) => {
      const element = value[1];
      const target = value[2];
      const source = value[3];
      const containerName = value[0];

      if (containerName !== 'authors')
        return;

      const targetName = target.getAttribute('data-name');
      const authorId = element.getAttribute('data-id');
      const author = this.authors.find(author => author.id == +authorId);
      author.removed = targetName === 'removed';

      if (target != source)
        source.appendChild(element);

      setTimeout(() => this.updateAuthors(), 10);
    });
  }

  updateAuthors() {
    if (this.preview) {
      let root = this.preview.nativeElement;
      for (let child of Array.from(root.children)) {
        this.renderer.removeChild(root, child);
      }
    }

    let hasDuplicates = false;
    this.authors.forEach(author => {
      author.duplicate = (
        this.authors.filter(e =>
          e.id != author.id &&
          _(e.fields).isEqual(author.fields) &&
          (!e.removed && !author.removed)).length > 0
      );
      if (author.duplicate)
        hasDuplicates = true;
    })

    if (hasDuplicates) {
      this.alerts = [{
        type: 'info',
        message: 'Duplicate author names have been found.'
      }];
    }

    let arrangedAuthors = {...this.arrangedAuthors};
    arrangedAuthors.authors = this.authors
      .filter(author => !author.removed)
      .map(author => this.arrangedAuthors.authors.find(e => e.id == author.id));

    const markup = this.arranger.generateMarkup(this.config, arrangedAuthors);
    this.renderer.appendChild(
      this.preview.nativeElement,
      this.arranger.renderElement(markup)
    );
  }


  generatePreview() {
    if (this.preview) {
      let root = this.preview.nativeElement;
      for (let child of Array.from(root.children)) {
        this.renderer.removeChild(root, child);
      }
    }

    if (!this.preview ||
      !this.config ||
      !this.config.file.data ||
      this.config.file.data.length <= 1) {
      return;
    }

    this.arrangedAuthors = this.arranger.arrangeAuthors(this.config);
    this.authors = this.arrangedAuthors.authors
      .map(author => {
        const row = this.config.file.data[author.id];
        let fields = {};
        for (let field of this.config.author.fields) {
          fields[field.name] = row[field.column] || '';
        }
        return {...author, fields, removed: false, duplicate: false};
      });

    this.updateAuthors();
  }

  downloadPreview() {
    if (this.preview && this.config.file.data && this.config.file.data.length > 1) {
      const filename = this.config.file.filename.replace(/\.[^/\\.]+$/, '.docx');
      const html = (this.preview.nativeElement as HTMLElement).innerHTML;
      FileSaver.saveAs(htmlDocx.asBlob(html), filename);
    }
  }

  toColumnName(num: number) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode((+(num % b) / a) + 65) + ret;
    }
    return ret;
  }

  toRomanNumerals(num: number) {
    var roman =  {"M" :1000, "CM":900, "D":500, "CD":400, "C":100, "XC":90, "L":50, "XL":40, "X":10, "IX":9, "V":5, "IV":4, "I":1};
    var str = "";

    for (var i of Object.keys(roman) ) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }

    return str;
  }

  ngAfterViewInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      const { currentValue, previousValue } = changes.config;

      if (currentValue && currentValue.constructor != Event) {
        this.alerts = [];
        this.config = currentValue;
        this.generatePreview();
        this.selectedTab = 'preview';
      } else {
        this.config = previousValue;
      }
    }
  }
}
