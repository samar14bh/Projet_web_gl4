import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreClubs } from './explore-clubs';

describe('ExploreClubs', () => {
  let component: ExploreClubs;
  let fixture: ComponentFixture<ExploreClubs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreClubs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreClubs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
