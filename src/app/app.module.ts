import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgModule, Renderer2 } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpComponent } from './components/help/help.component';
import { FormComponent } from './components/form/form.component';
import { PreviewComponent } from './components/preview/preview.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FileValueAccessor } from './directives/file-value-accessor.directive';
import { ArrangerService } from './services/arranger/arranger.service';
import { FileService } from './services/file/file.service';
import { QuickStartComponent } from './components/quick-start/quick-start.component';
import { ReorderComponent } from './components/reorder/reorder/reorder.component';
import { FieldsComponent } from './components/fields/fields/fields.component';
import { EmailComponent } from './components/email/email/email.component';

@NgModule({
  declarations: [
    AppComponent,
    HelpComponent,
    FormComponent,
    PreviewComponent,
    NavbarComponent,
    FileValueAccessor,
    QuickStartComponent,
    ReorderComponent,
    FieldsComponent,
    EmailComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    DragulaModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
  ],
  providers: [
    ArrangerService,
    FormBuilder,
    FileService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
