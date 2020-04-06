import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isLoading = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(
        null, {
        validators: [
          Validators.required,
        ],
      }),
      password: new FormControl(
        null, {
        validators: [
          Validators.required,
        ],
      }),
    });
  }

  onLogin() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
  }
}
