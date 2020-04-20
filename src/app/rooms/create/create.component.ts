import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoomService } from '../room.service';
import { ActivatedRoute } from '@angular/router';
import IRoom from 'types/room';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  room: IRoom;
  isLocked = false;
  isLimited = false;
  isLoading = false;
  private mode: 'create' | 'edit';
  private id: string;

  constructor(private roomService: RoomService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Setup the reactive form
    this.form = new FormGroup({
      name: new FormControl(
        null, {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(64),
        ],
      }),
      description: new FormControl(
        null, {
        validators: [
          Validators.maxLength(1000),
        ],
      }),
      isLocked: new FormControl(false),
      password: new FormControl(),
      isLimited: new FormControl(false),
      capacity: new FormControl(),
      tags: new FormControl(),
    });

    // Set the form's current mode
    this.route.paramMap.subscribe((paramMap) => {
      // If the id parameter is present then the room is being edited
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.id = paramMap.get('id');
        this.isLoading = true;

        // Get the room with the specified id
        this.roomService.getRoom(this.id).subscribe((room) => {
          this.isLoading = false;
          this.room = room;
          this.isLocked = this.room.isLocked;
          this.isLimited = this.room.isLimited;

          // Populate the form with the retrieved room's values
          this.form.setValue({
            name: this.room.name,
            description: this.room.description,
            isLocked: this.room.isLocked,
            password: this.room.isLocked ? this.room.password : null,
            isLimited: this.room.isLimited,
            capacity: this.room.isLimited ? this.room.capacity : null,
            tags: this.room.tags.join(' '), // TODO verify
          });

          // Lock the unused controls
          if (!this.isLocked) { this.form.controls.password.disable(); }
          if (!this.isLimited) { this.form.controls.capacity.disable(); }
        });
      } else {
        this.mode = 'create';
        this.form.controls.password.disable();
        this.form.controls.capacity.disable();
      }
    });
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

  getButtonText() {
    return this.mode === 'create' ? 'Create' : 'Update';
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
      // Split tags on spaces, ignore multiple spaces via filter
      this.form.value.tags = (this.form.value.tags as string).split(' ').filter(i => i);
    } else {
      this.form.value.tags = [];
    }

    this.isLoading = true;

    if (this.mode === 'create') {
      this.roomService.createRoom(this.form.value);
    } else {
      this.roomService.updateRoom({_id: this.room._id, ...this.form.value});
    }
  }
}
