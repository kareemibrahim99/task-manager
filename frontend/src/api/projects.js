import client from "./client";

export const listProjects = async () => {
  const { data } = await client.get("/projects");
  return data.projects;
};

export const getProject = async (projectId) => {
  const { data } = await client.get(`/projects/${projectId}`);
  return data.project;
};

export const createProject = async ({ name, description }) => {
  const { data } = await client.post("/projects", { name, description });
  return data.project;
};

export const updateProject = async (projectId, { name, description }) => {
  const { data } = await client.patch(`/projects/${projectId}`, { name, description });
  return data.project;
};

export const deleteProject = async (projectId) => {
  await client.delete(`/projects/${projectId}`);
};

export const addMember = async (projectId, { email }) => {
  const { data } = await client.post(`/projects/${projectId}/members`, { email });
  return data.project;
};

export const removeMember = async (projectId, userId) => {
  const { data } = await client.delete(`/projects/${projectId}/members/${userId}`);
  return data.project;
};
