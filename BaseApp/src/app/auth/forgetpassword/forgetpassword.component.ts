import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationUtil } from 'src/app/util/pipes/validation.util';
import { FlashMessageService } from "../../shared/flash-message/flash-message.service";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.scss']
})

export class ForgetpasswordComponent implements OnInit {
  public year : any;
  public forgetPasswordForm: any;
  public isFormSubmit: Boolean = false;
  public role: any;
  public showSuccessDiv: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private flashMessageService: FlashMessageService) {
    this.flashMessageService.errorMessage("", 1);
  }

  ngOnInit(): void {
    this.role = localStorage.getItem("role");
    console.log(this.role)
    this.initialiseforgetPasswordForm();
    this.year = new Date().getFullYear();  
  }

  initialiseforgetPasswordForm() {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required], ValidationUtil.validateEmail],
      role: ['']
    })
  }

  setRole(role) {
    this.forgetPasswordForm.controls['role'].setValue(role);
  }

  onSubmit() {
    this.isFormSubmit = true;
    if (this.forgetPasswordForm.valid) {
      this.setRole('PORTAL_ADMIN');
      this.authService.ForgetPassword(this.forgetPasswordForm.value).subscribe(res => {
        if (res.status) {
          this.showSuccessDiv = true;
          this.flashMessageService.successMessage("Reset Password Link Has Been Sent Successfully.", 2);
          sessionStorage.clear();
        }
        else {
          this.flashMessageService.errorMessage("Email Id Entered Is Not Registered With Us.", 2);
        }
      })
    }
  }
}

