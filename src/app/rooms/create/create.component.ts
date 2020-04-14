import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomService } from '../room.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  isLocked = false;
  isLimited = false;
  isLoading = false;

  constructor(private roomService: RoomService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(64),
        ],
      },
      ),
      isLocked: new FormControl(false),
      password: new FormControl(),
      isLimited: new FormControl(false),
      capacity: new FormControl(),
      tags: new FormControl(),
    });

    this.form.controls.password.disable();
    this.form.controls.capacity.disable();
  }

  // Toggle the disable on the password field
  onLockChange() {
    if (!this.form.controls.isLocked.value) {
      // TODO if disabled, clear before submit
      // this.form.controls.password.reset();
      this.form.controls.password.disable();
      this.isLocked = false;
    } else {
      this.form.controls.password.enable();
      this.isLocked = true;
    }
  }

  onPasswordChange() {
    if (!this.form.controls.password.value) {
      this.form.controls.password.setErrors({ missingPassword: true });
    } else {
      this.form.controls.password.setErrors(null);
    }
  }

  // Toggle the disable on the capacity field
  onLimitedChange() {
    if (!this.form.controls.isLimited.value) {
      // TODO if disabled, clear before submit
      this.form.controls.capacity.disable();
      this.isLimited = false;
    } else {
      this.form.controls.capacity.enable();
      this.isLimited = true;
    }
  }

  onCreateRoom() {
    // If the room is locked there must be a password
    if (this.form.controls.isLocked.value) {
      if (!this.form.controls.password.value) {
        this.form.controls.password.setErrors({ missingPassword: true });
      }
    }

    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    if (this.form.value.tags) {
      // Split tags on spaces, ignore multiple spaces
      this.form.value.tags = (this.form.value.tags as string).split(' ').filter(i => i);
    } else {
      this.form.value.tags = [];
    }

    this.roomService.createRoom(this.form.value);
  }
}
