import { Component, OnInit } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subscription, Observable } from 'rxjs';
import {RxStompState} from '@stomp/rx-stomp';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  template: `
<div id="status">
  <div id="indicator" class="{{connectionStatus$|async}}"></div>
  <span id="status-label">{{connectionStatus$|async}}</span>
  <button class="btn" (click)="rxStompService.activate()">Activate</button>
  <button class="btn" (click)="rxStompService.deactivate()">DeActivate</button>
  <button class="btn" (click)="rxStompService.stompClient.forceDisconnect()">Simulate Error</button>
</div>
<div id="messages">
    <button class="btn btn-primary" (click)="onSendMessage()">Send Test Message</button>
    <h2>Received messages</h2>
    <ol>
        <!-- we will use Angular binding to populate list of messages -->
        <li class="message" *ngFor="let message of receivedMessages">{{message}}</li>
    </ol>
</div>
  `,
  styles: []
})
export class MessagesComponent implements OnInit {

  constructor(public rxStompService: RxStompService) { 
    this.connectionStatus$ = rxStompService.connectionState$.pipe(map((state) => {
      // convert numeric RxStompState to string
      return RxStompState[state];
    }));
  }
  public connectionStatus$: Observable<string>;
  public receivedMessages: string[] = [];
  private topicSubscription: Subscription;

  ngOnInit() {
    this.topicSubscription = this.rxStompService.watch('/topic/demo').subscribe((message: Message) => {
      this.receivedMessages.push(message.body);
    });
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
  }
  
  onSendMessage() {
    const message = `Message generated at ${new Date}`;
    this.rxStompService.publish({destination: '/topic/demo', body: message});
  }
}
