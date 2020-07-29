import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  isLoading = false;
  errorMessage: string;
  spinnerDiameter: number;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;

  constructor(private authService: AuthService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(32),
        ],
      }),
      email: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.email,
        ],
      }),
      password: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.minLength(8),
        ],
      }),
      confirmPassword: new FormControl(
        null, {
        validators: [
          Validators.required,
        ],
      }),
    });
  }

  ngAfterViewInit() {
    this.spinnerDiameter = (this.spinnerDiv.nativeElement as HTMLDivElement).offsetHeight;
    this.cdRef.detectChanges();
  }

  async onSignup() {
    const password = this.form.controls.password;
    const confirmPassword = this.form.controls.confirmPassword;

    // Set the confirm password field as invalid if the passwords do not match.
    // Clear the error if they match other validators pass as well.
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({
        passwordsMatch: true,
      });
    } else if (!confirmPassword.errors?.required) {
      confirmPassword.setErrors(null);
    }

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = await this.authService.signup(
      this.form.value.username,
      this.form.value.email,
      this.form.value.password,
    );

    this.isLoading = false;
  }
}
