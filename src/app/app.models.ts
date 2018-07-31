export const DEFAULT_HEADERS = [
    'Title',
    'First',
    'Middle',
    'Last',
    'Degree',
    'Other',
    'Email',
    'Department',
    'Division',
    'Institute',
    'Street',
    'City',
    'State',
    'Postal Code',
    'Country'
];

export type DeepPartial < T > = {
    [P in keyof T]?: DeepPartial < T[P] >;
};

export interface FileInfo {
    filename : string | null;
    data : string[][];
    headers : string[];
}

export interface FieldFormat {
    name : string;
    column : number | null;
    index : number;
    abbreviate?: boolean;
    addPeriod?: boolean;
    addComma?: boolean;
    removeSpace?: boolean;
    disabled?: boolean;
};

export interface Format {

    author : {
        fields: FieldFormat[];
        separator: string;
        customSeparator: string;
        labelPosition: string;
    };

    affiliation : {
        fields: FieldFormat[];
        separator: string;
        customSeparator: string;
        labelPosition: string;
        labelStyle: string;
    };

    email : {
        fields: FieldFormat[];
    };
}

export interface Author {
    id : number;
    rowId : number;
    name : string;
    affiliationIds : number[];
    affiliationRowIds: number[];
    duplicate : boolean;
    removed : boolean;
    row: string[],
    fields?: {
        Title?: string;
        First?: string;
        Middle?: string;
        Last?: string;
        Degree?: string;
        Other?: string;
        Email?: string;
    };
}

export interface Affiliation {
    id : number;
    rowId : number;
    name : string;
    authorRowIds : number[];
    removed : boolean;
    row: string[],
    fields?: {
        Department?: string;
        Division?: string;
        Institute?: string;
        Street?: string;
        City?: string;
        State?: string;
        'Postal Code' ?: string;
        Country?: string;
    };
};

export interface MarkupElement {
    tagName : string;
    attributes?: {
        [key : string]: string | null
    };
    text?: string;
    children?: MarkupElement[];
};

export interface AppState {
    file : FileInfo;
    format : Format;

    rowIds : [number, number][];

    authors : Author[];
    preserveOrder: boolean;
    duplicateAuthors: boolean;

    affiliations : Affiliation[]
    emails: string[];
    markup : MarkupElement;
};

export const INITIAL_APP_STATE: AppState = {
    file: {
        filename: null,
        data: null,
        headers: null
    },

    format: {
        author: {
            fields: [
                {
                    name: 'Title',
                    column: null,
                    addPeriod: true,
                    disabled: false,
                    index: 0
                }, {
                    name: 'First',
                    column: null,
                    abbreviate: false,
                    addPeriod: false,
                    removeSpace: false,
                    disabled: false,
                    index: 1
                }, {
                    name: 'Middle',
                    column: null,
                    abbreviate: false,
                    addPeriod: false,
                    removeSpace: false,
                    disabled: false,
                    index: 2
                }, {
                    name: 'Last',
                    column: null,
                    abbreviate: false,
                    addPeriod: false,
                    disabled: false,
                    index: 3
                }, {
                    name: 'Degree',
                    column: null,
                    addComma: false,
                    addPeriod: false,
                    disabled: false,
                    index: 4
                }, {
                    name: 'Other',
                    column: null,
                    addComma: false,
                    addPeriod: false,
                    disabled: false,
                    index: 5
                }
            ],
            separator: 'comma',
            customSeparator: '',
            labelPosition: 'superscript'
        },

        affiliation: {
            fields: [
                {
                    name: 'Department',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 0
                }, {
                    name: 'Division',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 1
                }, {
                    name: 'Institute',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 2
                }, {
                    name: 'Street',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 3
                }, {
                    name: 'City',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 4
                }, {
                    name: 'State',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 5
                }, {
                    name: 'Postal Code',
                    column: null,
                    addComma: true,
                    addPeriod: false,
                    disabled: false,
                    index: 6
                }, {
                    name: 'Country',
                    column: null,
                    addComma: false,
                    addPeriod: false,
                    disabled: false,
                    index: 7
                }
            ],
            separator: 'comma',
            customSeparator: '',
            labelPosition: 'superscript',
            labelStyle: 'numbers'
        },

        email: {
            fields: [
                {
                    name: 'Email',
                    column: null,
                    index: 0
                }
            ]
        }
    },
    rowIds: [],
    preserveOrder: false,

    authors: [],
    duplicateAuthors: false,
    affiliations: [],

    emails: [],

    markup: {
        tagName: 'span'
    }
}

export interface Worksheet {
    name: string;
    data: (string | undefined)[][];
}