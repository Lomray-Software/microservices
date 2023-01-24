import Hook from 'require-in-the-middle';
import CONST from '@constants/index';
// import User from '@entities/user';

/**
 * Get module path from original package
 */
const getPath = (name: string) => `${CONST.EXTEND_PACKAGE_NAME}/${name}`;

/**
 * Replace original require modules with self implemented
 */

// Hook([getPath('entities/user')], (exports, name, basedir) => {
//   console.info('patch %s from %s', name, basedir);
//
//   return User;
// });
