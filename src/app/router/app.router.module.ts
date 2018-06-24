import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { HomeComponent } from '../components/home/home.component';
import { QuickStartComponent } from '../components/quick-start/quick-start.component';
import { AboutComponent } from '../components/about/about.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {title: 'AuthorArranger'}
  },

  {
    path: 'quick-start',
    component: QuickStartComponent,
    data: {title: 'AuthorArranger QuickStart'}
  },

  {
    path: 'about',
    component: AboutComponent,
    data: {title: 'About AuthorArranger'}
  },

  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true}),
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRouterModule {}
