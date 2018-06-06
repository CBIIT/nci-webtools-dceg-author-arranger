import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './components/help/help.component';
import { FormComponent } from './components/form/form.component';
import { QuickStartComponent } from './components/quick-start/quick-start.component';

const routes: Routes = [
  {
    path: '',
    component: FormComponent,
    data: { title: 'AuthorArranger' }
  },

  {
    path: 'quick-start',
    component: QuickStartComponent,
    data: { title: 'AuthorArranger Quick Start' }
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
