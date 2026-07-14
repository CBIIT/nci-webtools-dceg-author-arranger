import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Author } from '../../app.models';

@Component({
  selector: 'author-arranger-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.css'],
  standalone: false,
})
export class ReorderComponent implements OnChanges {

  @Input()
  authors: Author[] = [];

  @Output('on-change')
  change: EventEmitter<Author[]> = new EventEmitter<Author[]>();

  /** Authors shown in the active (reorderable) list, in output order. */
  activeAuthors: Author[] = [];

  /** Authors moved to the "Removed Authors" list. */
  removedAuthors: Author[] = [];

  ngOnChanges() {
    this.activeAuthors = this.authors.filter(author => !author.removed && author.name?.length > 0);
    this.removedAuthors = this.authors.filter(author => author.removed && author.name?.length > 0);
  }

  drop(event: CdkDragDrop<Author[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.emitChange();
  }

  toggleRemoved(author: Author) {
    if (author.removed) {
      this.removedAuthors = this.removedAuthors.filter(a => a !== author);
      this.activeAuthors = [...this.activeAuthors, author];
    } else {
      this.activeAuthors = this.activeAuthors.filter(a => a !== author);
      this.removedAuthors = [...this.removedAuthors, author];
    }
    this.emitChange();
  }

  handleKeyboardEvent(event: KeyboardEvent, author: Author) {
    const list = author.removed ? this.removedAuthors : this.activeAuthors;
    const index = list.indexOf(author);

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      if (index >= 0 && index < list.length - 1) {
        moveItemInArray(list, index, index + 1);
        this.emitChange();
        this.refocus(author);
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      if (index > 0) {
        moveItemInArray(list, index, index - 1);
        this.emitChange();
        this.refocus(author);
      }
    } else if (event.key === 'Enter' || event.key === 'Delete') {
      this.toggleRemoved(author);
      this.refocus(author);
    }
  }

  /** Rebuilds the authors array from the two lists, updates flags, and notifies the parent. */
  private emitChange() {
    this.activeAuthors.forEach(author => author.removed = false);
    this.removedAuthors.forEach(author => author.removed = true);

    const nameless = this.authors.filter(author => !(author.name?.length > 0));
    this.authors = [...this.activeAuthors, ...this.removedAuthors, ...nameless];
    this.change.emit(this.authors);
  }

  private refocus(author: Author) {
    setTimeout(() => {
      const el = document.querySelector(`[data-id="${author.id}"]`) as HTMLElement;
      if (el) el.focus();
    }, 0);
  }
}
