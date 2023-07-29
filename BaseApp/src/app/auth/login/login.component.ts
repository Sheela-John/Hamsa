import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {environment} from '../../../environments/environment';
import * as Parse from 'parse';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  public routerData: any;
  public loginForm: any;
  public isFormSubmitted: boolean | undefined;


  constructor(private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, private router: Router,private flashMessageService:FlashMessageService) { 

  this.router = router;
    this.route.params.subscribe((params) => {
      console.log("params:", params);
      this.routerData = params['link'];
      console.log("This.routerData", this.routerData)
    })
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL =   environment.PARSE_SERVER_URL

  }

  ngOnInit(): void {
    localStorage.clear();
    this.intializeLoginForm();
    console.log(environment.PARSE_APP_ID,environment.PARSE_JS_KEY, environment.PARSE_SERVER_URL)
  }

  intializeLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
//login
  login() {
    this.isFormSubmitted = true;
    var data,username,password ;
    if (this.loginForm.valid) {

      var self = this;
       username = this.loginForm.controls['username'].value;
       password = this.loginForm.controls['password'].value;
    }
      
    data={
      username:username,
      password:password
    }
this.authService.login(data).subscribe(res => {
        console.log(res)
        if (res.status) {
       
          localStorage.setItem('Authorization-Token', res.accessToken);
          localStorage.setItem('Refresh-Token', res.refreshToken);
          localStorage.setItem('role', res.scope);
          this.navigateBasedOnRole(res);
        }
        else if (res.code == 125) {
          console.log(res)
          self.flashMessageService.errorMessage("User does not Exist", 2);
        }
        else {
          console.log(res)
          self.flashMessageService.errorMessage(res.message);
        }
      }, error => {
        console.log(error)
      })
    }
  

  saveRole() {
      sessionStorage.setItem("role", "admin");
  }

  navigateBasedOnRole(LoginData: any) {
    if (LoginData.scope == "PORTAL_ADMIN") {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  enterKeyPressed(event) {
    if (event.keyCode === 13) {
      this.loginInBase4App();
    }
  }

  forgetpassword() {
    localStorage.setItem('role', "PORTAL_ADMIN");
    this.router.navigate(['/auth/forgetpassword']);
  }
  //*********************************************** Base4App API Intergration********************************************************************************** *//
  //loginInBase4App
 async loginInBase4App() {
  this.isFormSubmitted = true;
  var data = {};
  if (this.loginForm.valid) {
    console.log("tfsdygscj")
    var self = this;
    const username = this.loginForm.controls['username'].value;
    const password = this.loginForm.controls['password'].value;
   
    
  let user=  Parse.User.logIn(username, password,).then(() => {
    
        self.flashMessageService.successMessage("Successfully Authenticated");
      this.router.navigate(['/admin/dashboard']);
  });
  console.log(user)
  }
}
}