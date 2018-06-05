import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './components/help/help.component';
import { FormComponent } from './components/form/form.component';

const routes: Routes = [
  {
    path: '',
    component: FormComponent,
    data: { title: 'AuthorArranger' }
  },

  {
    path: 'about',
    component: HelpComponent,
    data: { title: 'About AuthorArranger' }
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
