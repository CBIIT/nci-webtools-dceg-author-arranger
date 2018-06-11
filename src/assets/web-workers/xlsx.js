importScripts('https://unpkg.com/xlsx@0.9.11/dist/xlsx.min.js');

function readXlsx(bytes) {
    var sheets = [];
    var workbook = XLSX.read(bytes, {type: 'array'});

    // return an array of sheets
    for (var name in workbook.Sheets) {
        var sheet = workbook.Sheets[name];
        sheets.push({
            name: name,
            data: XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                blankrows: false
            })
        })
    }

    return sheets;
}

onmessage = function(event) {
    var action = event.data;
    postMessage(self[action.type](action.payload));
    close();
}



