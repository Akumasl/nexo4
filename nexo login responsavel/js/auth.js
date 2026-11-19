// Autenticação local do NEXO: usa LocalStorage, sem Node.js e sem banco de dados.
// Os dados ficam neste navegador/dispositivo. Não use este modelo para produção.

const NEXO_USERS_KEY = "nexo_usuarios";
const NEXO_SESSION_KEY = "nexo_conta_atual";

function nexoGetUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(NEXO_USERS_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

function nexoSaveUsers(users) {
    localStorage.setItem(NEXO_USERS_KEY, JSON.stringify(users));
}

function nexoCreateId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nexoBytesToBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function nexoHashPassword(password, saltBase64) {
    if (!window.crypto || !crypto.subtle) {
        throw new Error("Abra o projeto pelo Live Server (localhost) para ativar a proteção de senha.");
    }

    const salt = saltBase64
        ? Uint8Array.from(atob(saltBase64), char => char.charCodeAt(0))
        : crypto.getRandomValues(new Uint8Array(16));

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const hash = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
        key,
        256
    );

    return {
        salt: nexoBytesToBase64(salt),
        hash: nexoBytesToBase64(hash)
    };
}

function nexoGetCurrentUser() {
    const id = sessionStorage.getItem(NEXO_SESSION_KEY);
    if (!id) return null;
    return nexoGetUsers().find(user => user.id === id) || null;
}

function nexoRequireLogin() {
    const user = nexoGetCurrentUser();
    if (!user) {
        window.location.href = "index.html";
        return null;
    }
    return user;
}

function nexoLogout() {
    sessionStorage.removeItem(NEXO_SESSION_KEY);
    sessionStorage.removeItem("perfilSelecionado");
    window.location.href = "index.html";
}
