import { FullProperties } from 'xlsx';
import { Worksheet } from '../../app.models';

export function fileWorker() {

    // load xlsx from a same-origin asset instead of a public CDN so this
    // worker does not depend on a third-party origin being reachable
    self['importScripts'](self.location.origin + '/assets/vendor/xlsx/xlsx.full.min.js');

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

    addEventListener('message', event => {
        const {
            method,
            messageId,
            parameters,
        } = event.data;

        postMessage({
            messageId: messageId,
            result: (self as any)[method](parameters)
        }, undefined);
    });

    postMessage('initialized', undefined);
}