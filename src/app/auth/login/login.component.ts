import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  private authSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authSub = this.authService.getAuthStatus().subscribe(() => {
      this.isLoading = false;
    });

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

    this.authService.login(
      this.form.value.username,
      this.form.value.password,
    );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
