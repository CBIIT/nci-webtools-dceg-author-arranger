//@ts-nocheck

/** Adds XLSX to global namespace */
importScripts('https://unpkg.com/xlsx@0.13.0/dist/xlsx.full.min.js');

/** DECLARE TYPES */

/**
 * Excel document properties
 * @typedef {Object} Properties
 * @property {string} [Title]
 * @property {string} [Subject]
 * @property {string} [Author]
 * @property {string} [Manager]
 * @property {string} [Company]
 * @property {string} [Category]
 * @property {string} [Keywords]
 * @property {string} [Comments]
 * @property {string} [LastAuthor]
 * @property {Date} [CreatedDate]
 * @property {Date} [ModifiedDate]
 * @property {string} [Application]
 * @property {string} [AppVersion]
 * @property {string} [DocSecurity]
 * @property {boolean} [HyperlinksChanged]
 * @property {boolean} [SharedDoc]
 * @property {boolean} [LinksUpToDate]
 * @property {boolean} [ScaleCrop]
 * @property {number} [Worksheets]
 * @property {string[]} [SheetNames]
 * @property {string} [ContentStatus]
 * @property {string} [LastPrinted]
 * @property {string | number} [Revision]
 * @property {string} [Version]
 * @property {string} [Identifier]
 * @property {string} [Language]
 */

/**
 * Excel document worksheet
 * @typedef {Object} Worksheet
 * @property {String} name;
 * @property {any[][]} data;
 */

/** END TYPES */


/**
 * Gets an Excel document's properties
 * @param {ArrayBuffer} bytes The Excel document's bytes
 * @returns {Properties | null} The Excel document's properties
 */
function getProperties(bytes) {
    return XLSX.read(bytes, {
        type: 'array',
        bookProps: true,
    }).Props || null;
}


/**
 * Gets an Excel document's worksheets
 * @param {ArrayBuffer} bytes The Excel document's bytes
 * @returns {Worksheet[]} The Excel document's worksheets
 */
function getSheets(bytes) {

    /** @type Worksheet[] */
    var sheets = [];
    var workbook = XLSX.read(bytes, {type: 'array'});

    for (var name in workbook.Sheets || {}) {
        var sheet = workbook.Sheets[name];
        sheets.push({
            name: name,
            data: XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                blankrows: false
            })
        });
    }

    return sheets;
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
