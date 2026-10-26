import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment.development';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-not403',
  standalone: true,
  imports: [RouterLink, NgIf, MaterialModule],
  templateUrl: './not403.component.html',
  styleUrl: './not403.component.css'
})
export class Not403Component implements OnInit {

  username = '';

  ngOnInit(): void {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    if (!token) {
      return;
    }
    try {
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(token);
      this.username = decodedToken?.sub ?? '';
    } catch {
      this.username = '';
    }
  }

}
