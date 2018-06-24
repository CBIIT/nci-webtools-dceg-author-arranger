import {
  AppState,
  MarkupElement,
  Format,
  FieldFormat,
  Author,
  Affiliation
} from '../../app.models';

export function arrangerWorker() {

  self['importScripts']('https://unpkg.com/lodash@4.17.10/lodash.min.js');

  let _ = self['_'];

  function arrange(appState : AppState) : Partial < AppState > {
      // arrange authors and update state
      const newState = arrangeAuthors(appState);
      for (let key in newState)
        appState[key] = newState[key];

      // generate markup, emails and update state
      appState.markup = getMarkup(appState);
      appState.emails = getEmails(appState);

      return appState;
  }

  function reorder(appState: AppState): Partial <AppState> {
    const affiliations = appState.affiliations;


    // reindex authors
    for (let i = 0; i < appState.authors.length; i ++) {
      appState.authors[i].id = i;
    }

    // remove affiliations only when all references to them are removed
    affiliations.forEach(e => e.removed = true);
    for (let author of appState.authors) {
      let affiliationRowIds = author.affiliationRowIds;
      let authorAffiliations = affiliationRowIds.map(rowId => _(affiliations).find(e => e.rowId === rowId))
      authorAffiliations.forEach(e => !author.removed ? e.removed = false : null);
    }

    // reorder affiliations by author order
    const getAuthorByRowId = rowId => _(appState.authors.filter(e => !e.removed)).find(e => e.rowId == rowId);
    const newAffiliations = affiliations
      .sort((a, b) => {
        const minA = _.min(a.authorRowIds.map(e => _.get(getAuthorByRowId(e), 'id')))
        const minB = _.min(b.authorRowIds.map(e => _.get(getAuthorByRowId(e), 'id')))
        return minA - minB;
      });

      // exclude removed affiliations from filter order
      newAffiliations
        .filter(e => !e.removed)
        .forEach((e, i) => {
          for (let authorRowId of e.authorRowIds) {
            let author = _(appState.authors).find(a => a.rowId == authorRowId);
            let index = author.affiliationRowIds.indexOf(e.rowId);
            if (index > -1)
              author.affiliationIds[index] = i + 1;
          }
          e.id = i + 1;
          return e;
        });

    appState.affiliations = newAffiliations;

    // generate markup, emails and update state
    appState.markup = getMarkup(appState);
    appState.emails = getEmails(appState);

    return appState;
  }

  function getRowOrder(authorOrder, rowIds) {
    let rowOrder = [];
    let orderedRows = rowIds.map((row, index) => [index, ...row]);


  }

  function getEmails(appState : AppState) : string[] {
      return appState
          .authors
          .filter(author => !author.removed && author.fields.Email)
          .map(({name, fields}) => `${(fields.First + ' ' + fields.Last).trim() || name} <${fields.Email}>`)
  }

  function arrangeAuthors(appState : AppState) : Partial < AppState > {
      const format = appState.format;
      const fileData = appState.file.data || [];
      const preserveOrder = false;
      const authorOrder = appState.authorOrder;
      const oldRowIds = appState.rowIds || [];
      const oldAuthors = appState.authors;
      const oldAffiliations = appState.affiliations;

      let rowOrder = [];

      if (_.isEmpty(rowOrder))
          rowOrder = _.range(fileData.length);

      const authors: Author[] = [];
      const affiliations: Affiliation[] = [];

      const authorFields: FieldFormat[] = format.author.fields.sort((a, b) => a.index - b.index);
      const affiliationFields: FieldFormat[] = format.affiliation.fields.sort((a, b) => a.index - b.index);
      const emailColumn: number = format.email.fields[0].column;

      const rows = rowOrder.map(i => fileData[i]);

      // contains an array of [authorId, affiliationId] pairs which correspond to the
      // row of the input file in which they first appear
      const rowIds = generateIds(rows, format);

      const fieldFormatter = (text : string, format : FieldFormat) => {
          if (!text || text.trim().length === 0 || format.disabled || format.column === null)
              text = '';

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

          return (text);
      };

      let duplicateAuthors = false;
      rows.forEach((row, rowIndex) => {
          const [authorRowId, affiliationRowId] = rowIds[rowIndex];

          const authorRow = rows[authorRowId];
          const affiliationRow = rows[affiliationRowId];

          const authorText = authorFields.map(field => fieldFormatter(authorRow[field.column], field))
              .join('')
              .trim();

          const affiliationText = affiliationFields.map(field => fieldFormatter(affiliationRow[field.column], field))
              .join('')
              .trim();

          if (!_(authors).find(e => e.rowId === authorRowId))
              authors.push({
                  id: authors.length + 1,
                  rowId: authorRowId,
                  name: normalizeSpaces(authorText),
                  affiliationIds: [],
                  affiliationRowIds: [],
                  duplicate: false,
                  removed: false,

                  // map author fields
                  fields: authorFields.reduce((acc, {name, column}) =>
                      _.merge(acc, {[name]: row[column]}),
                      {Email: row[emailColumn]}
                  )
              });

          if (!_(affiliations).find(e => e.rowId === affiliationRowId))
              affiliations.push({
                id: affiliations.length + 1,
                rowId: affiliationRowId,
                authorRowIds: [],
                name: normalizeSpaces(affiliationText),
                removed: false
              });


          const currentAuthor = _(authors).find(author => author.rowId === authorRowId);
          const currentAffiliation = _(affiliations).find(e => e.rowId === affiliationRowId)

          currentAuthor.affiliationIds.push(currentAffiliation.id);
          currentAuthor.affiliationRowIds.push(currentAffiliation.rowId);
          currentAffiliation.authorRowIds.push(authorRowId);

          const duplicates = authors.filter(author => author.name === authorText)
          if (duplicates.length > 1) {
              duplicates.forEach(author => author.duplicate = true);
              duplicateAuthors = true;
          }
      });

      return {authors, affiliations, rowIds, duplicateAuthors};
  }

  function getMarkup(appState : AppState) : MarkupElement {

      const {format, authors, affiliations} = appState;

      const markup = {
          tagName: 'div',
          children: []
      };

      const authorsMarkup = {
          tagName: 'p',
          children: []
      };

      const affiliationsMarkup = {
          tagName: 'p',
          children: []
      };

      markup
          .children
          .push(authorsMarkup, affiliationsMarkup);

      const authorFields: FieldFormat[] = format.author.fields.sort((a, b) => a.index - b.index);
      const affiliationFields: FieldFormat[] = format.affiliation.fields.sort((a, b) => a.index - b.index);

      const tagNames = {
          inline: 'span',
          superscript: 'sup',
          subscript: 'sub'
      };

      const separators = {
          comma: ',',
          newline: '\n',
          semicolon: ';',
          other: null
      };

      const labelFormatter = (index : number) => ({
          'numbers': index,
          'letters-lowercase': toLetters(index)
              .toLowerCase(),
          'letters-uppercase': toLetters(index)
              .toUpperCase(),
          'numerals-lowercase': toRomanNumerals(index)
              .toLowerCase(),
          'numerals-uppercase': toRomanNumerals(index)
              .toUpperCase()
      })[format.affiliation.labelStyle];

      authors
          .filter(author => !author.removed)
          .forEach(({
              name,
              affiliationIds,
              duplicate,
              removed
          }, index, data) => {

              let text = name.trim();

              if (format.author.labelPosition === 'inline')
                  text += ' ';

              authorsMarkup
                  .children
                  .push({
                      tagName: 'span',
                      text: text,
                      attributes: {
                          class: duplicate
                              ? 'bg-warning'
                              : null
                      }
                  }, {
                      tagName: tagNames[format.author.labelPosition],
                      text: affiliationIds
                          .map(labelFormatter)
                          .join(',')
                  });

              if (index < data.length - 1) {
                  let separator = separators[format.author.separator] || format.author.customSeparator;

                  authorsMarkup
                      .children
                      .push({
                          tagName: 'span',
                          text: separator + ' '
                      });

                  if (separator === '\n')
                      authorsMarkup.children.push({tagName: 'br'});
                  }
              });

      affiliations
        .filter(affiliation => !affiliation.removed)
        .forEach(({name, id}, index, affiliations) => {
          let text = name.trim();
          let labelText = labelFormatter(id);

          if (format.affiliation.labelPosition === 'inline')
              labelText += ' ';

          affiliationsMarkup
              .children
              .push({
                  tagName: tagNames[format.affiliation.labelPosition],
                  text: labelText
              }, {
                  tagName: 'span',
                  text: text
              })

          if (index < affiliations.length - 1) {
              let separator = separators[format.affiliation.separator] || format.affiliation.customSeparator;

              affiliationsMarkup
                  .children
                  .push({
                      tagName: 'span',
                      text: separator + ' '
                  });

              if (separator === '\n')
                  affiliationsMarkup.children.push({tagName: 'br'});
              }
          });

      return markup;
  }

  // generates [authorId, affiliationId] pairs where ids correspond to row indexes
  // of the input file in which the fields first appear
  function generateIds(rowData: string[][], config: AppState["format"]): [number, number][] {
      if (_.isEmpty(rowData))
          return [];

      // ensure rows does not contain extra spaces
      let rows = rowData.map(row => row.map(normalizeSpaces));

      // columns indexes used to uniquely identify an author
      let authorColumnIndexes = [
          'Title',
          'First',
          'Middle',
          'Last',
          'Degree',
          'Other'
      ].map(columnName => getColumnIndex(config.author.fields, columnName));

      // columns indexes used to uniquely identify an affiliation
      let affiliationColumnIndexes = [
          'Department',
          'Division',
          'Institute',
          'Street',
          'City',
          'State',
          'Postal Code',
          'Country'
      ].map(columnName => getColumnIndex(config.affiliation.fields, columnName));

      let mappedAuthors = getColumns(rows, authorColumnIndexes);
      let mappedAffiliations = getColumns(rows, affiliationColumnIndexes);

      // previous author's id (for empty authors)
      let previousAuthorId;
      return rows.map((row, rowIndex) => {
          let authorFields = mappedAuthors[rowIndex];
          let affiliationFields = mappedAffiliations[rowIndex];

          // initialize the author id (use previous author by default)
          let authorId: number = previousAuthorId;

          // if the author fields are not empty, use a new author id
          if (_.compact(authorFields).length)
              previousAuthorId = authorId = rowIndex;

          // find the affiliation id
          let affiliationId: number = _(mappedAffiliations).findIndex(e => _.isEqual(e, affiliationFields));

          return [authorId, affiliationId] as [number, number];
      });
  }

  // replaces double+ spaces with single spaces
  function normalizeSpaces(value : string = '') {
      return (value || '')
          .replace(/\s+/g, ' ')
          .trim();
  }

  // returns columns from a matrix given their indexes
  function getColumns(data : any[][], columnIndexes : number[]) {
      return data.map(row => columnIndexes.map(index => row[index]));
  }

  // returns a field's column index
  function getColumnIndex(fields : FieldFormat[], fieldName : string) {
      const field = _.find(fields, {name: fieldName});
      return field
          ? (field as FieldFormat).column
          : null;
  }

  function toLetters(num : number) {
      for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
          ret = String.fromCharCode((+ (num % b) / a) + 65) + ret;
      }
      return ret;
  }

  function toRomanNumerals(num : number) {
      let roman = {
          "M": 1000,
          "CM": 900,
          "D": 500,
          "CD": 400,
          "C": 100,
          "XC": 90,
          "L": 50,
          "XL": 40,
          "X": 10,
          "IX": 9,
          "V": 5,
          "IV": 4,
          "I": 1
      };
      let str = "";

      for (let i of Object.keys(roman)) {
          let q = Math.floor(num / roman[i]);
          num -= q * roman[i];
          str += _(i).repeat(q);
      }

      return str;
  }

  self['arrange'] = arrange;
  self['reorder'] = reorder;

  addEventListener('message', event => {
      const {method, messageId, parameters} = event.data;

      postMessage({
          messageId: messageId,
          result: self[method](parameters)
      }, undefined);
  });

  postMessage('initialized', undefined);
}