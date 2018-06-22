import { Injectable } from '@angular/core';
import { AppState } from '../../app.models';
import { cloneDeep, merge, get as getFromPath } from 'lodash';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public appState$: Subject<AppState> = new Subject();
  public subscribe = this.appState$.subscribe.bind(this.appState$);

  private _initialAppState: AppState = {
    form: {
      file: {
        filename: '',
        files: null,
        data: null,
        headers: null,
      },

      author: {
        fields: [
          {
            name: 'Title',
            column: null,
            addPeriod: true,
            disabled: false,
            index: 0,
          },

          {
            name: 'First',
            column: null,
            abbreviate: false,
            addPeriod: false,
            removeSpace: false,
            disabled: false,
            index: 1,
          },

          {
            name: 'Middle',
            column: null,
            abbreviate: false,
            addPeriod: false,
            removeSpace: false,
            disabled: false,
            index: 2,
          },

          {
            name: 'Last',
            column: null,
            abbreviate: false,
            addPeriod: false,
            disabled: false,
            index: 3,
          },

          {
            name: 'Degree',
            column: null,
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 4,
          },

          {
            name: 'Other',
            column: null,
            addComma: false,
            addPeriod: false,
            disabled: false,
            index: 5,
          },
        ],
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
      },

      affiliation: {
        fields: [
          {
            name: 'Department',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 0,
          },

          {
            name: 'Division',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 1,
          },

          {
            name: 'Institute',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 2,
          },

          {
            name: 'Street',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 3,
          },

          {
            name: 'City',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 4,
          },

          {
            name: 'State',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 5,
          },

          {
            name: 'Postal Code',
            column: null,
            addComma: true,
            addPeriod: false,
            index: 6,
          },

          {
            name: 'Country',
            column: null,
            addComma: false,
            addPeriod: false,
            index: 7,
          },
        ],
        separator: 'comma',
        customSeparator: '',
        labelPosition: 'superscript',
        labelStyle: 'numbers',
      },

      email: {
        fields: [
          {
            name: 'Email',
            column: null,
            index: 0,
          },
        ]
      },
    },
    rowIds: [],
    rowOrder: [],
    preserveOrder: false,

    authors: [],
    affiliations: [],
    duplicateAuthors: false,

    markup: {tagName: 'span'},
    emails: [],

    loading: false,
    loadingMessage: 'Loading...',
  };

  private _appState: AppState = this.initialAppState;

  get(path: any) {
    return cloneDeep(getFromPath(this._appState, path));
  }

  get appState() {
    return cloneDeep(this._appState);
  }

  get initialAppState() {
    return cloneDeep(this._initialAppState);
  }

  patchState(partialState: Partial<AppState>) {
    merge(this._appState, partialState);
    this.appState$.next(this.appState);
    console.log(this._appState);
  }

}
