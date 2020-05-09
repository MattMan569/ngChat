import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss'],
})
export class PasswordComponent {
  @ViewChild('passwordInput') input: ElementRef;
  public errorMessage: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private roomId: string,
    private roomService: RoomService,
    private dialogRef: MatDialogRef<PasswordComponent>,
  ) { }

  onJoin() {
    const password = (this.input.nativeElement as HTMLInputElement).value;

    this.roomService.joinRoom(this.roomId, password).subscribe(() => {
      this.dialogRef.close(true);
    }, (error: HttpErrorResponse) => {
      this.errorMessage = error.error;
    });
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onJoin();
    }
  }
}
