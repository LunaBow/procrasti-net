const API_BASE = import.meta.env.PUBLIC_API_URL;
// should be: https://mt231043-10992.node.ustp.cloud/api

export async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error || "Login failed");
    }

    localStorage.setItem("jwt", data.token);

    return data.user; // optional
}

export function logout() {
    localStorage.removeItem("jwt");
}

export function getToken() {
    return localStorage.getItem("jwt");
}