import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { faAngleLeft, faAngleRight, faCaretDown, faCaretUp, faSort } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { ITableColumn, TableColumnType } from './table-column';
import { ITableFilter } from './table-filter';
import { Router } from '@angular/router';
import { appConstants } from '../../../shared/constants/app-constants';
import { ISrsBallotVote } from 'app/core/ballots/shared/models/sr/srs-ballot-details';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { StatusBadgeColourScheme } from '../status-badge/status-badge-constants';
import { DateFormatPipe } from '../pipes/date-format.pipe';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  providers: [DateFormatPipe]
})

export class TableComponent<TData> implements OnInit, OnChanges, AfterViewInit {
  public statusBadgeColourSchemeEnum = StatusBadgeColourScheme;
  readonly breakLinesTruncateLength = 50;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faSort = faSort;
  faCaretDown = faCaretDown;
  faCaretUp = faCaretUp;

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() columns!: ITableColumn<TData>[];
  @Input() loading: boolean = false;
  @Input() pageSize: number = 50;
  @Input() filters: ITableFilter[] = [];
  @Input() id: string = 'table';
  @Input() internalScrolling: boolean = false;
  @Input() pageSizeOptions: number[] = [20, 50, 100];
  @Input() isDropdownChanged: boolean = false;
  @Input() internalHorizontalScrolling: boolean = false;
  @Input() enableFirstRowFreeze: boolean = false
  @Input() enableFirstColumnFreeze: boolean = false;

  // implement once needed
  @Input() pagination: boolean = true;
  // @Input() sorting: boolean = true;
  @Input() votes: TData[] = [];

  @Output() rowsUpdated = new EventEmitter<TData[]>();
  @Output() applySort = new EventEmitter<Sort>();

  allSelected: boolean = false; // Tracks whether all rows are selected
  someSelected: boolean = false; // Tracks whether some rows are selected

  constructor(
    private _router: Router,
    private dateFormatPipe: DateFormatPipe
  ) {
  }

  dataSource = new MatTableDataSource<TData>();
  @Input() set data(data: TData[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.filterPredicate;
    this.applyFilter(this.filters);
  }

  displayColumns: string[] = [];
  columnType = TableColumnType;

  get containerMaxHeight(): string {

    return this.internalScrolling
      ? (52 * (10)) + 'px' // avg size of row * (no of rows you want to show including header)
      : 'unset';
  }

  ngOnInit(): void {
    this.setupDisplayColumns(this.columns);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const columns = changes['columns'];
    if (columns) {
      this.setupDisplayColumns(columns.currentValue);
    }

    const filters = changes['filters'];
    if (filters?.currentValue) {
      this.applyFilter(filters.currentValue);
    }
    if(this.isDropdownChanged){
      this.uncheckedAll();
    }
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item: TData, property: string) => {
        switch (property) {
          case 'vote':
            const voteTypeId = (item as any).voteTypeId || '';
            const votingRights = (item as any).votingRights || 0;

            const allSameVoteType = this.dataSource.data.every(
              (row: any) => row.voteTypeId === voteTypeId
            );

            return allSameVoteType ? votingRights : voteTypeId;

          default:
            return (item as any)[property];
        }
      };
    }
  }



  setupDisplayColumns(columns: ITableColumn<TData>[]): void {
    if (columns) {
      this.displayColumns = columns
        .filter(c => c.isHidden !== true)
        .map(c => c.name as string);
    }
  }

  getDisplayValue(data: TData, column: ITableColumn<TData>): any {
    if (column.getDisplayValue) {
      return column.getDisplayValue(data);
    }

    const value = (data as any)[column.name];

    if (column.type === this.columnType.date && value) {
      return this.dateFormatPipe.transform(value);
    }

    return value;
  }

  getCellFullText(data: TData, column: ITableColumn<TData>): string {
    const value = this.getDisplayValue(data, column);
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.map(v => (v === null || v === undefined) ? '' : String(v)).join(', ');
    }
    return String(value);
  }

  truncateText(value: string, limit: number = this.breakLinesTruncateLength): string {
    if (!value) {
      return '';
    }
    if (value.length <= limit) {
      return value;
    }
    return value.slice(0, limit).trimEnd() + '…';
  }

  shouldShowFullTextOnHover(value: string, column: ITableColumn<TData>): boolean {
    return column.breakLines === true && value.length > this.breakLinesTruncateLength;
  }

  applyFilter(filters: ITableFilter[]) {
    if(!filters || filters.length === 0) {
      this.dataSource.filter = '';
      return;
    }

    this.dataSource.filter = JSON.stringify(filters);

    if (this.dataSource.paginator) {
      this.onPageChange(1);
    }
  }

  filterPredicate(record: TData, filterString: string) {
    var tableFilters = JSON.parse(filterString) as ITableFilter[];

    for (const filter of tableFilters) {
      let values: any[] = [];
      for(const property of filter.properties) {
        const recordValue = record[property as keyof TData];

        if(recordValue != undefined && Array.isArray(recordValue)){
          values = [...values, ...recordValue];
        }
        else if(recordValue){
          values.push(recordValue);
        }
      }

      if(values.length === 0) {
        return false;
      }

      if (Array.isArray(filter.value)) {
        if(filter.value.filter(x => values.includes(x)).length === 0) {
          return false;
        }
      }
      else{
        let match = false;
        const typeOfFilterValue = typeof filter.value;
        for(let i = 0; i < values.length; i++) {
          if (typeof values[i] === 'string' && typeOfFilterValue === 'string') {
            if (values[i].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1) {
              match = true;
              break;
            }
          } else if (values[i] == filter.value) {
            match = true;
            break;
          }
        }

        if(!match){
          return false;
        }
      }
    }

    return true;
  }

  handleClick(element: any, column: any) {
    this._router.navigateByUrl(`/`, { skipLocationChange: true }).then(_ => {
      this._router.navigate([column.getLink(element)]);
    });
  }

  onPageChange(page: number): void {
    if(page >=1 && page <= this.paginator.getNumberOfPages())
    this.paginator.pageIndex = page - 1; // mat-paginator has index of 0
    this.paginator.page.next({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
  }

  uncheckedAll(): void {
    this.allSelected = false;

    this.votes.forEach((row: any) => {
      if (row.isEligible) {
        row.isSelected = false;
      }
    });

    this.rowsUpdated.emit(this.votes);
  }


  onSelectAll(isChecked: boolean): void {
    this.allSelected = isChecked;

    this.votes.forEach((row: any) => {
      if (row.isEligible) {
        row.isSelected = isChecked; // Select or deselect based on header checkbox
      }
    });

    // Emit the updated state of rows
    this.rowsUpdated.emit(this.votes);
  }

  onCheckboxChange(row: ISrsBallotVote): void {
    // Check if all rows are selected
    const eligibleRows = this.votes.filter((row: any)=> row.isEligible);
    const selectedRows = eligibleRows.filter((row: any) => row.isSelected);
    this.allSelected = selectedRows.length === eligibleRows.length && selectedRows.length > 0;

    // Emit the updated state of rows
    this.rowsUpdated.emit(this.votes);
  }

  onSortChange(sortState: Sort): void {
    this.applySort.emit(sortState);
  }

}
