import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowser().bootstrapModule(AppModule, {
  // Angular 22 defaults NgModule apps to zoneless change detection;
  // this app's state updates are driven by web-worker responses and
  // relies on zone.js-based change detection.
  applicationProviders: [provideZoneChangeDetection()],
})
  .catch(err => console.error(err));
