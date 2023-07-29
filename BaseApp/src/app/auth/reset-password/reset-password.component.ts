import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationUtil } from 'src/app/util/pipes/validation.util';
import { FlashMessageService } from "../../shared/flash-message/flash-message.service";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

export class ResetPasswordComponent implements OnInit {
  public passwordForm: any;
  public showTokenExpiredDiv: boolean = false;  //Token Expired Div
  public TokenExpired: boolean = false;  //Switch Text between Expired and Invalid
  public showSuccessDiv: boolean = false; //Show Password Successfully set
  public initializeHtmlView: boolean = false;
  public isPasswordFormSubmitted: boolean = false;
  public fieldPasswordType: Boolean | undefined;
  public fieldConfirmPasswordType: Boolean | undefined;
  public password: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute, private flashMessageService: FlashMessageService) {
    this.flashMessageService.errorMessage("", 1);
  }

  ngOnInit(): void {
    // this.verifyToken(this.route.snapshot.params['token']);
    this.initializePasswordForm();
  }

  /*1.To Initialize Password*/
  initializePasswordForm() {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    }, 
    {
      validator: ValidationUtil.comparePasswords // your validation method
    })
  }

  /*2.To Toggle Eye slash in Password Field*/
  toggleFieldPasswordType() {
    this.fieldPasswordType = !this.fieldPasswordType;
  }

  /*3.To Toggle Eye slash in Confirm Password Field*/
  toggleFieldConfirmPasswordType() {
    this.fieldConfirmPasswordType = !this.fieldConfirmPasswordType;
  }

  /*4.Form On-Submit*/
  onSubmit() {
    this.isPasswordFormSubmitted = true;
    if (this.passwordForm.valid) {
      var password = this.passwordForm.controls['password'].value;
      var token = this.route.snapshot.params['token'];
      var data = {
        password: password,
        resetPasswordToken: token
      }
      this.authService.resetPassword(data).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Password Reseted Successfully", 2);
          this.showSuccessDiv = true;
          this.router.navigateByUrl('/auth/login');
          console.log("res", res)
        }
      }, error => {
        console.log("Error", error);
        this.flashMessageService.errorMessage("Error While Reseting Password", 2);
      })
    }
  }

  /*5.To Verify Token*/
  verifyToken(token) {
    this.authService.verifyResetToken(token).subscribe(res => {
      this.initializeHtmlView = true;
      if (!res.validToken) {
        this.showTokenExpiredDiv = true;
        if (res.code == 108) {
          this.TokenExpired = true;
        }
      }
    }, function (err) {
      console.log(err);
    })
  }
}