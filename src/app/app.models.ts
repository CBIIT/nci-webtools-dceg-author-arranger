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

export interface ArrangedAuthors {
    authors: {id: number, name: string, affiliations: number[]}[];
    affiliations: {id: number, name: string}[];
}

export interface MarkupElement {
    tagName: string;
    text?: string;
    children?: MarkupElement[];
}
