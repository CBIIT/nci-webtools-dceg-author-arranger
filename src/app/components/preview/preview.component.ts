import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormatParameters } from '../../app.models';
import * as FileSaver from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges {

  @Input()
  config: FormatParameters;

  @ViewChild('preview')
  preview: ElementRef;

  constructor(private renderer: Renderer2){}

  generatePreview() {

    let root: HTMLElement;
    if (this.preview) {
      root = this.preview.nativeElement;
      for (let child of Array.from(root.children)) {
        this.renderer.removeChild(root, child);
      }
    }

    if (!this.preview ||
      !this.config ||
      !this.config.file.data ||
      this.config.file.data.length <= 1 ||
      this.config.affiliation.column === null) {
      return;
    }

    let records = [...this.config.file.data];
    let headers = [...this.config.file.headers];
    let affiliationsIndex = this.config.affiliation.column;

    const authors = [];
    const affiliations = [];

    const separatorMap = {
      comma: ',',
      newline: '\n',
      semicolon: ';',
      other: null
    };

    const labelFormatter = (index) => {
      switch(this.config.affiliation.labelStyle) {
        case 'numbers':
          return index;

        case 'letters-lowercase':
          return this.toColumnName(index).toLowerCase();

        case 'letters-uppercase':
          return this.toColumnName(index).toUpperCase();

        case 'numerals-lowercase':
          return this.toRomanNumerals(index).toLowerCase();

        case 'numerals-uppercase':
          return this.toRomanNumerals(index).toUpperCase();

        default:
          return index;
      }
    };

    const columns = this.config.author.fields
      .filter(field => field.column !== null && !field.disabled)
      .sort((a, b) => a.index - b.index)
      .map(field => ({... field, formatter: (text) => {
        if (!text) return null;

        let value = text.replace(/;/g, ',');

        if (field.abbreviate)
          value = value[0];

        if (field.addPeriod)
          value += '.';

        if (field.addComma)
          value += ',';

        if (!field.abbreviate
        || (field.abbreviate && !field.removeSpace))
          value += ' ';

        return value.trim();
      }}));


    for (let record of records) {

      const authorText = columns
        .map(field =>  field.formatter(record[field.column]))
        .filter(item => item != null)
        .join('');

      const authorAffiliations = (record[affiliationsIndex] || '')
        .split(';')
        .map(e => e.trim());

      const affiliationIndexes = [];

      authorAffiliations.forEach(affiliation => {
        let index = affiliations.indexOf(affiliation);
        if (index === -1) {
          affiliations.push(affiliation);
          affiliationIndexes.push(affiliations.length - 1);
        } else {
          affiliationIndexes.push(index);
        }
      });

      authors.push({
        text: authorText,
        affiliations: affiliationIndexes,
      });
    }

    // console.log(columns);
    // console.log(element, element.children);

    for (let child of Array.from(root.children)) {
      this.renderer.removeChild(root, child);
    }

    let authorParagraph = this.renderer.createElement('p');
    authors.forEach((author, index) => {
      let config = this.config.author;

      let labelType = {
        superscript: 'sup',
        subscript: 'sub',
        inline: 'span',
      }[config.labelPosition];

      let separator = separatorMap[config.separator] ||
        config.customSeparator;

      let authorEl = this.renderer.createElement('span');

      this.renderer.appendChild(authorEl,
        this.renderer.createText(author.text)
      );

      let label = this.renderer.createElement(labelType);
      // this.renderer.setStyle(label, 'margin', '0px 4px 0 2px');
      this.renderer.appendChild(label,
        this.renderer.createText(
          author.affiliations
            .map(e => e + 1)
            .map(labelFormatter)
            .join(','))
      )

      if (labelType == 'span') {
        this.renderer.appendChild(authorEl,
          this.renderer.createText(' ')
        );
      }

      this.renderer.appendChild(authorEl, label);
      this.renderer.appendChild(authorEl,
        this.renderer.createText(index < authors.length - 1
          ? separator + ' '
          : '')
      );

      if (separator == '\n') {
        this.renderer.appendChild(authorEl,
          this.renderer.createElement('br')
        )
      }

      authorParagraph.appendChild(authorEl);
    });

    let affiliationsParagraph = this.renderer.createElement('p');
    affiliations.forEach((affiliation, index) => {
      let config = this.config.affiliation;

      let labelType = {
        superscript: 'sup',
        subscript: 'sub',
        inline: 'span',
      }[config.labelPosition];

      let numericLabels = this.config.affiliation.labelStyle == 'numeric';

      let separator = separatorMap[config.separator] ||
        config.customSeparator;

      let affiliationEl = this.renderer.createElement('span');
      this.renderer.setStyle(affiliationEl, 'margin-right', '4px')

      let affiliationLabelText = this.renderer.createText(labelFormatter(index + 1));
      let affiliationLabel = this.renderer.createElement(labelType);
      affiliationLabel.appendChild(affiliationLabelText);

      this.renderer.appendChild(affiliationEl,
        this.renderer.createText(affiliation)
      );

      this.renderer.appendChild(affiliationEl,
        this.renderer.createText(index < affiliations.length - 1
          ? separator + ' '
          : ' ')
      );

      if (separator == '\n') {
        this.renderer.appendChild(affiliationEl,
          this.renderer.createElement('br')
        )
      }

      affiliationsParagraph.appendChild(affiliationLabel);
      if (labelType == 'span') {
        affiliationsParagraph.appendChild(
          this.renderer.createText(' ')
        );
      }
      affiliationsParagraph.appendChild(affiliationEl);
    })

    this.renderer.appendChild(root, authorParagraph);
    // this.renderer.appendChild(root, this.renderer.createElement('br'));
    this.renderer.appendChild(root, affiliationsParagraph);
  }

  downloadPreview() {
    if (this.preview && this.config.file.data.length > 1) {
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
