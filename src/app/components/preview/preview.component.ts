import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { StoreService } from '../../services/store/store.service';
import { saveAs } from 'file-saver';
import * as htmlDocx from 'html-docx-js/dist/html-docx.js';
import { isEmpty } from 'lodash';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent {

  @ViewChild('preview')
  preview: ElementRef;

  alerts: {type: string, message: string}[] = [];

  hasData = false;

  selectedTab = 'preview';

  loading: boolean = false;

  constructor(
    private arranger: ArrangerService,
    private renderer: Renderer2,
    private store: StoreService,
  ) {
    // whenever app state changes, re-render markup for this component
    this.store.appState$.subscribe(state => {

      this.alerts = [];
      this.hasData = !isEmpty(state.form.file.data);
      if (!this.preview) return;
      // this.store.patchState({loading: true});

      let root = this.preview.nativeElement;
      // root.textContent = '';
      for (let child of root.children) {
        this.renderer.removeChild(root, child);
      }

      if (this.hasData && state.markup) {
        this.renderer.appendChild(
          root, this.arranger.createElement(state.markup)
        );
      }

      if (state.duplicateAuthors) {
        this.alerts = [{
          type: 'warning',
          message: 'Duplicate author names have been found.'
        }];
      }

      // this.store.patchState({loading: false});
    });
  }

  downloadPreview() {
    if (this.preview && this.hasData) {
      const originalFilename = this.store.appState.form.file.filename;
      const filename = originalFilename.replace(/\.[^/\\.]+$/, '.docx');
      const html = (<HTMLElement> this.preview.nativeElement).innerHTML;
      saveAs(htmlDocx.asBlob(html), filename);
    }
  }

  /*

  constructor(
    private renderer: Renderer2,
    private arranger: ArrangerService,
  ) {


    dragula.drop.subscribe((value: [string, HTMLElement, HTMLElement, HTMLElement]) => {
      const [
        containerName,
        element,
        target,
        source
      ] = value;

      if (containerName !== 'authors')
        return;

      const targetName = target.getAttribute('data-name');
      const authorId = element.getAttribute('data-id');
      const author = this.authors.find(author => author.id == +authorId);
      author.removed = targetName === 'removed';

      if (target != source)
        source.appendChild(element);

      this.updateAuthors();
    });
  }



  updateAuthors(preserveOrder: boolean = false) {
    if (this.preview) {
      let root = this.preview.nativeElement;
      for (let child of Array.from(root.children)) {
        this.renderer.removeChild(root, child);
      }
    }

    let hasDuplicates = false;
    this.alerts = [];

    this.authors = this.authors.map(author => {
      author.duplicate = (
        this.authors.filter(e =>
          e.id != author.id &&
          _(e.fields).isEqual(author.fields) &&
          (!e.removed && !author.removed)).length > 0
      );
      if (author.duplicate)
        hasDuplicates = true;
      return author;
    })

    if (hasDuplicates) {
      this.alerts = [{
        type: 'warning',
        message: 'Duplicate author names have been found.'
      }];
    }

    const arrangedAuthors = {
      ...this.arrangedAuthors,
      authors: this.authors,
    };

    const markup = this.arranger.generateMarkup(this.config, arrangedAuthors);
    this.renderer.appendChild(
      this.preview.nativeElement,
      this.arranger.renderElement(markup)
    );
    this.generateEmails();
  }

  async generatePreview(preserveOrder: boolean = false) {
    if (this.preview) {
      let root = this.preview.nativeElement;
      for (let child of Array.from(root.children)) {
        this.renderer.removeChild(root, child);
      }
    }

    if (!this.preview ||
      !this.config ||
      !this.config.file.data ||
      this.config.file.data.length <= 1 ||
      this.config.author.fields.filter(field => field.column !== null).length === 0 ||
      this.config.affiliation.fields.filter(field => field.column !== null).length === 0) {
      return;
    }

    this.arrangedAuthors = await this.arranger.arrangeAuthors(this.config);

    if (preserveOrder) {
      this.authors = this.authors.map(author => {
        const row = this.config.file.data[author.id];
        let fields = {};
        for (let field of this.config.author.fields) {
          fields[field.name] = row[field.column] || '';
        }
        return {
          ...author,
          name: this.arrangedAuthors.authors
            .find(e => e.id == author.id).name,
          fields
        };
      })

    } else {
      this.authors = this.arrangedAuthors.authors
        .map(author => {
          const row = this.config.file.data[author.id];
          let fields = {};
          for (let field of this.config.author.fields) {
            fields[field.name] = row[field.column] || '';
          }
          return {
            ...author,
            fields,
            removed: false,
            duplicate: false
          };
        });
    }
    this.updateAuthors(preserveOrder);
  }

  generateEmails() {
    this.emails = '';

    const data = this.config.file.data;
    const column = this.config.email.field.column;
    const emails = [];

    if (column === null || !this.authors) return;
    this.authors
      .filter(author => !author.removed)
      .forEach(author => {
      const rowId = author.id;
      const email = data[rowId][column];
      const name =  author.fields.First && author.fields.Last
        ? `${author.fields.First} ${author.fields.Last}`
        : author.name;

      if (email)
        emails.push(`${name} <${email}>`)
    });

    this.emails = emails.join('; ').trim() || 'No emails are available.';
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
        const preserveOrder = previousValue
          ? _(previousValue.file.data).isEqual(currentValue.file.data)
          : false;

        this.generatePreview(preserveOrder);

        if (!preserveOrder)
          this.selectedTab = 'preview';
      } else {
        this.config = previousValue;
      }
    }
  }
  */
}
