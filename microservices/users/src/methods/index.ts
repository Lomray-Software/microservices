import MetaEndpoint from '@lomray/microservice-helpers/methods/meta';
import type { IEndpointHandler, Microservice } from '@lomray/microservice-nodejs-lib';
import CONST from '@constants/index';
import CrudConfirmCode from '@methods/confirm-code/crud';
import { send as ConfirmCodeSend } from '@methods/confirm-code/send';
import { attach as IdentityProviderAttach } from '@methods/identity-provider/attach';
import CrudIdentityProvider from '@methods/identity-provider/crud';
import { parse as IdentityProviderParse } from '@methods/identity-provider/parse';
import { signIn as IdentityProviderSignIn } from '@methods/identity-provider/sign-in';
import CrudProfile from '@methods/profile/crud';
import { changeLogin as UserChangeLogin } from '@methods/user/change-login';
import { changePassword as UserChangePassword } from '@methods/user/change-password';
import { checkUsername as UserCheckUsername } from '@methods/user/check-username';
import CrudUser from '@methods/user/crud';
import UserMe from '@methods/user/me';
import { signIn as UserSignIn } from '@methods/user/sign-in';
import { signOut as UserSignOut } from '@methods/user/sign-out';
import { signUp as UserSignUp } from '@methods/user/sign-up';

/**
 * Register methods
 */
export default (ms: Microservice): void => {
  const crud = {
    user: CrudUser,
    profile: CrudProfile,
    'identity-provider': CrudIdentityProvider,
    'confirm-code': CrudConfirmCode,
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
   * User methods
   */
  ms.addEndpoint('user.sign-up', UserSignUp);
  ms.addEndpoint('user.sign-in', UserSignIn);
  ms.addEndpoint('user.sign-out', UserSignOut);
  ms.addEndpoint('user.change-password', UserChangePassword);
  ms.addEndpoint('user.change-login', UserChangeLogin);
  ms.addEndpoint('user.check-username', UserCheckUsername);
  ms.addEndpoint('user.me', UserMe);

  /**
   * Confirm code methods
   */
  ms.addEndpoint('confirm-code.send', ConfirmCodeSend);

  /**
   * Identity providers methods
   */
  ms.addEndpoint('identity-provider.sign-in', IdentityProviderSignIn);
  ms.addEndpoint('identity-provider.attach', IdentityProviderAttach);
  ms.addEndpoint('identity-provider.parse', IdentityProviderParse);

  /**
   * Microservice metadata endpoint
   */
  ms.addEndpoint('meta', MetaEndpoint(CONST.VERSION), {
    isDisableMiddlewares: true,
    isPrivate: true,
  });
};
