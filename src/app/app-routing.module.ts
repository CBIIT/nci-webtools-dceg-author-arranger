import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './components/help/help.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'AuthorArranger' }
  },

  {
    path: 'help',
    component: HelpComponent,
    data: { title: 'AuthorArranger Help' }
  },

  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    {
      useHash: true,
    },
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
