const KEY = 'trello_auth';

export const getAuth = () => JSON.parse(localStorage.getItem(KEY) || 'null');
export const setAuth = (user) => localStorage.setItem(KEY, JSON.stringify(user));
export const clearAuth = () => localStorage.removeItem(KEY);
export const isAuthenticated = () => !!getAuth();

export const DEMO = { email: 'demo@trello.com', password: '123456', name: 'Demo User' };
