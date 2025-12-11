import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommitteeDetailsDeclarationOfInterestComponent } from './committee-details-declaration-of-interest.component';
import { ICommitteeDeclarationOfInterest } from '../../shared/models/committee-details-declaration-of-interest';
import { SimpleChange } from '@angular/core';
import { TableComponent } from '../../../controls/table/table.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommitteeDetailsDeclarationOfInterestComponent', () => {
  let component: CommitteeDetailsDeclarationOfInterestComponent;
  let fixture: ComponentFixture<CommitteeDetailsDeclarationOfInterestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteeDetailsDeclarationOfInterestComponent, TableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(
      CommitteeDetailsDeclarationOfInterestComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize table columns on ngOnInit', () => {
    component.ngOnInit();
    expect(component.tableColumns.length).toBeGreaterThan(0);
    expect(component.tableColumns.map(c => c.displayName)).toContain('Full Name');
  });

  it('should initialize table data on ngOnInit', () => {
    const mockData: ICommitteeDeclarationOfInterest[] = [
      {
        name: 'NomOrg CommitteeMember',
        nominatingOrganisationName: 'Connect Test Nom Org',
        employerName: 'Test NAT Comm Account',
        professionalPosition: 'CM',
        otherEmploymentOrPaymentForServices: 'Test CM',
        otherPositionsHeldVoluntary: 'Committee Member',
        otherInterests: '',
        roleType: 'Participating Member',
        roleStatus: 'Current'
      }
    ];
    component.declarationOfInterest = mockData;
    component.ngOnInit();
    expect(component.tableData).toEqual(mockData);
  });

  it('should update table data when ngOnChanges detects new declarationOfInterest', () => {
    const mockData: ICommitteeDeclarationOfInterest[] = [
      {
        name: 'NomOrg CommitteeMember',
        nominatingOrganisationName: 'Connect Test Nom Org',
        employerName: 'Test NAT Comm Account',
        professionalPosition: 'CM',
        otherEmploymentOrPaymentForServices: 'Test CM',
        otherPositionsHeldVoluntary: 'Committee Member',
        otherInterests: '',
        roleType: 'Participating Member',
        roleStatus: 'Current'
      }
    ];
    component.declarationOfInterest = [];
    component.ngOnChanges({
      declarationOfInterest: new SimpleChange([], mockData, false),
    });
    expect(component.tableData).toEqual(mockData);
  });

  it('should set empty tableData when declarationOfInterest is null', () => {
    component.declarationOfInterest = null as any;
    component.initializeTableData();
    expect(component.tableData).toEqual([]);
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const unsubscribeSpy = spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
