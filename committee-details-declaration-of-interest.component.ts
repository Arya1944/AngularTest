import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ICommitteeDeclarationOfInterest } from '../../shared/models/committee-details-declaration-of-interest';
import { ITableColumn } from 'app/core/controls/table/table-column';

const mockData: ICommitteeDeclarationOfInterest[] = [
      {
      name: 'John Doe',
      nominatingOrganisationName: 'Org A',
      employerName: 'XYZ Corp',
      professionalPosition: 'Engineer',
      otherEmploymentOrPaymentForServices: 'Consulting for ABC Ltd',
      otherPositionsHeldVoluntary: 'Board Member at Charity X',
      otherInterests: 'Shares in XYZ Corp',
      roleType: 'Member',
      roleStatus: 'Active',
      },
      {
      name: 'Jane Smith',
      nominatingOrganisationName: 'Org B',
      employerName: 'DEF Inc',
      professionalPosition: 'Manager',
      otherEmploymentOrPaymentForServices: '',
      otherPositionsHeldVoluntary: '',
      otherInterests: '',
      roleType: 'Chair',
      roleStatus: 'Inactive',
      },
       {
      name: 'John Doe1',
      nominatingOrganisationName: 'Org A',
      employerName: 'XYZ Corp',
      professionalPosition: 'Engineer',
      otherEmploymentOrPaymentForServices: 'Consulting for ABC Ltd',
      otherPositionsHeldVoluntary: 'Board Member at Charity X',
      otherInterests: 'Shares in XYZ Corp',
      roleType: 'Member',
      roleStatus: 'Active',
      },
       {
      name: 'John Doe9',
      nominatingOrganisationName: 'SF_CONNECT_AUTO_OrgTestHKS2AUTOSF_CONNECT_NormOrgTest91NI Org A',
      employerName: 'XYZ Corp',
      professionalPosition: 'Engineer',
      otherEmploymentOrPaymentForServices: 'Consulting for ABC Ltd',
      otherPositionsHeldVoluntary: 'Board Member at Charity X',
      otherInterests: 'Shares in XYZ Corp',
      roleType: 'Member',
      roleStatus: 'Active',
      },
       {
      name: 'John Doe8',
      nominatingOrganisationName: 'SF_CONNECT_AUTO_OrgTestHKS2AUTOSF_CONNECT_NormOrgTest91NI',
      employerName: 'XYZ Corp',
      professionalPosition: 'Engineer',
      otherEmploymentOrPaymentForServices: 'Consulting for ABC Ltd',
      otherPositionsHeldVoluntary: 'Board Member at Charity X',
      otherInterests: 'Shares in XYZ Corp',
      roleType: 'Member',
      roleStatus: 'Active',
      },
       {
      name: 'John Doe6',
      nominatingOrganisationName: 'SF_CONNECT_AUTO_OrgTestHKS2AUTOSF_CONNECT_NormOrgTest91NI Org A',
      employerName: 'XYZ Corp',
      professionalPosition: 'Engineer',
      otherEmploymentOrPaymentForServices: 'Consulting for ABC Ltd',
      otherPositionsHeldVoluntary: 'Board Member at Charity X',
      otherInterests: 'Shares in XYZ Corp',
      roleType: 'Member',
      roleStatus: 'Active',
      },
    ];
@Component({
  selector: 'app-committee-details-declaration-of-interest',
  templateUrl: './committee-details-declaration-of-interest.component.html',
  styleUrls: ['./committee-details-declaration-of-interest.component.scss'],
})
export class CommitteeDetailsDeclarationOfInterestComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() declarationOfInterest: ICommitteeDeclarationOfInterest[] = [];
  @Input() loading: boolean = true;
  subscriptions: Subscription = new Subscription();

  tableData: ICommitteeDeclarationOfInterest[] = [];
  tableColumns: ITableColumn<ICommitteeDeclarationOfInterest>[] = [];


 
 
    // Use mockData if declarationOfInterest is empty
    getDeclarationOfInterestMock(): ICommitteeDeclarationOfInterest[] {
      return [...this.declarationOfInterest, ...mockData];
    }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {

    console.log(this.getDeclarationOfInterestMock());
    this.initializeTableColumns();
    this.initializeTableData();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['declarationOfInterest'] &&
      changes['declarationOfInterest'].currentValue &&
      !changes['declarationOfInterest'].firstChange
    ) {
      this.declarationOfInterest =
        changes['declarationOfInterest'].currentValue;
      this.initializeTableData();
    }
  }

  initializeTableData() {
     console.log(this.getDeclarationOfInterestMock());
    this.tableData = this.getDeclarationOfInterestMock();
  
  }
  initializeTableColumns() {
    let columns: ITableColumn<ICommitteeDeclarationOfInterest>[] = [
      {
        name: 'name',
        displayName: 'Full Name',
        isSortable: true,
        width: '200px',
        breakLines: true,
      },
      {
        name: 'nominatingOrganisationName',
        displayName: 'Nominating Organisation',
        isSortable: true,
        breakLines: true,
        width: '220px',
      },
      {
        name: 'employerName',
        displayName: 'Employer',
        isSortable: true,
        width: '180px',
      },
      {
        name: 'professionalPosition',
        displayName: 'Professional Position',
        isSortable: true,
        width: '180px',
      },
      {
        name: 'otherEmploymentOrPaymentForServices',
        displayName: 'Other Employment',
        isSortable: true,
        width: '240px',
        breakLines: true,
      },
      {
        name: 'otherPositionsHeldVoluntary',
        displayName: 'Other Positions Held - Voluntary',
        isSortable: true,
        width: '240px',
        breakLines: true,
      },
      {
        name: 'otherInterests',
        displayName: 'Other Interests',
        isSortable: true,
        width: '200px',
        breakLines: true,
      },
      {
        name: 'roleType',
        displayName: 'Role Type',
        isSortable: true,
        width: '150px',
      },
    ];

    this.tableColumns = columns;
  }
}
