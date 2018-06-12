importScripts('https://unpkg.com/xlsx@0.13.0/dist/xlsx.full.min.js');

function readXlsx(parameters) {
    var bytes = parameters.data;

    var sheets = [];
    var workbook = XLSX.read(bytes, {type: 'array'});

    // return an array of sheets
    for (var name in workbook.Sheets || {}) {
        var sheet = workbook.Sheets[name];
        sheets.push({
            name: name,
            data: XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                blankrows: false
            })
        })
    }

    return {
        jobId: parameters.jobId,
        payload: sheets
    };
}

function readXlsxMetadata(parameters) {
    var bytes = parameters.data;
    var workbook = XLSX.read(bytes, {
        type: 'array',
        bookProps: true,
    });

    return {
        jobId: parameters.jobId,
        payload: workbook.Props
    };
}

onmessage = function(event) {
    var action = event.data;
    postMessage(self[action.type](action.payload));
}

postMessage('initialized');