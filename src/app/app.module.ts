import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRouterModule } from './router/app.router.module';

import { ArrangerService } from './services/arranger/arranger.service';
import { FileService } from './services/file/file.service';
import { WorkerService } from './services/worker/worker.service';
import { StoreService } from './services/store/store.service';

import { AppComponent } from './app.component';
import { FileInputComponent } from './components/file-input/file-input.component';
import { FormComponent } from './components/form/form.component';
import { PreviewComponent } from './components/preview/preview.component';
import { ReorderComponent } from './components/reorder/reorder.component';
import { FileValueAccessorDirective } from './directives/file-value-accessor/file-value-accessor.directive';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FieldsComponent } from './components/fields/fields.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { UserGuideComponent } from './components/user-guide/user-guide.component';
import { WebToolComponent } from './components/web-tool/web-tool.component';

@NgModule({
  declarations: [
    AppComponent,
    FileInputComponent,
    FormComponent,
    PreviewComponent,
    ReorderComponent,
    FileValueAccessorDirective,
    NavbarComponent,
    FieldsComponent,
    WelcomeComponent,
    UserGuideComponent,
    WebToolComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRouterModule,
    DragDropModule,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    ArrangerService,
    FileService,
    WorkerService,
    StoreService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
