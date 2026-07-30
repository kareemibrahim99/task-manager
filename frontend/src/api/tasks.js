import client from "./client";

export const listTasks = async (projectId, filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  if (filters.assignee) params.assignee = filters.assignee;

  const { data } = await client.get(`/projects/${projectId}/tasks`, { params });
  return data.tasks;
};

export const createTask = async (projectId, task) => {
  const { data } = await client.post(`/projects/${projectId}/tasks`, task);
  return data.task;
};

export const updateTask = async (projectId, taskId, updates) => {
  const { data } = await client.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
  return data.task;
};

export const deleteTask = async (projectId, taskId) => {
  await client.delete(`/projects/${projectId}/tasks/${taskId}`);
};
