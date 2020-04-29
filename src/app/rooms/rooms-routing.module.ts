import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomsComponent } from './rooms.component';
import { AuthGuard } from './../guards/auth.guard';
import { OwnerGuard } from '../guards/owner.guard';

const routes: Routes = [
  { path: '', component: RoomsComponent },
  { path: 'create', loadChildren: () => import('./create/create.module').then(m => m.CreateModule), canActivate: [AuthGuard] },
  {
    path: 'edit/:id',
    loadChildren: () => import('./create/create.module').then(m => m.CreateModule),
    canActivate: [AuthGuard, OwnerGuard],
  },
  { path: 'chat/:id', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard],
})
export class RoomsRoutingModule { }
