import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from './components/help/help.component';
import { FormComponent } from './components/form/form.component';
import { PreviewComponent } from './components/preview/preview.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FileValueAccessor } from './direcives/file-value-accessor.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
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
    NgbModule,
  ],
  providers: [
    FormBuilder,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
