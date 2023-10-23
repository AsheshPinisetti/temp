import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { HomePageComponent } from './home-page.component';
import { HangoutService } from 'src/app/services/hangout.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Hangout } from 'src/app/models/hangout.model';

fdescribe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let authService: AuthService;
  let hangoutService: HangoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: AngularFireAuth,
          useValue: {
            authState: of({ uid: 'user-uid' }), // Mock AngularFireAuth's authState
          },
        },
        {
          provide: AuthService,
          useValue: {
            user$: of({ uid: 'user-uid' }), // Mock AuthService's user$
            userData: { uid: 'user-uid' }, // Mock AuthService's userData
          },
        },
        {
          provide: HangoutService,
          useValue: {
            getActiveHangoutsForUser: (uid: string) => of([]), // Mock HangoutService's getActiveHangoutsForUser
            getPastHangoutsForUser: (uid: string) => of([]), // Mock HangoutService's getPastHangoutsForUser
            createHangout: (hangout: Hangout) => of(hangout), // Mock HangoutService's createHangout
          },
        },
      ],
    });

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    hangoutService = TestBed.inject(HangoutService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the hangoutForm with the necessary controls', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    const nameControl = component.hangoutForm.get('name');
    const locationControl = component.hangoutForm.get('location');
    const descriptionControl = component.hangoutForm.get('description');

    expect(nameControl).toBeTruthy();
    expect(locationControl).toBeTruthy();
    expect(descriptionControl).toBeTruthy();
  });

  it('should create a new hangout', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    component.hangoutForm.setValue({
      name: 'Test Hangout',
      location: 'Test Location',
      description: 'Test Description',
    });

    const createHangoutSpy = spyOn(hangoutService, 'createHangout').and.returnValue(Promise.resolve());

    component.createNewHangout();

    expect(createHangoutSpy).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });
});
