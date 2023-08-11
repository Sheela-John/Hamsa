import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServiceComponent } from './service/service.component';
import { AssignServiceComponent } from './assign-service/assign-service.component';
import { StaffsComponent } from './staffs/staffs.component';
import { RoleComponent } from './role/role.component';
import { ReportComponent } from './report/report.component';
import { SettingComponent } from './setting/setting.component';
import { BranchComponent } from './branch/branch.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FlashMessageModule } from "../shared/flash-message/flash-message.module";
import { AddEditRoleComponent } from './role/add-edit-role/add-edit-role.component';
import { AddEditStaffComponent } from './staffs/add-edit-staff/add-edit-staff.component';
import { AddEditServiceComponent } from './service/add-edit-service/add-edit-service.component';
import { DataTablesModule } from 'angular-datatables';
import { AddEditBranchComponent } from './branch/add-edit-branch/add-edit-branch.component';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { AddEditAssignServiceComponent } from './assign-service/add-edit-assign-service/add-edit-assign-service.component';
import { RoundProgressModule, ROUND_PROGRESS_DEFAULTS } from 'angular-svg-round-progressbar';
import { ClientComponent } from './client/client.component';
import { AddEditClientComponent } from './client/add-edit-client/add-edit-client.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { EditSeviceRequestComponent } from './service-request/edit-sevice-request/edit-sevice-request.component';
import { BranchTransferComponent } from './staffs/branch-transfer/branch-transfer.component';
import { ViewStaffBranchTransferComponent } from './staffs/view-staff-branch-transfer/view-staff-branch-transfer.component';
import { BranchTranferDataComponent } from './staffs/branch-tranfer-data/branch-tranfer-data.component';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TransportExpenseComponent } from './transport-expense/transport-expense.component'
import { AddEditTransportExpenseComponent } from './transport-expense/add-edit-transport-expense/add-edit-transport-expense.component';
@NgModule({
    declarations: [
        DashboardComponent,
        ServiceComponent,
        AssignServiceComponent,
        StaffsComponent,
        RoleComponent,
        BranchComponent,
        ReportComponent,
        SettingComponent,
        AddEditRoleComponent,
        AddEditStaffComponent,
        AddEditServiceComponent,
        AddEditBranchComponent,
        AddEditAssignServiceComponent,
        ClientComponent,
        AddEditClientComponent,
        LeaveRequestComponent,
        ServiceRequestComponent,
        EditSeviceRequestComponent,
        BranchTransferComponent,
        ViewStaffBranchTransferComponent,
        BranchTranferDataComponent,
        TransportExpenseComponent,
        AddEditTransportExpenseComponent
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaterialTimepickerModule,
        FlashMessageModule,
        DataTablesModule,
        GooglePlaceModule,
        RoundProgressModule,
        NgMultiSelectDropDownModule.forRoot(),
        BsDatepickerModule.forRoot()
    ],
    providers: [{
        provide: ROUND_PROGRESS_DEFAULTS,
        useValue: {
            color: '#f00',
            background: '#0f0'
        }
    }]
})

export class AdminModule { }