import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRouterModule } from './router/app.router.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';

import { ArrangerService } from './services/arranger/arranger.service';
import { FileService } from './services/file/file.service';
import { WorkerService } from './services/worker/worker.service';
import { StoreService } from './services/store/store.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { QuickStartComponent } from './components/quick-start/quick-start.component';
import { AboutComponent } from './components/about/about.component';
import { FileInputComponent } from './components/file-input/file-input.component';
import { FormComponent } from './components/form/form.component';
import { PreviewComponent } from './components/preview/preview.component';
import { ReorderComponent } from './components/reorder/reorder.component';
import { EmailsComponent } from './components/emails/emails.component';
import { FileValueAccessorDirective } from './directives/file-value-accessor/file-value-accessor.directive';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FieldsComponent } from './components/fields/fields.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    QuickStartComponent,
    AboutComponent,
    FileInputComponent,
    FormComponent,
    PreviewComponent,
    ReorderComponent,
    EmailsComponent,
    FileValueAccessorDirective,
    NavbarComponent,
    FieldsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRouterModule,
    HttpClientModule,
    NgbModule.forRoot(),
    DragulaModule,
  ],
  providers: [
    ArrangerService,
    FileService,
    WorkerService,
    StoreService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
