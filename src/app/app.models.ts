export interface FieldFormat {
    name: string;
    column: number | null;
    index: number;
    abbreviate?: boolean;
    addPeriod?: boolean;
    addComma?: boolean;
    removeSpace?: boolean;
    disabled?: boolean;
}

export interface FormParameters {
    file: {
        filename: string | null,
        files: FileList | File[] | null,
        data: string[][],
        headers: string[],
    };

    author: {
        fields: FieldFormat[];
        separator: string;
        customSeparator: string;
        labelPosition: string;
    };

    affiliation: {
        fields: FieldFormat[];
        separator: string;
        customSeparator: string;
        labelPosition: string;
        labelStyle: string;
    };

    email: {
        field: FieldFormat;
    };
}

export interface Author {
    id: number;
    rowId: number;
    name: string;
    affiliations: number[];
    duplicate: boolean;
    removed: boolean;
    fields: {
        Title?: string;
        First?: string;
        Middle?: string;
        Last?: string;
        Degree?: string;
        Other?: string;
    };
}

export interface Affiliation {
    id: number;
    rowId: number;
    name: string;
};

export interface ArrangedOutput {
    authors: Author[];
    affiliations: Affiliation[];
}

export interface MarkupElement {
    tagName: string;
    attributes?: {[key: string]: string | null};
    text?: string;
    children?: MarkupElement[];
}

export interface AppState {
    form: FormParameters;

    rowIds: [number, number][];
    rowOrder: number[];

    authors: Author[];
    affiliations: Affiliation[];

    markup: MarkupElement;
    emails: string[];
}
