import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import EmailSend from '@methods/email/send';
import CrudMessage from '@methods/messages/crud';
import PhoneSend from '@methods/phone/send';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    message: CrudMessage,
  };

  /**
   * CRUD methods
   */
  Object.entries(crud).forEach(([endpoint, crudMethods]) => {
    Object.entries(crudMethods).forEach(([method, handler]) => {
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
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
