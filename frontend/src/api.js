const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiRequest(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch (cause) {
    if (cause instanceof TypeError) {
      throw new Error('Cannot reach the Fitness Planner API. Start the Spring Boot backend and check its startup logs.');
    }
    throw cause;
  }

  if (response.status === 204) return null;
  const responseText = await response.text();
  let body = null;
  let isHtml = false;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      isHtml = /^\s*<!doctype html|^\s*<html/i.test(responseText);
    }
  }

  if (!response.ok) {
    if (response.status >= 500 && (!responseText || isHtml)) {
      throw new Error('The Fitness Planner backend is not responding correctly. Start Spring Boot and check its logs, MySQL connection, DB_PASSWORD, and JWT_SECRET.');
    }
    if (isHtml) {
      throw new Error('The API returned an HTML error page instead of JSON. Check that the Spring Boot backend is running and review its logs.');
    }
    const message =
      body?.message ||
      body?.error ||
      body?.detail ||
      `The API returned HTTP ${response.status}. Check the backend logs for details.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

export function signIn(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function signUp(details) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}

export function getProfile(token) {
  return apiRequest('/api/profile/biometrics', { token });
}

export function saveProfile(token, profile) {
  return apiRequest('/api/profile/biometrics', {
    method: 'POST',
    token,
    body: JSON.stringify(profile),
  });
}

export function getCurrentPlan(token) {
  return apiRequest('/api/plans/current', { token });
}

export function generatePlan(token, request) {
  return apiRequest('/api/plans/generate', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function getWeightHistory(token) {
  return apiRequest('/api/weight-logs/history', { token });
}
