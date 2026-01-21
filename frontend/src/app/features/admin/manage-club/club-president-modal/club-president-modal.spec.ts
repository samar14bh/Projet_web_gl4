import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubPresidentModal } from './club-president-modal';

describe('ClubPresidentModal', () => {
  let component: ClubPresidentModal;
  let fixture: ComponentFixture<ClubPresidentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubPresidentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClubPresidentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
