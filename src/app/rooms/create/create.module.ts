import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AngularMaterialModule } from 'src/app/angular-material.module';
import { CreateRoutingModule } from './create-routing.module';

import { CreateComponent } from './create.component';


@NgModule({
  declarations: [CreateComponent],
  imports: [
    CommonModule,
    CreateRoutingModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class CreateModule { }
