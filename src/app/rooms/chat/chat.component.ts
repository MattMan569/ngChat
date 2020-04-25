import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  form: FormGroup;

  messages = Array.from(new Array(100), (v, i) => `Message ${i}\nHi\nHello`);
  users = Array.from(new Array(100), (v, i) => `User ${i}`);

  constructor(private chatService: ChatService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.chatService.connect(this.route.snapshot.params.id);

    this.form = new FormGroup({
      message: new FormControl(
        null, {
          validators: [
            Validators.required,
            Validators.maxLength(1000),
          ],
        },
      ),
    });
  }

  onSendMessage() {

  }
}
