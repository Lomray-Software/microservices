import { Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';

interface INotificationSendEmail {
  from?: string; // it can be default value
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

interface INotificationSendPhone {
  to: string | string[];
  message: string;
}

/**
 * Service for make requests to another microservices
 * This service can generate automatically (in future)
 */
class Api {
  static notification = {
    emailSend: (params: INotificationSendEmail): Promise<MicroserviceResponse> =>
      Microservice.getInstance().sendRequest('notification.email.send', params),

    phoneSend: (params: INotificationSendPhone): Promise<MicroserviceResponse> =>
      Microservice.getInstance().sendRequest('notification.phone.send', params),
  };
}

export default Api;
