import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefaultLayoutComponent } from './containers/default-layout/default-layout.component';
import { CommonLayoutComponent } from './containers/common-layout/common-layout.component';
import { AdminComponent } from './admin/admin.component';
import { AdminModule } from './admin/admin.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppHttpInterceptor } from './util/httpInterceptor/app-http-interceptor';
import { FlashMessageModule } from './shared/flash-message/flash-message.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from "ngx-toastr";
const APP_CONTAINERS = [
  DefaultLayoutComponent,
  CommonLayoutComponent
];

@NgModule({
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    AdminComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FlashMessageModule,
    AdminModule,
    NgxMaterialTimepickerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers:  [{
    provide: HTTP_INTERCEPTORS,
    useClass: AppHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})

export class AppModule { }