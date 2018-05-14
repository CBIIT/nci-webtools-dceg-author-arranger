export interface FormatParameters {
    file: {
        filename: string,
        files: FileList | null,
        data: string[][],
        headers: string[],
    };

    author: {
        fields: {
            name: string;
            column: number | null;
            index: number;
            abbreviate?: boolean;
            addPeriod?: boolean;
            addComma?: boolean;
            removeSpace?: boolean;
            disabled?: boolean;
        }[];
        separator: string;
        customSeparator: string;
        labelPosition: string;
    };

    affiliation: {
        column: number | null;
        separator: string;
        customSeparator: string;
        labelPosition: string;
        labelStyle: string;
    };
}