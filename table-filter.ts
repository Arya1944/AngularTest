export interface ITableFilter {
    properties: string[];
    value: any;
    // for the future, we could add operator like equals, contains, etc...
    // old connect table only do contains
}