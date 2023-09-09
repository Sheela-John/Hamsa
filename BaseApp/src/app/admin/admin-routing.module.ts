import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignServiceComponent } from './assign-service/assign-service.component';
import { BranchComponent } from './branch/branch.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { RoleComponent } from './role/role.component';
import { ServiceComponent } from './service/service.component';
import { SettingComponent } from './setting/setting.component';
import { AddEditStaffComponent } from './staffs/add-edit-staff/add-edit-staff.component';
import { StaffsComponent } from './staffs/staffs.component';
import { AddEditRoleComponent } from './role/add-edit-role/add-edit-role.component';
import { AddEditServiceComponent } from './service/add-edit-service/add-edit-service.component';
import { AddEditBranchComponent } from './branch/add-edit-branch/add-edit-branch.component';
import { AddEditAssignServiceComponent } from './assign-service/add-edit-assign-service/add-edit-assign-service.component';
import { AddEditClientComponent } from './client/add-edit-client/add-edit-client.component';
import { ClientComponent } from './client/client.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { EditSeviceRequestComponent } from './service-request/edit-sevice-request/edit-sevice-request.component';
import { BranchTransferComponent } from './staffs/branch-transfer/branch-transfer.component';
import { ViewStaffBranchTransferComponent } from './staffs/view-staff-branch-transfer/view-staff-branch-transfer.component';
import {BranchTranferDataComponent} from './staffs/branch-tranfer-data/branch-tranfer-data.component'
import { TransportExpenseComponent } from './transport-expense/transport-expense.component';
import { AddEditTransportExpenseComponent } from './transport-expense/add-edit-transport-expense/add-edit-transport-expense.component';

const routes: Routes = [
    {
        path: "",
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    //Dashboard
    {
        path: 'dashboard',
        component: DashboardComponent
    },

    //Staff
    {
        path: 'staffs',
        component: StaffsComponent
    },
    {
        path: 'staffs/addEditStaff',
        component: AddEditStaffComponent
    },
    {
        path: 'staffs/addEditStaff/:id',
        component: AddEditStaffComponent
    },
    {
        path: 'staffs/branch-Transfer/:id',
        component: BranchTransferComponent
    },
    {
        path:'staffs/viewStaff/:id',
        component:ViewStaffBranchTransferComponent
        // path: 'service',
        // component: ServiceComponent
    },
    {
        path: 'service/addEditService',
        component: AddEditServiceComponent
    },
    {
        path: 'service/addEditService/:id',
        component: AddEditServiceComponent
    },
    {
        path: 'assignService',
        component: AssignServiceComponent
    },
    // {
    //     path: 'addEditAssignService',
    //     component: AddEditAssignServiceComponent
    // },
    {
        path: 'assignService/addEditAssignService/:serviceRequestId',
        component: AddEditAssignServiceComponent
    },
    {
        path: 'assignService/:assignServiceId/addEditAssignService/:show',
        component: AddEditAssignServiceComponent
    },
    {
        path: 'role',
        component: RoleComponent
    },
    {
        path: 'branch',
        component: BranchComponent
    },
    {
        path: 'reports',
        component: ReportComponent
    },
    {
        path: 'settings',
        component: SettingComponent
    },
    {
        path: 'setting-data/settings',
        component: SettingComponent
    },
    {
        path: 'setting-data/settings/:id',
        component: SettingComponent
    },
    {
        path: 'role/addeditrole',
        component: AddEditRoleComponent
    },
    {
        path: 'role/addeditrole/:id',
        component: AddEditRoleComponent
    },
    {
        path: 'branch/addEditBranch',
        component: AddEditBranchComponent
    },
    {
        path: 'branch/addEditBranch/:id',
        component: AddEditBranchComponent
    },
    {
        path: 'assignService/addEditAssignService',
        component: AddEditAssignServiceComponent
    },
    {
        path:'client',
        component:ClientComponent
    },
    {
        path:'client/addEditClient',
        component:AddEditClientComponent
    },
    {
        path:'client/addEditClient/:clientId',
        component:AddEditClientComponent
    },
    {
        path:'leave-Request',
        component:LeaveRequestComponent
    },
    {
        path:'service-Request',
        component:ServiceRequestComponent
    },
    {
        path:'service-Request/edit/:id',
        component:EditSeviceRequestComponent
    },
    {
        path:'branch-Transfer',
        component:BranchTransferComponent
    },
    {
        path:'branch-transfer-data',
        component:BranchTranferDataComponent
        
    },
    {
        path:'branch-transfer-data/:id',
        component:BranchTranferDataComponent
        
    },
    {
        path:'branch-Transfer/:staffId',
        component:BranchTransferComponent
    },
    {
        path:'branch-Transfer/:staffId/edit/:branchTranferId',
        component:BranchTransferComponent
    },

    //Service
    {
        path: 'service',
        component: ServiceComponent
    },
    {
        path: 'addEditService',
        component: AddEditServiceComponent
    },
    {
        path: 'addEditService/:id',
        component: AddEditServiceComponent
    },

    //Assign Service
    {
        path: 'assignService',
        component: AssignServiceComponent
    },
    {
        path: 'assignService/addEditAssignService',
        component: AddEditAssignServiceComponent
    },

    //Role
    {
        path: 'role',
        component: RoleComponent
    },
    {
        path: 'addeditrole',
        component: AddEditRoleComponent
    },
    {
        path: 'role/addeditrole/:id',
        component: AddEditRoleComponent
    },

    //Branch
    {
        path: 'branch',
        component: BranchComponent
    },
    {
        path: 'addEditBranch',
        component: AddEditBranchComponent
    },
    {
        path: 'branch/addEditBranch/:id',
        component: AddEditBranchComponent
    },
    
    //Client
    {
        path:'client',
        component:ClientComponent
    },
    {
        path:'client/addEditClient',
        component:AddEditClientComponent
    },
    {
        path:'client/:clientId/addEditClient/:packageId',
        component:AddEditClientComponent
    },

    //Service Request
    {
        path:'service-request',
        component:ServiceRequestComponent
    },
    {
        path:'service-request/edit/:id',
        component:EditSeviceRequestComponent
    },

    //Report
    {
        path: 'reports',
        component: ReportComponent
    },

    //Transport Expense
    {
        path: 'transport-expense',
        component: TransportExpenseComponent
    },
    {
        path: 'transport-expense/add-transport-expense',
        component: AddEditTransportExpenseComponent
    },
    {
        path: 'transport-expense/edit-transport-expense/:id',
        component: AddEditTransportExpenseComponent
    },

    //Settings
    {
        path: 'settings',
        component: SettingComponent
    },
    
    //Leave Request
    {
        path:'leave-request',
        component:LeaveRequestComponent
    }
];
console.log(routes,"routes")
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AdminRoutingModule { }