import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { WebToolComponent } from '../components/web-tool/web-tool.component';
import { UserGuideComponent } from '../components/user-guide/user-guide.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: {title: 'AuthorArranger'}
  },

  {
    path: 'web-tool',
    component: WebToolComponent,
    data: {title: 'AuthorArranger Tool'}
  },

  {
    path: 'user-guide',
    component: UserGuideComponent,
    data: {title: 'AuthorArranger User Guide'}
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
