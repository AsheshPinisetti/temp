import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HangoutPageComponent } from './hangout-page.component';
import { HangoutService } from 'src/app/services/hangout.service';
import { of } from 'rxjs';
import { Hangout, HangoutWithUsers } from 'src/app/models/hangout.model';
import { Restaurant } from 'src/app/models/restaurant.model';
import { User } from 'src/app/models/user.model';

describe('HangoutPageComponent', () => {
  let component: HangoutPageComponent;
  let fixture: ComponentFixture<HangoutPageComponent>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let hangoutService: jasmine.SpyObj<HangoutService>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['params']);
    const hangoutServiceSpy = jasmine.createSpyObj('HangoutService', ['getHangout', 'castVote', 'deactivateHangout']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['user$']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showNotification']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [HangoutPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: HangoutService, useValue: hangoutServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    hangoutService = TestBed.inject(HangoutService) as jasmine.SpyObj<HangoutService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HangoutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set loading to true and fetch hangout details on init', fakeAsync(() => {
    const testHangout: HangoutWithUsers = {test1, 75025, test1};
    activatedRoute.params.and.returnValue(of({ id: 'testHangoutId' }));
    hangoutService.getHangout.and.returnValue(of(testHangout));

    component.ngOnInit();
    tick(); // simulate the passage of time for async operations

    expect(component.loading).toBeFalse();
    expect(component.hangout).toEqual(testHangout);
    expect(component.participantsNames).toBe(testHangout.participants.map((user: User) => user.displayName).join(', '));
  }));

  it('should subscribe to authService.user$ and update user on init', fakeAsync(() => {
    const testUser: User = {TestID1};
    authService.user$.and.returnValue(of(testUser));

    component.ngOnInit();
    tick(); // simulate the passage of time for async operations

    expect(component.user).toEqual(testUser);
  }));

  it('should check if the current user is the creator', () => {
    const testUser: User = {TestID1} ;
    const testHangout: HangoutWithUsers = {test1, 75025, test1};
    authService.user$.and.returnValue(of(testUser));
    hangoutService.getHangout.and.returnValue(of(testHangout));

    component.ngOnInit();

    expect(component.isCreator()).toBe(testUser.uid === testHangout.createdBy.uid);
  });

  it('should cast vote when vote is called', () => {
    const testUser: User = {TestID1};
    const testHangout: HangoutWithUsers = {test1, 75025, test1};
    const testRestaurant: Restaurant = { testkitchen, Frisco texas 75609, Chinese };
    authService.user$.and.returnValue(of(testUser));
    hangoutService.getHangout.and.returnValue(of(testHangout));

    component.ngOnInit();
    component.vote(testRestaurant);

    expect(hangoutService.castVote).toHaveBeenCalledWith(testUser.uid, testHangout.id, testRestaurant.id);
  });

  it('should navigate to home page after successfully deactivating hangout', fakeAsync(() => {
    const testHangout: HangoutWithUsers = {test1, 75025, test1} ;
    hangoutService.getHangout.and.returnValue(of(testHangout));
    hangoutService.deactivateHangout.and.returnValue(Promise.resolve(true));

    component.ngOnInit();
    component.endHangout();
    tick(); // simulate the passage of time for async operations

    expect(notificationService.showNotification).toHaveBeenCalledWith('success', 'Hangout has been deactivated.');
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  }));

  it('should show error notification if deactivating hangout fails', fakeAsync(() => {
    const testHangout: HangoutWithUsers = {test1, 75025, test1} ;
    hangoutService.getHangout.and.returnValue(of(testHangout));
    hangoutService.deactivateHangout.and.returnValue(Promise.resolve(false));

    component.ngOnInit();
    component.endHangout();
    tick(); // simulate the passage of time for async operations

    expect(notificationService.showNotification).toHaveBeenCalledWith('error', 'Failed to deactivate hangout.');
  }));
});

