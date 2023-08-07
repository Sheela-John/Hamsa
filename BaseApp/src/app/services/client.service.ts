import { Injectable } from '@angular/core';
import { ClientDataService } from "../api/client-data.service";

@Injectable({
    providedIn: 'root'
})

export class ClientService {
    constructor(private clientDataService: ClientDataService) { }

    //Create Session
    public createSession(data) {
        return this.clientDataService.createSession(data);
    }

    //Create Client
    public createClient(data) {
        return this.clientDataService.createClient(data);
    }

    //Get Client By Id
    public getClientById(id) {
        return this.clientDataService.getClientbyId(id);
    }

    //Get All Clients
    public getAllClients() {
        return this.clientDataService.getAllClients();
    }
}