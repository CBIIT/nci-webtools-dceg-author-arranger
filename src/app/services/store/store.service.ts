import { Injectable } from '@angular/core';
import { AppState, INITIAL_APP_STATE } from '../../app.models';
import { cloneDeep, merge, get as getFromPath } from 'lodash';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public appState$: Subject<AppState> = new Subject();
  private _appState: AppState = INITIAL_APP_STATE;

  get appState() {
    return cloneDeep(this._appState);
  }

  get(path: any) {
    return cloneDeep(getFromPath(this._appState, path));
  }

  merge(partialState: Partial<AppState>) {
    merge(this._appState, partialState);
    this.appState$.next(this.appState);
  }

}