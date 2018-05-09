import { TestBed, inject } from '@angular/core/testing';

import { ArrangerService } from './arranger.service';

describe('ArrangerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArrangerService]
    });
  });

  it('should be created', inject([ArrangerService], (service: ArrangerService) => {
    expect(service).toBeTruthy();
  }));
});
