import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { Subject } from 'rxjs';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { ClientService } from 'src/app/services/client.service';
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})

export class ClientComponent implements OnInit {
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public BranchStatus: any = [];
  public ClientDataArr: any = [];
  public ClientStatusEnableAndDisable: any;

  constructor(private router: Router, public clientService:ClientService,private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    this.getAllClients()

  }

  addClient() {
    this.router.navigateByUrl('admin/client/addEditClient')
  }

  editClient(clientId, PackageId) {
    this.router.navigateByUrl('admin/client/' + clientId + '/addEditClient/' + PackageId);
  }
getAllClients()
{
  this.clientService.getAllClients().subscribe(res=>{
    if(res.status)
    {
      this.ClientDataArr=res.data;
      console.log(this.ClientDataArr)
    }
  })
}
  // async getAllClientInBase4App() {
  //   const branch = Parse.Object.extend('Client');
  //   const query = new Parse.Query(branch);
  //   try {
  //     const clientName = await query.find()
  //     for (const ClientData of clientName) {
  //       this.ClientDataArr.push(
  //         {
  //           "ClientName": ClientData.get("ClientName"),
  //           "ClientAddress": ClientData.get("Address"),
  //           "ClientId": ClientData.id,
  //           "status": ClientData.get("ClientStatus"),
  //           "UHID": ClientData.get("uhid"),
  //           "Email": ClientData.get("Email"),
  //           "NoOfSession": ClientData.get("NoOfSession"),
  //           "WeeklySession": ClientData.get("WeeklySession"),
  //           "Amount": ClientData.get("Amount"),
  //           "Phone": ClientData.get("PhoneNumber"),
  //           "PackageId": ClientData.get("PackageId")
  //         }
  //       )
  //     }
  //     this.dtTrigger.next(null);
  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }
  // }

  // //Base4App Enable or Disable Service 
  async enableDisableClientInBase4App(id) {
    const client = Parse.Object.extend('Client');
    const query = new Parse.Query(client);
    query.equalTo('objectId', id);
    try {
      const client = await query.get(id);
      this.ClientStatusEnableAndDisable = client.get("ClientStatus");
      this.ClientStatusEnableAndDisable = (this.ClientStatusEnableAndDisable == 0) ? 2 : 0
      client.set("ClientStatus", this.ClientStatusEnableAndDisable);
      let result = await client.save()
      client.set("ClientStatus", this.ClientStatusEnableAndDisable);
      const statusRole = client.get("ClientStatus");
      if (statusRole == 0) {
        this.flashMessageService.successMessage("Client Enabled Successfully", 2);
        window.location.reload()
      }
      if (statusRole == 2) {
        this.flashMessageService.errorMessage("Client Disabled Successfully", 2);
        window.location.reload()
      }
    }
    catch (error) {
      this.flashMessageService.errorMessage("Error while Creating Client", 2);
    }
  }
}