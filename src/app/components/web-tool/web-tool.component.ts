import { Component, OnInit } from '@angular/core';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { AppState, INITIAL_APP_STATE, DeepPartial, Author } from '../../app.models';
import { cloneDeep } from 'lodash';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'author-arranger-web-tool',
  templateUrl: './web-tool.component.html',
  styleUrls: ['./web-tool.component.css']
})
export class WebToolComponent implements OnInit {

  state: AppState = cloneDeep(INITIAL_APP_STATE);

  loading: boolean = false;

  constructor(private arranger: ArrangerService) { }

  ngOnInit() { }

  merge(newState: DeepPartial<AppState>) {
    this.state = Object.assign({}, this.state, newState);
    if (!environment.production)
      this.log(this.state);
  }

  async arrange() {
    const loadingTimeout = setTimeout(() => this.loading = true, 150);

    try {
      const newState = await this.arranger.arrange(this.state);
      this.merge(newState);
    } catch(e) {
      console.log(e);
    } finally {
      clearTimeout(loadingTimeout):
      this.loading = false;
    }
  }

  async reorder(authors: Author[]) {
    const loadingTimeout = setTimeout(() => this.loading = true, 150);
    try {
      this.loading = true;
      this.merge({authors});
      const newState = await this.arranger.reorder(this.state);
      this.merge(newState);
    } catch(e) {
      console.log(e);
    } finally {
      clearTimeout(loadingTimeout):
      this.loading = false;
    }
  }

  log(event) {
    console.log(cloneDeep(event));
  }

}
