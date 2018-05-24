import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
  ],
  providers: [
    ArrangerService,
    FormBuilder,
    ParserService,
    FileService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
