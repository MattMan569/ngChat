import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  errorMessage: string;
  spinnerDiameter: number;
  @ViewChild('spinnerDiv') spinnerDiv: ElementRef;
  private authSub: Subscription;

  constructor(private authService: AuthService, private cdRef: ChangeDetectorRef) { }

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

  ngAfterViewInit() {
    this.spinnerDiameter = (this.spinnerDiv.nativeElement as HTMLDivElement).offsetHeight;
    this.cdRef.detectChanges();
  }

  async onLogin() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = await this.authService.login(
      this.form.value.username,
      this.form.value.password,
    );

    this.isLoading = false;
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
