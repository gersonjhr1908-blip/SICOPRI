import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-not404',
  standalone: true,
  imports: [RouterLink, NgIf, MaterialModule],
  templateUrl: './not404.component.html',
  styleUrl: './not404.component.css'
})
export class Not404Component implements OnInit {

  hasSession = false;

  ngOnInit(): void {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    this.hasSession = !!token;
  }

}
