import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';


@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    AngularMaterialModule,
  ],
})
export class ChatModule { }
