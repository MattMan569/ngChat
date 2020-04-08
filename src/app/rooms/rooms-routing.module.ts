import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomsComponent } from './rooms.component';

const routes: Routes = [
  { path: '', component: RoomsComponent },
  { path: 'create', loadChildren: () => import('./create/create.module').then(m => m.CreateModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomsRoutingModule { }
