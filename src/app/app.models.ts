export interface FieldFormat {
    name: string;
    column: number | null;
    index: number;
    abbreviate?: boolean;
    addPeriod?: boolean;
    addComma?: boolean;
    removeSpace?: boolean;
    disabled?: boolean;
};

export interface FormatParameters {
    file: {
        filename: string,
        files: FileList | null,
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

    disabledAuthorIds?: number[];
};

export interface Author {
    id: number;
    name: string;
    affiliations: number[];
    fields?: any;
    duplicate: boolean;
    removed: boolean;
}

export interface Affiliation {
    id: number;
    name: string;
}

export interface ArrangedAuthors {
    authors: Author[];
    affiliations: Affiliation[];
}

export interface MarkupElement {
    tagName: string;
    attributes?: {[key: string]: string | null};
    text?: string;
    children?: MarkupElement[];
}
