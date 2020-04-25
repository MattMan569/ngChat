import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages = [
    'start',
    '2',
    '3',
    '3gggggggggggggggggggggggggggggggggg gggggggggggggggggggggggggggggggggg3gggggggggggggggggggggggggggggggg gggggggggggggggggggggggggggggggggggg3ggggggggggggggggggggggggggg ggggggggggggggggggggggggggggggggggggggggg 3gggggggggggggggggggggggggggggggggg gggggggggggggggggggggggggggggggggg3gggggggggggggggggggggggggggggggg gggggggggggggggggggggggggggggggggggg3ggggggggggggggggggggggggggg ggggggggggggggggggggggggggggggggggggggggg',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    '3',
    'end',
  ];

  constructor(private chatService: ChatService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.chatService.connect(this.route.snapshot.params.id);
  }
}
