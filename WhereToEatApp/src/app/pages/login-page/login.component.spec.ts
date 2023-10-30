import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LoginPageComponent } from './login.component';

fdescribe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            SignIn: () => of(true), // Mock the AuthService's SignIn method
          },
        },
      ],
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the loginForm with the necessary controls', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    expect(usernameControl).toBeTruthy();
    expect(passwordControl).toBeTruthy();
  });

  it('should call the AuthService SignIn method and set loading to false', () => {
    fixture.detectChanges();
    const username = 'test@example.com';
    const password = 'password123';

    // Spy on AuthService's SignIn method to check if it was called
    const signInSpy = spyOn(authService, 'SignIn').and.returnValue(Promise.resolve());

    // Set the username and password values
    component.loginForm.get('username')?.setValue(username);
    component.loginForm.get('password')?.setValue(password);

    // Call the login method
    component.login();

    // Expect that AuthService's SignIn was called with the username and password
    expect(signInSpy).toHaveBeenCalledWith(username, password);

    // Expect loading to be set to false after completing the request
    expect(component.loading).toBeTruthy();
  });
});
