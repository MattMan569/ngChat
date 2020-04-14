import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomsRoutingModule } from './rooms-routing.module';
import { AngularMaterialModule } from '../angular-material.module';
import { RoomsComponent } from './rooms.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RoomsRoutingModule,
    AngularMaterialModule,
  ],
  declarations: [RoomsComponent],
})
export class RoomsModule { }
