import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebToolComponent } from './web-tool.component';

describe('WebToolComponent', () => {
  let component: WebToolComponent;
  let fixture: ComponentFixture<WebToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
