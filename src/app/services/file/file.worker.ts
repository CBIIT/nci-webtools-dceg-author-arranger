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
                    blankrows: false
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