import {
  ViewOutputParams,
  ViewRequestParams,
} from '@lomray/microservice-helpers/services/endpoint';
import { Microservice, MicroserviceResponse } from '@lomray/microservice-nodejs-lib';
import type { IAttachment } from '@interfaces/microservices/attachments/entities/attachment';

interface INotificationSendEmail {
  from?: string; // it can be default value
  to: string[];
  subject: string;
  text: string;
  html: string;
}

interface INotificationSendPhone {
  to: string[];
  message: string;
}

/**
 * Service for make requests to another microservices
 * This service can generate automatically (in future)
 */
class Api {
  /**
   * Notification
   */
  static notification = {
    email: {
      send: (params: INotificationSendEmail): Promise<MicroserviceResponse> =>
        Microservice.getInstance().sendRequest('notification.email.send', params),
    },

    phone: {
      send: (params: INotificationSendPhone): Promise<MicroserviceResponse> =>
        Microservice.getInstance().sendRequest('notification.phone.send', params),
    },
  };

  /**
   * Attachments
   */
  static attachments = {
    attachment: {
      view: (
        params: ViewRequestParams<IAttachment>,
      ): Promise<MicroserviceResponse<ViewOutputParams<IAttachment>>> =>
        Microservice.getInstance().sendRequest('attachments.attachment.view', params),
    },
  };
}

export default Api;
