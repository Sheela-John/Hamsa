import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { AuthComponent } from './auth.component';
import { ForgetpasswordComponent } from './forgetpassword/forgetpassword.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FlashMessageModule } from '../shared/flash-message/flash-message.module';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    ForgetpasswordComponent,
    ResetPasswordComponent
  ],

  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    FlashMessageModule,
    ReactiveFormsModule,
  ]
})

export class AuthModule { }