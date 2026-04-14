import axios from 'axios';

const api = axios.create({
  baseURL: 'https://trello-clone-rrls.onrender.com/api'
});

// Boards
export const getBoards = () => api.get('/boards').then(r => r.data);
export const getBoard = (id) => api.get(`/boards/${id}`).then(r => r.data);
export const createBoard = (data) => api.post('/boards', data).then(r => r.data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data).then(r => r.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`).then(r => r.data);

// Lists
export const createList = (data) => api.post('/lists', data).then(r => r.data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data).then(r => r.data);
export const deleteList = (id) => api.delete(`/lists/${id}`).then(r => r.data);
export const reorderLists = (orderedIds) => api.put('/lists/reorder', { orderedIds }).then(r => r.data);

// Cards
export const createCard = (data) => api.post('/cards', data).then(r => r.data);
export const getCard = (id) => api.get(`/cards/${id}`).then(r => r.data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data);
export const moveCard = (id, data) => api.post(`/cards/${id}/move`, data).then(r => r.data);
export const reorderCards = (orderedIds) => api.post('/cards/reorder', { orderedIds }).then(r => r.data);
export const searchCards = (params) => api.get('/cards/search', { params }).then(r => r.data);

// Card labels
export const addLabel = (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { label_id: labelId }).then(r => r.data);
export const removeLabel = (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`).then(r => r.data);

// Card members
export const addMember = (cardId, memberId) => api.post(`/cards/${cardId}/members`, { member_id: memberId }).then(r => r.data);
export const removeMember = (cardId, memberId) => api.delete(`/cards/${cardId}/members/${memberId}`).then(r => r.data);

// Checklists
export const createChecklist = (cardId, title) => api.post(`/cards/${cardId}/checklists`, { title }).then(r => r.data);
export const deleteChecklist = (cardId, clId) => api.delete(`/cards/${cardId}/checklists/${clId}`).then(r => r.data);
export const addChecklistItem = (cardId, clId, text) => api.post(`/cards/${cardId}/checklists/${clId}/items`, { text }).then(r => r.data);
export const updateChecklistItem = (cardId, clId, itemId, data) => api.put(`/cards/${cardId}/checklists/${clId}/items/${itemId}`, data).then(r => r.data);
export const deleteChecklistItem = (cardId, clId, itemId) => api.delete(`/cards/${cardId}/checklists/${clId}/items/${itemId}`).then(r => r.data);

// Comments
export const addComment = (cardId, data) => api.post(`/cards/${cardId}/comments`, data).then(r => r.data);
export const deleteComment = (cardId, commentId) => api.delete(`/cards/${cardId}/comments/${commentId}`).then(r => r.data);

// Members
export const getMembers = () => api.get('/members').then(r => r.data);
