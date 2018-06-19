import { Component } from '@angular/core';
import { StoreService } from '../../../services/store/store.service';

@Component({
  selector: 'author-arranger-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {

  emails: string;

  constructor(private storeService: StoreService) {
    this.emails = this.storeService.appState.emails.join('; ');
    this.storeService.appState$.subscribe(
      ({emails}) => this.emails = emails.join('; ')
    );
  }
}
