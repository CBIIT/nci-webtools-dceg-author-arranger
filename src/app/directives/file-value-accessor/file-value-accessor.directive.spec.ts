import { ElementRef } from '@angular/core';
import { FileValueAccessorDirective } from './file-value-accessor.directive';

describe('FileValueAccessorDirective', () => {
  it('should create an instance', () => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    const hostElement = new ElementRef(inputElement);
    const directive = new FileValueAccessorDirective(hostElement);
    expect(directive).toBeTruthy();
  });
});
