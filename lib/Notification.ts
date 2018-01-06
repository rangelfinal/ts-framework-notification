import { NotificationOptions } from './Notification';
import { TransportTypes } from './types';
import { Firebase, FirebaseMessageSchema } from './firebase';
import { Email, EmailMessage, EmailMessageSchema } from './email';
import { BaseNotificationService, BaseNotificationServiceOptions } from "./base";
import { FirebaseServiceOptions, EmailServiceOptions } from 'index';

export interface NotificationOptions extends BaseNotificationServiceOptions {
  firebase?: FirebaseServiceOptions
  email?: EmailServiceOptions
}

export default class Notification extends BaseNotificationService {
  options: NotificationOptions
  transports: {
    email?: Email
    firebase?: Firebase
  }

  constructor(options: NotificationOptions) {
    super('NotificationService', options);
    this.transports = {};

    // At least one transport must be supplied to use this abstraction layer
    if (!this.options.email && !this.options.firebase) {
      throw new Error('No transports configured, you need to specifiy at least one debug service to use the Notification layer.');
    }

    // Initialize the email transport, if available
    if (this.options.email) {
      this.transports.email = new Email(this.options.email)
    }

    // Initialize the firebase transport, if available
    if (this.options.firebase) {
      this.transports.firebase = new Firebase(this.options.firebase);
    }
  }

  /**
   * Send a notification using the currently available and configured transporters.
   * 
   * @param message The notification to be sent, can be a Email message or a Firebase message.
   * @param options The options to be sent to the Transporter
   */
  public async send(message: EmailMessageSchema | FirebaseMessageSchema, options?: any) {
    if (message._type === TransportTypes.EMAIL && this.transports.email) {
      return this.transports.email.send(message as EmailMessageSchema);
    } else if (message._type === TransportTypes.FIREBASE && this.transports.firebase) {
      return this.transports.firebase.send(message as FirebaseMessageSchema, options);
    } else {
      throw new Error(`${this.name}: Transport not available or misconfigured: "${message._type}"`);
    }
  }

}