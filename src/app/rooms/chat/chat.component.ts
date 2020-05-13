import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import IUser from 'types/user';
import IMessage from 'types/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  messages: IMessage[] = [];
  users: Array<{ socketId: string; user: IUser; }>;
  private messagesSub: Subscription;
  private usersSub: Subscription;
  @ViewChild('messageViewport') messageViewport: CdkVirtualScrollViewport;
  @ViewChild('messageInput') messageInput: ElementRef;

  constructor(private chatService: ChatService, private route: ActivatedRoute, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    const obs = this.chatService.connect(this.route.snapshot.params.id);

    this.messagesSub = obs.messagesOb.subscribe((messages) => {
      this.messages = messages;

      // Wait for the viewport to finish updating before scrolling.
      // Required, or else the native scrollHeight will not update
      // before attempting to scroll to the bottom, resulting
      // in it stopping at the second last item.
      this.cdRef.detectChanges();
      this.messageViewport.scrollTo({ bottom: 0, behavior: 'smooth' });
    });

    this.usersSub = obs.usersOb.subscribe((users) => {
      this.users = users;
      this.cdRef.detectChanges();
    });

    this.form = new FormGroup({
      message: new FormControl(
        null, {
        validators: [
          Validators.maxLength(1000),
        ],
      },
      ),
    });
  }

  ngAfterViewInit() {
    (this.messageInput.nativeElement as HTMLInputElement).focus();

    // Prevent ExpressionChangedAfterItHasBeenCheckedError
    this.cdRef.detectChanges();
  }

  onSendMessage() {
    const message = this.form.value.message;

    if (!message) {
      return;
    }

    this.chatService.sendMessage(message);
    this.form.reset();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
    this.messagesSub.unsubscribe();
  }
}
