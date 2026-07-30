import client from "./client";

export const register = async ({ name, email, password }) => {
  const { data } = await client.post("/auth/register", { name, email, password });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
};

export const fetchProfile = async () => {
  const { data } = await client.get("/auth/profile");
  return data;
};
