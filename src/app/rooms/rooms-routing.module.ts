import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomsComponent } from './rooms.component';

const routes: Routes = [
  { path: '', component: RoomsComponent },
  { path: 'create', loadChildren: () => import('./create/create.module').then(m => m.CreateModule) },
  { path: 'edit/:id', loadChildren: () => import('./create/create.module').then(m => m.CreateModule) },
  { path: 'chat/:id', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomsRoutingModule { }
