import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('container')
  container: ElementRef;

  @ViewChild('removed')
  removedContainer: ElementRef;

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


  handleKeyboardEvent(event) {
    if (!this.container) return;

    const el = event.target as HTMLDivElement;
    const containerEl = el.parentElement;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      const nextSibling = el.nextSibling;
      console.log(nextSibling);
      if (nextSibling && nextSibling.constructor === HTMLDivElement) {
        containerEl.insertBefore(nextSibling, el);
        setTimeout(e => el.focus(), 0);
        this.reindexAuthors();
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      const previousSibling = el.previousSibling;
      console.log(previousSibling);
      if (previousSibling && previousSibling.constructor === HTMLDivElement) {
        containerEl.insertBefore(el, previousSibling);
        setTimeout(e => el.focus(), 0);
        this.reindexAuthors();
      }
    } else if (event.key === 'Enter' || event.key === 'Delete') {
      const id = +el.getAttribute('data-id');
      const author = this.authors.find(author => author.id === id)
      author.removed = !author.removed;
      this.reindexAuthors();

      console.log(event);
    }
  }

  reindexAuthors() {
    if (!this.container) return;
    const containerEl = this.container.nativeElement as HTMLDivElement;
    const removedContainerEl = this.removedContainer.nativeElement as HTMLDivElement;
    const children = [
      ...Array.from(containerEl.children),
      ...Array.from(removedContainerEl.children)
    ];

    setTimeout(() => {
      this.authors = Array.from(containerEl.children)
      .map(child => +child.getAttribute('data-id'))
      .map(id => this.authors.find(author => author.id === id))

      this.change.emit(this.authors);
    }, 10);
  }


}
