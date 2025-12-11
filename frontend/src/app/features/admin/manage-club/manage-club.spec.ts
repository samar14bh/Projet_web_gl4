import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClub } from './manage-club';

describe('ManageClub', () => {
  let component: ManageClub;
  let fixture: ComponentFixture<ManageClub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageClub);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
