import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ArrangedAuthors, FormatParameters, FieldFormat } from 'src/app/app.models';
import * as _ from 'lodash';

interface MarkupElement {
  tagName: string;
  text?: string;
  children?: MarkupElement[];
}

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
    const rows = config.file.data || [];
    const ids: [number, number][] = [];
    const authors: string[][] = [];
    const affiliations: string[][] = [];

    // columns used to uniquely identify an author
    const authorColumns = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Other']
      .map(columnName => config.author.fields.find(field => field.name == columnName).column);

    // columns used to uniquely identify an affiliation
    const affiliationColumns = ['Department', 'Division', 'Institute', 'Street', 'City', 'State', 'Postal Code', 'Country']
      .map(columnName => config.affiliation.fields.find(field => field.name == columnName).column);

    // previous author's id (for empty authors)
    let previousAuthorId;

    rows.forEach((row, rowIndex) => {
      // ensure row does not contain extra spaces
      row = row.map(str => str.replace(/\s+/g, ' ').trim());

      const authorFields = authorColumns.map(i => row[i]);
      const affiliationFields = affiliationColumns.map(i => row[i]);

      // try to find the affiliation
      let affiliationId = affiliations.findIndex(
        value => _.isEqual(value, affiliationFields));

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

    for (let child of element.children || [])
      r.appendChild(htmlElement, this.renderElement(child));

    return htmlElement;
  }

  generateMarkup(config: FormatParameters): MarkupElement {
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

    const fieldFormatter = (text: string, format: FieldFormat) => {
      if (!text ||
        text.trim().length === 0 ||
        format.disabled ||
        format.column === null) return '';

      // ensure one consecutive space exists
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

      if (!format.abbreviate || (format.abbreviate && !format.removeSpace))
        text += ' ';

      return text;
    };

    const labelFormatter = (index: number) => ({
      'numbers': index,
      'letters-lowercase': this.toLetters(index).toLowerCase(),
      'letters-uppercase': this.toLetters(index).toUpperCase(),
      'numerals-lowercase': this.toRomanNumerals(index).toLowerCase(),
      'numerals-uppercase': this.toRomanNumerals(index).toUpperCase()
    })[config.affiliation.labelStyle];

    let lastAuthor: string;

    const authors: {id: number, name: string, affiliations: number[]}[] = [];
    const affiliations: {id: number, name: string}[] = [];
    const data = config.file.data || [];
    const rowIds = this.generateIds(config);

    data.forEach((row, index, rows) => {
      const [authorId, affiliationId] = rowIds[index];
      const authorRow = rows[authorId];
      const affiliationRow = rows[affiliationId];

      const authorText = authorFields
        .map(field => fieldFormatter(authorRow[field.column], field))
        .join('');

      const affiliationText = affiliationFields
        .map(field => fieldFormatter(affiliationRow[field.column], field))
        .join('');

      // find affiliation ids for the author
      const authorAffiliations = rowIds
        .filter(e => e[0] == authorId)
        .map(e => rowIds.findIndex(([a, b]) => b == e[1]));

      if (!authors.find(e => e.id === authorId))
        authors.push({
          id: authors.length,
          name: authorText,
          affiliations: authorAffiliations
        });

      if (!affiliations.find(e => e.id === affiliationId))
        affiliations.push({
          id: affiliations.length,
          name: affiliationText,
        });
    });

    const authorLabelTag = tagNames[config.author.labelPosition];

    authors.forEach(({name, affiliations}, index) => {
      let text = name.trim();

      if (config.author.labelPosition === 'inline')
        text += ' ';

      authorsMarkup.children.push({
        tagName: 'span',
        text: text,
      }, {
        tagName: authorLabelTag,
        text: affiliations
          .map(e => e + 1)
          .map(labelFormatter)
          .join(','),
      });

      if (index < authors.length - 1) {
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
    })

    const affiliationLabelTag = tagNames[config.affiliation.labelPosition];

    affiliations.forEach(({name}, index) => {
      let text = name.trim();
      let labelText = labelFormatter(index + 1);

      if (config.affiliation.labelPosition === 'inline')
      labelText += ' ';

      affiliationsMarkup.children.push({
        tagName: affiliationLabelTag,
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

    })

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
