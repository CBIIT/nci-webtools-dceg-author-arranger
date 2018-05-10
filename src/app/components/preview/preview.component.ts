import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges {

  @Input()
  config: any = {};

  @ViewChild('preview')
  preview: ElementRef;

  constructor(private renderer: Renderer2){}

  generatePreview() {
    if (!this.preview || this.config.file.data.length == 0) return;


    const root: HTMLElement = this.preview.nativeElement;

    let records = [...this.config.file.data];
    let fileHeaders = records.shift(); // remove headers
    let affiliationsIndex = fileHeaders.indexOf('Affiliations');
    if (affiliationsIndex == -1) return;

    const authors = [];
    const affiliations = [];

    const separatorMap = {
      comma: ',',
      newline: '\n',
      semicolon: ';',
      other: null
    };

    const columns = this.config.author.fields
      .filter(field => field.column !== null && !field.disabled)
      .sort((a, b) => a.index > b.index)
      .map(field => ({... field, formatter: (text) => {
        if (!text) return null;

        let value = text;

        if (field.abbreviate)
          value = value[0];

        if (field.addPeriod)
          value += '.';

        if (field.addComma)
          value += ','

        return value;
      }}));

    for (let record of records) {


      const authorText = columns
        .map(field =>  field.formatter(record[field.column]))
        .filter(item => item != null)
        .join(' ');

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
      this.renderer.setStyle(label, 'margin', '0px 8px 0px 0px');
      this.renderer.appendChild(label,
        this.renderer.createText(
          author.affiliations
            .map(e => e + 1)
            .join(', '))
      )

      this.renderer.appendChild(authorEl,
        this.renderer.createText(index < authors.length - 1
          ? separator
          : ' ')
      );

      this.renderer.appendChild(authorEl, label);

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

      let separator = separatorMap[config.separator] ||
        config.customSeparator;

      let affiliationEl = this.renderer.createElement('span');
      this.renderer.setStyle(affiliationEl, 'margin-right', '4px')

      let affiliationLabelText = this.renderer.createText((index + 1).toString());
      let affiliationLabel = this.renderer.createElement(labelType);
      affiliationLabel.appendChild(affiliationLabelText);
      this.renderer.setStyle(affiliationLabel, 'margin-right', '4px')

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
      affiliationsParagraph.appendChild(affiliationEl);
    })

    this.renderer.appendChild(root, authorParagraph);
    // this.renderer.appendChild(root, this.renderer.createElement('br'));
    this.renderer.appendChild(root, affiliationsParagraph);


  }

  downloadPreview() {
    console.log('generating download...')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      let data = changes.config;
      let { currentValue, previousValue } = data;

      // only generate previews for form parameters
      if (currentValue.constructor == Event) {
        this.config = previousValue;
      } else {
        this.config = currentValue;
        this.generatePreview();
      }
    }
  }
}
