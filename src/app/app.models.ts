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
        data: string[][] | null,
        headers: string[] | null,
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
        fields: FieldFormat[];
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
        Email?: string;
    };
}

export interface Affiliation {
    id: number;
    rowId: number;
    name: string;
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
    preserveOrder: boolean;

    authors: Author[];
    affiliations: Affiliation[];
    duplicateAuthors: boolean;

    markup: MarkupElement;
    emails: string[];

    loading: boolean;
    loadingMessage: string;
}

export interface AppState2 {
    form: FormParameters;

    authors: Author[];
    affiliations: Affiliation[];

    markup: MarkupElement;

    authorOrder: number[];
    emails: string[];

}

export interface Worksheet {
    name: string;
    data: (string | undefined)[][];
}