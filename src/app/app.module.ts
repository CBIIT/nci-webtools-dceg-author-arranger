import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelpComponent } from './components/help/help.component';
import { FormComponent } from './components/form/form.component';
import { PreviewComponent } from './components/preview/preview.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FileValueAccessor } from './directives/file-value-accessor.directive';
import { ParserService } from './services/parser/parser.service';


@NgModule({
  declarations: [
    AppComponent,
    HelpComponent,
    FormComponent,
    PreviewComponent,
    NavbarComponent,
    FileValueAccessor,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    DragulaModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
  ],
  providers: [
    FormBuilder,
    ParserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
