import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SignupPageComponent } from './signup-page.component';

fdescribe('SignupPageComponent', () => {
  let component: SignupPageComponent;
  let fixture: ComponentFixture<SignupPageComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignupPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            SignUp: () => of(true), // Mock the AuthService's SignUp method
          },
        },
      ],
    });

    fixture = TestBed.createComponent(SignupPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the registerForm with the necessary controls', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    const usernameControl = component.registerForm.get('username');
    const passwordControl = component.registerForm.get('password');

    expect(usernameControl).toBeTruthy();
    expect(passwordControl).toBeTruthy();
  });

  it('should call the AuthService SignUp method and set loading to false', () => {
    fixture.detectChanges();
    const username = 'test@example.com';
    const password = 'password123';

    // Spy on AuthService's SignUp method to check if it was called
    const signUpSpy = spyOn(authService, 'SignUp').and.returnValue(Promise.resolve());

    // Set the username and password values
    component.registerForm.get('username')?.setValue(username);
    component.registerForm.get('password')?.setValue(password);

    // Call the register method
    component.register();

    // Expect that AuthService's SignUp was called with the username and password
    expect(signUpSpy).toHaveBeenCalledWith(username, password);

    // Expect loading to be set to false after completing the request
    expect(component.loading).toBeTruthy();
  });
});
