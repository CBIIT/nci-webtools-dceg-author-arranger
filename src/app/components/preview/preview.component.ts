import { Component, Renderer2, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ArrangerService } from '../../services/arranger/arranger.service';
import { AppState } from '../../app.models';
import { isEmpty, isEqual } from 'lodash';

@Component({
  selector: 'author-arranger-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnChanges {

  @Input()
  state: Partial<AppState>

  @Input()
  loading: boolean = false;

  @ViewChild('preview')
  preview: ElementRef;

  @Output()
  reorder: EventEmitter<number[]> = new EventEmitter<number[]>();

  alerts: {type: string, message: string}[] = [];

  hasData = false;

  selectedTab = 'preview';


  constructor(
    private arranger: ArrangerService,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.state) {
      const { previousValue, currentValue } = changes.state;
      if (currentValue && previousValue && !isEqual(previousValue.markup, currentValue.markup) )
        this.update();
    }
  }

  downloadPreview() {
    if (this.preview && this.hasData) {
      this.arranger.downloadPreview(
        this.state.file.filename,
        this.preview.nativeElement as HTMLElement
      );
    }
  }

  update() {
    this.alerts = [];
    this.hasData = !isEmpty(this.state.file.data);
    if (!this.preview) return;
    // this.store.patchState({loading: true});
    let root = this.preview.nativeElement;
    // root.textContent = '';
    for (let child of root.children) {
      this.renderer.removeChild(root, child);
    }

    if (this.hasData && this.state.markup) {
      const asyncUpdate = this.state.file.data.length > 100;
      this.renderer.appendChild(
        root, this.arranger.createElement(this.state.markup, asyncUpdate)
      );
    }

    if (this.state.duplicateAuthors) {
      this.alerts = [{
        type: 'warning',
        message: 'Duplicate author names have been found.'
      }];
    }
  }
}