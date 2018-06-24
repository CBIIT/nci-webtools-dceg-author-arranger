import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../services/store/store.service';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { FileInfo, AppState, INITIAL_APP_STATE, DeepPartial, Author } from '../../app.models';
import { cloneDeep, merge as mergeDeep } from 'lodash';

@Component({
  selector: 'author-arranger-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  state: AppState = cloneDeep(INITIAL_APP_STATE);

  constructor(private arranger: ArrangerService) { }

  ngOnInit() { }

  merge(newState: DeepPartial<AppState>) {
    this.state = Object.assign({}, this.state, newState);
    console.log('merged', this.state);
  }

  async arrange() {
    const newState = await this.arranger.arrange(this.state);
    this.merge(newState);
  }

  async reorder(authors: Author[]) {
    this.merge({authors});
    const newState = await this.arranger.reorder(this.state);
    this.merge(newState);
  }

  log(event: any) {
    console.log('logged', cloneDeep(event));
  }

}
