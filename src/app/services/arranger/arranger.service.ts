import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ArrangedAuthors, FormatParameters, FieldFormat, MarkupElement, Author, Affiliation } from 'src/app/app.models';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ArrangerService {

  renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Generates an array consisting of author and affiliation ids in the format:
   * [
   *  [authorId, affiliationId]
   *  ...
   * ]
   * These ids correspond to the row index of the input file in which the fields
   * first appear
   *
   * @param rows
   * @param config
   */
  generateIds(config: FormatParameters): [number, number][] {
    let rows = config.file.data || [];
    const ids: [number, number][] = [];
    const authors: string[][] = [];
    const affiliations: string[][] = [];

    // columns used to uniquely identify an author
    const authorColumns = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Other']
      .map(columnName => config.author.fields.find(field => field.name == columnName).column);

    // columns used to uniquely identify an affiliation
    const affiliationColumns = ['Department', 'Division', 'Institute', 'Street', 'City', 'State', 'Postal Code', 'Country']
      .map(columnName => config.affiliation.fields.find(field => field.name == columnName).column);

    // ensure rows does not contain extra spaces
    rows = rows.map(row => row.map(str => str.replace(/\s+/g, ' ').trim()))

    const mappedAuthors = rows.map(row => authorColumns.map(i => row[i]));
    const mappedAffiliations = rows.map(row => affiliationColumns.map(i => row[i]));

    // previous author's id (for empty authors)
    let previousAuthorId;

    rows.forEach((row, rowIndex) => {
      const authorFields = mappedAuthors[rowIndex];
      const affiliationFields = mappedAffiliations[rowIndex];

      // try to find the affiliation
      let affiliationId = mappedAffiliations
        .findIndex(row => _(row).isEqual(affiliationFields));

      // if it is not found, create a new affiliation
      if (affiliationId == -1) {
        affiliations.push(affiliationFields);
        affiliationId = rowIndex;
      }

      // initialize the author id
      let authorId;

      // if the author fields are empty, use the previous id
      if (authorFields.filter(e => e).length == 0) {
        authorId = previousAuthorId;
      // otherwise, use the row index as the author id
      } else {
        previousAuthorId = authorId = rowIndex;
      }

      ids.push([authorId, affiliationId]);
    });

    return ids;
  }

  renderElement(element: MarkupElement) {
    const r = this.renderer;
    const htmlElement = r.createElement(element.tagName);

    if (element.text)
      r.appendChild(htmlElement, r.createText(element.text));

    for (const key in element.attributes || {}) {
      const value = element.attributes[key];
      if (value !== null && value !== undefined)
        r.setAttribute(htmlElement, key, value)
    }

    for (const child of element.children || [])
      r.appendChild(htmlElement, this.renderElement(child));

    return htmlElement;
  }

  arrangeAuthors(config: FormatParameters): ArrangedAuthors {

    const authors: Author[] = [];
    const affiliations: Affiliation[] = [];

    const authorFields: FieldFormat[] = [...config.author.fields]
      .sort((a, b) => a.index - b.index);

    const affiliationFields: FieldFormat[] = [...config.affiliation.fields]
      .sort((a, b) => a.index - b.index);

    const rows = config.file.data || [];

    // contains an array of [authorId, affiliationId] pairs which correspond
    // to the row of the input file in which they first appear
    const rowIds = this.generateIds(config);

    const fieldFormatter = (text: string, format: FieldFormat) => {
      if (!text ||
        text.trim().length === 0 ||
        format.disabled ||
        format.column === null) text = '';

      // format text only if it is not empty
      if (text.length > 0) {

        // ensure text contains a max of one consecutive space
        text = text
          .replace(/\s+/g, ' ')
          .replace(/;/g, ',')
          .trim();

        if (format.abbreviate)
          text = text[0];

        if (format.addPeriod)
          text += '.';

        if (format.addComma)
          text += ',';
      }

      // append a space unless format.removeSpace is checked
      if (!format.abbreviate || (format.abbreviate && !format.removeSpace))
        text += ' ';

      return text;
    };

    rows.forEach((row, index) => {
      const [authorId, affiliationId] = rowIds[index];

      const authorRow = rows[authorId];
      const affiliationRow = rows[affiliationId];

      const authorText = authorFields
        .map(field => fieldFormatter(authorRow[field.column], field))
        .join('')
        .trim();

      const affiliationText = affiliationFields
        .map(field => fieldFormatter(affiliationRow[field.column], field))
        .join('')
        .trim();

      if (!authors.find(e => e.id === authorId))
        authors.push({
          id: authorId,
          name: authorText,
          affiliations: [],
          duplicate: false,
          removed: false
        });

      if (!affiliations.find(e => e.id === affiliationId))
        affiliations.push({
          id: affiliationId,
          name: affiliationText,
        });

      authors
        .find(author => author.id === authorId).affiliations
        .push(affiliations.findIndex(e => e.id === affiliationId));

      const duplicates = authors.filter(author => author.name === authorText)
      if (duplicates.length > 1) {
        duplicates.forEach(author => author.duplicate = true);
      }
    });

    return {authors, affiliations};
  }

  generateMarkup(config: FormatParameters, arrangedAuthors: ArrangedAuthors): MarkupElement {

    const {authors, affiliations} = arrangedAuthors;

    const markup = {
      tagName: 'div',
      children: [],
    };

    const authorsMarkup = {
      tagName: 'p',
      children: [],
    };

    const affiliationsMarkup = {
      tagName: 'p',
      children: [],
    };

    markup.children.push(authorsMarkup, affiliationsMarkup);

    const authorFields: FieldFormat[] = [...config.author.fields]
      .sort((a, b) => a.index - b.index);

    const affiliationFields: FieldFormat[] = [...config.affiliation.fields]
      .sort((a, b) => a.index - b.index);

    const tagNames = {
      inline: 'span',
      superscript: 'sup',
      subscript: 'sub',
    };

    const separators = {
      comma: ',',
      newline: '\n',
      semicolon: ';',
      other: null
    };

    const labelFormatter = (index: number) => ({
      'numbers': index,
      'letters-lowercase': this.toLetters(index).toLowerCase(),
      'letters-uppercase': this.toLetters(index).toUpperCase(),
      'numerals-lowercase': this.toRomanNumerals(index).toLowerCase(),
      'numerals-uppercase': this.toRomanNumerals(index).toUpperCase()
    })[config.affiliation.labelStyle];

    authors
      .filter(author => !author.removed)
      .forEach(({name, affiliations, duplicate, removed}, index, data) => {

      let text = name.trim();

      if (config.author.labelPosition === 'inline')
        text += ' ';

      authorsMarkup.children.push({
        tagName: 'span',
        text: text,
        attributes: {
          class: duplicate ? 'bg-primary text-light' : null,
        }
      }, {
        tagName: tagNames[config.author.labelPosition],
        text: affiliations
          .map(e => e + 1)
          .map(labelFormatter)
          .join(','),
      });

      if (index < data.length - 1) {
        let separator = separators[config.author.separator] ||
          config.author.customSeparator;

        authorsMarkup.children.push({
          tagName: 'span',
          text: separator + ' '
        });

        if (separator === '\n')
        authorsMarkup.children.push({
          tagName: 'br',
        });
      }
    });

    affiliations.forEach(({name}, index) => {
      let text = name.trim();
      let labelText = labelFormatter(index + 1);

      if (config.affiliation.labelPosition === 'inline')
      labelText += ' ';

      affiliationsMarkup.children.push({
        tagName: tagNames[config.affiliation.labelPosition],
        text: labelText,
      }, {
        tagName: 'span',
        text: text
      })

      if (index < affiliations.length - 1) {
        let separator = separators[config.affiliation.separator] ||
          config.affiliation.customSeparator;

        affiliationsMarkup.children.push({
          tagName: 'span',
          text: separator + ' '
        });

        if (separator === '\n')
          affiliationsMarkup.children.push({
            tagName: 'br',
          });
      }
    });

    return markup;
  }


  toLetters(num: number) {
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
}
