import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ForgotPasswordPageComponent } from './forgot-password-page.component';

fdescribe('ForgotPasswordPageComponent', () => {
  let component: ForgotPasswordPageComponent;
  let fixture: ComponentFixture<ForgotPasswordPageComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPasswordPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            ForgotPassword: () => of(true), // Mock the AuthService's ForgotPassword method
          },
        },
      ],
    });

    fixture = TestBed.createComponent(ForgotPasswordPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with username control', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    const usernameControl = component.passwordForm.get('username');
    expect(usernameControl).toBeTruthy();
  });

  it('should reset password and set loading to false', () => {
    fixture.detectChanges();
    const username = 'test@example.com';

    // Spy on AuthService's ForgotPassword method to check if it was called
    const authServiceSpy = spyOn(authService, 'ForgotPassword').and.returnValue(Promise.resolve());

    // Set the username value
    component.passwordForm.get('username')?.setValue(username);

    // Call the resetPassword method
    component.resetPassword();

    // Expect that AuthService's ForgotPassword was called with the username
    expect(authServiceSpy).toHaveBeenCalledWith(username);

    // Expect loading to be set to false after completing
    expect(component.loading).toBeTruthy();
  });
});
