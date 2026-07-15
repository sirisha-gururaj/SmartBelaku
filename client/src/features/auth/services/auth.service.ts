export const getUser = () => {
  const user = localStorage.getItem("user");

  if (!user) return null;

  return JSON.parse(user);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};