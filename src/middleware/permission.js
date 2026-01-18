import { SUPER_ADMIN, INSTITUTE_ADMIN, TEACHER, STUDENT, PARENT, STAFF } from '../constants/enums.js';

const ROLES = {
  [SUPER_ADMIN]: [
    'CREATE_NEW_INSTITUTES',
    'GET_ALL_INSTITUTES',
    'GET_INSTITUTE_BY_ID',
    'UPDATE_INSTITUTE',
    'DELETE_INSTITUTE',
    'CREATE_INSTITUTE_ADMIN',
    'GET_ALL_USERS',
    'UPDATE_USER_STATUS',
    'GET_INSTITUTE_BY_ID',
  ],
  [INSTITUTE_ADMIN]: [
    'GET_MY_INSTITUTE',
    'UPDATE_MY_INSTITUTE',
    'CREATE_USER',
    'GET_INSTITUTE_USERS',
    'UPDATE_USER',
    'DELETE_USER',
    'CREATE_CLASS',
    'GET_CLASSES',
    'UPDATE_CLASS',
    'DELETE_CLASS',
  ],
  [TEACHER]: [
    'GET_MY_PROFILE',
    'GET_MY_STUDENTS', 
    'GET_CLASSES',
  ],
  [STUDENT]: [
    'GET_MY_PROFILE',
    'GET_CLASSES',
  ],
};

export function hasPermission(userRole, permission) {
  return ROLES[userRole]?.includes(permission) || false;
}

export { ROLES };
