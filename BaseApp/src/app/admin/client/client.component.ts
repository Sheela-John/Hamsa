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

  constructor(private router: Router, public clientService: ClientService, private route: ActivatedRoute,
    private flashMessageService: FlashMessageService) {
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    this.getAllClients();
  }

  addClient() {
    this.router.navigateByUrl('admin/client/addEditClient')
  }

  editClient(clientId) {
    this.router.navigateByUrl('admin/client/addEditClient/' + clientId);
  }

  getAllClients() {
    this.clientService.getAllClients().subscribe(res => {
      if (res.status) {
        this.ClientDataArr = res.data;
        console.log(this.ClientDataArr)
      }
      this.dtTrigger.next(null);
    })
  }
}