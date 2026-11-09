import { FullProperties } from 'xlsx';
import { Worksheet } from '../../app.models';

export function fileWorker() {

    self['importScripts']('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js');

    let XLSX = self['XLSX'];

    /**
     * Gets an Excel document's properties
     */
    self['getProperties'] = (bytes: ArrayBuffer): FullProperties => (
        XLSX.read(bytes, {
            type: 'array',
            bookProps: true,
        }).Props || null
    );

    /**
     * Gets an Excel document's worksheets
     */
    self['getSheets'] = (bytes: ArrayBuffer): Worksheet[] => {

        /** @type Worksheet[] */
        const sheets = [];
        const  workbook = XLSX.read(bytes, {type: 'array'});

        for (const name in workbook.Sheets || {}) {
            const sheet = workbook.Sheets[name];
            sheets.push({
                name: name,
                data: XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    blankrows: false,
                    // return formatted text for every cell (instead of the
                    // raw typed value) so numeric-looking values such as
                    // postal codes are not coerced into JS numbers, since
                    // all fields in this app are treated as text
                    raw: false
                })
            });
        }

        return sheets;
    };

    // allowlist of methods which may be invoked via messages
    const methods = Object.freeze({
        getProperties: self['getProperties'],
        getSheets: self['getSheets']
    });

    addEventListener('message', event => {
        const {
            method,
            messageId,
            parameters,
        } = event.data;

        if (!Object.hasOwn(methods, method)) {
            throw new Error(`Unknown worker method: ${method}`);
        }

        postMessage({
            messageId: messageId,
            result: methods[method](parameters)
        }, undefined);
    });

    postMessage('initialized', undefined);
}