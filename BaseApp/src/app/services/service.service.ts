import { Injectable } from '@angular/core';
import { ServiceDataService } from "../api/service-data.service";

@Injectable({
    providedIn: 'root'
})

export class ServiceService {
    constructor(private serviceDataService: ServiceDataService) { }

    //Add New Service
    public addService(data) {
        return this.serviceDataService.addService(data);
    }

    //Get All Services
    public getAllServices() {
        return this.serviceDataService.getAllServices();
    }

    //Get Service By Id
    public getServiceById(id) {
        return this.serviceDataService.getServiceById(id);
    }

    //Update Service By Id
    public updateService(id, data) {
        return this.serviceDataService.updateService(id, data);
    }

    //Enable or Disable Service
    public enableDisableService(id) {
        return this.serviceDataService.enableDisableService(id);
    }
}