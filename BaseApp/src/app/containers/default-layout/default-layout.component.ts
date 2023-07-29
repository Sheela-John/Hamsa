import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { navItems } from '../../_nav';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnInit {

  public navData;
  isList: number | undefined;
  isMenu: boolean = false;
  public role: string | null;
  isMenuBtn() {
    this.isMenu = !this.isMenu;
  }
  isSearch: boolean = false;
    constructor(public router: Router) {
      this.role = localStorage.getItem('role');
      this.navData = new navItems().adminNavItems;
      // if (this.role == 'PORTAL_ADMIN') {
      //   this.navData = new navItems().adminNavItems;
      //   console.log("navData:", this.navData);
      // }
    }
    ngOnInit(): void {}

}
