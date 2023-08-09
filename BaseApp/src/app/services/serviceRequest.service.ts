import { Injectable } from '@angular/core';
import { ServiceRequestDataService } from '../api/serviceRequest-data.service';

@Injectable({
    providedIn: 'root'
})

export class ServiceRequestService {
    constructor(private ServiceRequestDataService: ServiceRequestDataService) { }

    //Get All setting
    public getAllServiceRequest() {
        return this.ServiceRequestDataService.getAllServiceRequests();
    }

    //update Setting
    public getServiceRequestById(id) {
        return this.ServiceRequestDataService.getServiceRequestById(id);
    }

    //updateServiceRequest
    public updateServiceRequest(data, id) {
        return this.ServiceRequestDataService.updateServiceRequest(data, id)
    }
}