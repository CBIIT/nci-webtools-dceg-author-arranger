import { Component } from '@angular/core';
import { AppState } from '../../app.models';
import { StoreService } from '../../services/store/store.service';
import { get, isNil, isEmpty } from 'lodash';

@Component({
  selector: 'author-arranger-email',
  templateUrl: 'email.component.html',
})
export class EmailComponent {

  emails: string[];

  hasData: boolean = false;

  hasEmailColumn: boolean = false;

  constructor(
    private storeService: StoreService,
  ) {
    this.loadState(this.storeService.appState);
    this.storeService.appState$.subscribe(e => {
      this.loadState(e);
    });
  }

  loadState(state: AppState) {
    const fileData = get(state, 'form.file.data');
    const emailColumn = get(state, 'form.author.email.fields[0].column');

    // check for both undefined and null
    this.hasEmailColumn = isNil(emailColumn);
    this.hasData = !isEmpty(fileData);
    this.emails = state.emails;
  }
}
