import { http } from "./http";

export async function loginRequest({ email, password }) {
  const { data } = await http.post("/api/auth/login", { email, password });
  return data.data;
}

export async function registerRequest({ name, email, password }) {
  const { data } = await http.post("/api/auth/register", { name, email, password });
  return data.data;
}

export async function getMeRequest() {
  const { data } = await http.get("/api/auth/me");
  return data.data;
}
