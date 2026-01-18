import { AsyncLocalStorage } from 'node:async_hooks';
import { SUPER_ADMIN } from '../constants/enums.js';
import logger from '../utils/logger.js';

const context = new AsyncLocalStorage();

export const contextMiddleware = (req, res, next) => {
  const store = new Map();
  context.run(store, () => {
    next();
  });
};

export const setContext = (key, value) => {
  const store = context.getStore();
  if (store) {
    store.set(key, value);
  }
};

export const getContext = (key) => {
  const store = context.getStore();
  return store ? store.get(key) : undefined;
};

// Typed getters/setters for common fields
export const setUserId = (userId) => setContext('userId', userId);
export const getUserId = () => getContext('userId');

export const setUserRole = (role) => setContext('role', role);
export const getUserRole = () => getContext('role');

export const setInstituteId = (instituteId) => setContext('instituteId', instituteId);
export const getInstituteId = () => getContext('instituteId');

export const setUser = (user) => setContext('user', user);
export const getUser = () => getContext('user');

// Helper to enrich request context with user and institute details
export const setAuthContext = (req, user) => {
  req.user = user;
  
  // Set in AsyncLocalStorage
  setUserId(user._id);
  setUserRole(user.role);
  setUser(user);

  // Set instituteId in context for institute-level users
  if (user.role !== SUPER_ADMIN && user.instituteId) {
    req.instituteId = user.instituteId;
    setInstituteId(user.instituteId);
    logger.info(`contextStore.js >>>> setAuthContext() >>>> Institute Context Set: ${user.instituteId}`);
  }
};

export default context;
