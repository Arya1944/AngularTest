import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableComponent } from './table.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('TableComponent', () => {
  let component: TableComponent<any>;
  let fixture: ComponentFixture<TableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TableComponent,
      ],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        FontAwesomeModule,
      ],
      providers: [        
        provideAnimationsAsync()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setupDisplayColumns', () => {
    it('should set displayColumns when columns param is valid', () => {
      component.setupDisplayColumns([
        { name: 'name', displayName: 'Name' },
        { name: 'age', displayName: 'Age', isHidden: true },
      ]);
      expect(component.displayColumns).toEqual(['name']);
    });  
  
    it('should NOT set displayColumns when columns param is invalid', () => {
      component.setupDisplayColumns(undefined as any);
      expect(component.displayColumns).toEqual([]);
    });  
  })  

  describe('applyFilter', () => {
    it('should set dataSource.filter to empty string when filters param is empty', () => {
      component.dataSource = new MatTableDataSource([] as any);
  
      component.applyFilter([]);
      expect(component.dataSource.filter).toBe('');
    });
  
    it('should set dataSource.filter to empty string when filters param is undefined', () => {
      component.dataSource = new MatTableDataSource([] as any);
  
      component.applyFilter(undefined as any);
      expect(component.dataSource.filter).toBe('');
    });
  
    it('should set dataSource.filter to when filters param is not empty', () => {
      component.dataSource = new MatTableDataSource([] as any);
  
      component.applyFilter([{ properties: ['name'], value: 'test' }]);
      expect(component.dataSource.filter).toBe('[{"properties":["name"],"value":"test"}]');
    });
  });  
  
  describe('filterPredicate', () => {
    it('should return true when no filters are applied', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[]';
      expect(component.filterPredicate(record, filterString)).toBe(true);
    });
  
    it('should return true when a single property matches the filter', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name"],"value":"John"}]';
      expect(component.filterPredicate(record, filterString)).toBe(true);
    });
  
    it('should return false when a single property does not match the filter', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name"],"value":"Doe"}]';
      expect(component.filterPredicate(record, filterString)).toBe(false);
    });
  
    it('should return true when multiple properties match the filter', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name", "age"],"value":"John"}]';
      expect(component.filterPredicate(record, filterString)).toBe(true);
    });
  
    it('should return false when multiple properties do not match the filter', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name", "age"],"value":"Doe"}]';
      expect(component.filterPredicate(record, filterString)).toBe(false);
    });
  
    it('should handle case insensitive matches', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name"],"value":"john"}]';
      expect(component.filterPredicate(record, filterString)).toBe(true);
    });
  
    it('should handle array values in the filter', () => {
      const record = { name: 'John', age: 30 };
      const filterString = '[{"properties":["name"],"value":["John", "Doe"]}]';
      expect(component.filterPredicate(record, filterString)).toBe(true);
    });
  });
});
