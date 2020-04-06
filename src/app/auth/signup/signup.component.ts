import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  isLoading = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.minLength(5),
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

  onSignup() {
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
  }
}
