import { AfterViewInit, Directive, ElementRef, Input, OnChanges } from '@angular/core';

/**
 * Sets the DOM `disabled` property directly, after view init and on every
 * input change. Needed for inputs that also carry a reactive [formControl]:
 * the forms directive initializes after attribute bindings and resets the
 * element's disabled property from the (enabled) control state, so a plain
 * [attr.disabled] binding is lost on first render. The control itself must
 * stay enabled so its value remains part of formGroup.value for the worker.
 */
@Directive({
  selector: '[appDomDisabled]',
  standalone: false,
})
export class DomDisabledDirective implements AfterViewInit, OnChanges {
  @Input('appDomDisabled') appDomDisabled = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngAfterViewInit() {
    this.apply();
  }

  ngOnChanges() {
    this.apply();
  }

  private apply() {
    this.el.nativeElement.disabled = !!this.appDomDisabled;
  }
}
