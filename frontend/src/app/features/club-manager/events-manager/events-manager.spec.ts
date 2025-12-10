import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsManager } from './events-manager';

describe('EventsManager', () => {
  let component: EventsManager;
  let fixture: ComponentFixture<EventsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
