/// <reference path="../app/app.models.ts" />

/** Adds _ to global namespace */
importScripts('https://unpkg.com/lodash@4.17.10/lodash.min.js');


// replaces double+ spaces with single spaces
function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}


// returns columns from a matrix given their indexes
function getColumns(data, columnIndexes) {
  return data.map(function(row) {
    return columnIndexes.map(function(index) {
      return row[index];
    });
  });
}


// returns a field's column index
function getColumnIndex(fields, columnName) {
  var field = _.find(fields, {name: columnName});
  return field ? field.column : null;
}

function reorderRows(rows, rowOrder) {
}


function toLetters(num) {
  for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode((+(num % b) / a) + 65) + ret;
  }
  return ret;
}

function toRomanNumerals(num) {
  var roman =  {"M" :1000, "CM":900, "D":500, "CD":400, "C":100, "XC":90, "L":50, "XL":40, "X":10, "IX":9, "V":5, "IV":4, "I":1};
  var str = "";

  for (var i of Object.keys(roman) ) {
    var q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }

  return str;
}


// generates [authorId, affiliationId] pairs
// where ids correspond to row indexes of the
// input file in which the fields first appear
function generateIds(config) {
  if (!config.file.data || config.file.data.length === 0) return [];

  // ensure rows does not contain extra spaces
  var rows = config.file.data.map(function(row) {
    return row.map(normalizeSpaces);
  });

  // columns indexes used to uniquely identify an author
  var authorColumnIndexes = ['Title', 'First', 'Middle', 'Last', 'Degree', 'Other']
    .map(getColumnIndex.bind(null, config.author.fields));

  // columns indexes used to uniquely identify an affiliation
  var affiliationColumnIndexes = ['Department', 'Division', 'Institute', 'Street', 'City', 'State', 'Postal Code', 'Country']
    .map(getColumnIndex.bind(null, config.affiliation.fields));

  var mappedAuthors = getColumns(rows, authorColumnIndexes);
  var mappedAffiliations = getColumns(rows, affiliationColumnIndexes);

  // previous author's id (for empty authors)
  var previousAuthorId;
  return rows.map(function(row, rowIndex) {
    var authorFields = mappedAuthors[rowIndex];
    var affiliationFields = mappedAffiliations[rowIndex];

    // initialize the author id (use previous author by default)
    var authorId = previousAuthorId;

    // if the author fields are not empty, use a new author id
    if (_.compact(authorFields).length)
      previousAuthorId = authorId = rowIndex;

    // find the affiliation id
    var affiliationId = _(mappedAffiliations)
      .findIndex(_.isEqual.bind(null, affiliationFields));

    return [authorId, affiliationId];
  });

}

/**
 *
 *
 * @param {AppState} appState
 */
function arrange(appState) {

}

addEventListener('message', function(event) {
  var data = event.data;
  var method = self[data.method];
  var messageId = data.messageId;
  var parameters = data.parameters;

  postMessage({
      messageId: messageId,
      result: method(parameters)
  });
});


postMessage('initialized');
