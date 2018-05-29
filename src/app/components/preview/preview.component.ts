import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ViewChild, ElementRef } from '@angular/core';

import { FormatParameters } from '../../app.models';
import * as FileSaver from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';
import { ArrangerService } from '../../services/arranger/arranger.service';

interface Author {
  rowId: number;

}

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnChanges {

  @Input()
  config: FormatParameters;

  @ViewChild('preview')
  preview: ElementRef;

  authorOrder: {id: number, name: string, affiliations: number[]}[] = [];

  selectedTab = 'preview';

  fullWidth = false;

  constructor(private renderer: Renderer2, private arranger: ArrangerService){}

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

    const arrangedAuthors = this.arranger.arrangeAuthors(this.config);
    this.authorOrder = [...arrangedAuthors.authors];
    const markup = this.arranger.generateMarkup(this.config, arrangedAuthors);
    this.renderer.appendChild(
      this.preview.nativeElement,
      this.arranger.renderElement(markup)
    );
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      const { currentValue, previousValue } = changes.config;

      if (currentValue && currentValue.constructor != Event) {
        this.config = currentValue;
        this.generatePreview();
      } else {
        this.config = previousValue;
      }
    }
  }
}
