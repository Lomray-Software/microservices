import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice, IEndpointHandler } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import EmailSend from '@methods/email/send';
import FcmTokenCrud from '@methods/fcm-token/crud';
import FcmTokenSave from '@methods/fcm-token/save';
import CrudMessage from '@methods/messages/crud';
import CrudNotice from '@methods/notice/crud';
import { hideAll as NoticeHideAll } from '@methods/notice/hide-all';
import { viewAll as NoticeViewAll } from '@methods/notice/view-all';
import PhoneSend from '@methods/phone/send';
import PushSend from '@methods/push/send';
import CrudTask from '@methods/task/crud';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    message: CrudMessage,
    notice: {
      ...CrudNotice,
      'hide-all': NoticeHideAll,
      'view-all': NoticeViewAll,
    },
    task: CrudTask,
    'fcm-token': {
      ...FcmTokenCrud,
      save: FcmTokenSave,
    },
  };

  /**
   * CRUD methods
   */
  Object.entries(crud).forEach(([endpoint, crudMethods]) => {
    Object.entries<IEndpointHandler>(crudMethods).forEach(([method, handler]) => {
      ms.addEndpoint(`${endpoint}.${method}`, handler);
    });
  });

  /**
   * Email methods
   */
  ms.addEndpoint('email.send', EmailSend);

  /**
   * Phone methods
   */
  ms.addEndpoint('phone.send', PhoneSend);

  /**
   * Push methods
   */
  ms.addEndpoint('push.send', PushSend);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
