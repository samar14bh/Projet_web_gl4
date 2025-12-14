import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationsModal } from './registrations-modal';

describe('RegistrationsModal', () => {
  let component: RegistrationsModal;
  let fixture: ComponentFixture<RegistrationsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
