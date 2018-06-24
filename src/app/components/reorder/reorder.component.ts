import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { Author } from '../../app.models';

@Component({
  selector: 'author-arranger-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.css']
})
export class ReorderComponent implements OnInit {

  @Input()
  authors: Author[] = [];

  @Output('on-change')
  change: EventEmitter<Author[]> = new EventEmitter<Author[]>();

  dragOptions = {
    direction: 'horizontal',
    copy: false,
    copySortSource: true,
    invalid: (el, handle) => handle.getAttribute('drag-handle') === null,
  }

  constructor(private dragula: DragulaService) { }

  ngOnInit() {

    this.dragula.drop.subscribe((value: [string, HTMLElement, HTMLElement, HTMLElement]) => {
      const [
        containerName,
        element,
        target,
        source
      ] = value;

      if (containerName !== 'authors')
        return;

      const targetName = target.getAttribute('data-name');
      const authorId = element.getAttribute('data-id');
      const author = this.authors.find(author => author.id == +authorId);
      author.removed = targetName === 'removed';

      if (target != source)
        source.appendChild(element);

      this.change.emit(this.authors);
    });
  }

}
