import { Component } from "@angular/core";

export enum TableColumnType {
    string,
    number,
    date,
    boolean,
    routerLink,
    arrayString,
    link,
    component,
    checkbox
    // add other types - could be general or data specific
}

export enum TableLinkTargets {
    blank = '_blank',
    self = '_self',
    parent = '_parent',
    top = '_top'
};

export interface ITableColumn<T> {
    name: string;
    displayName: string;

    type?: TableColumnType;
    isSortable?: boolean;
    isHidden?: boolean;

    getLink?: (row: T) => string;
    linkTarget?: TableLinkTargets.blank | TableLinkTargets.self | TableLinkTargets.parent | TableLinkTargets.top;
    getDisplayValue?: (row: T) => any;

    component?: any;
    getComponentInput?: (row: T) => any;

    headerWidth?: string;
    textAlign?: string;
    breakLines ?: boolean;
    width?: string;
}
