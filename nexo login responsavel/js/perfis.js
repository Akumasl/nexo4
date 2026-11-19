const conta = nexoRequireLogin();
if (!conta) throw new Error("Login necessário.");

const profilesGrid = document.getElementById("profilesGrid");
const emptyState = document.getElementById("emptyState");
const addProfileButton = document.getElementById("addProfileButton");
const firstProfileButton = document.getElementById("firstProfileButton");
const modal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const logoutButton = document.getElementById("logoutButton");

let selectedAvatar = "avatar1";

const avatarMap = {
    avatar1: "👩", avatar2: "👨", avatar3: "👩🏻",
    avatar4: "👨🏻", avatar5: "🧑"
};

function atualizarConta(perfis) {
    const users = nexoGetUsers();
    const index = users.findIndex(user => user.id === conta.id);
    if (index < 0) {
        nexoLogout();
        return;
    }
    users[index].perfis = perfis;
    nexoSaveUsers(users);
    conta.perfis = perfis;
}

function carregarPerfis() {
    const perfis = (conta.perfis || []).filter(p => p.tipo === (conta.tipo || "responsavel"));
    profilesGrid.innerHTML = "";

    if (perfis.length === 0) {
        emptyState.classList.remove("hidden");
        addProfileButton.classList.toggle("hidden", conta.tipo === "adolescente");
        firstProfileButton.style.display = conta.tipo === "adolescente" ? "none" : "";
        return;
    }

    emptyState.classList.add("hidden");

    perfis.forEach(perfil => {
        const card = document.createElement("article");
        card.className = "profile-card";

        const mainButton = document.createElement("button");
        mainButton.className = "profile-main";
        mainButton.type = "button";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = avatarMap[perfil.avatar] || "🧑";

        const name = document.createElement("strong");
        name.textContent = perfil.nome;

        const caption = document.createElement("span");
        caption.textContent = perfil.tipo === "adolescente" ? `Adolescente · ${perfil.codigo||""}` : "Responsável";

        mainButton.append(avatar, name, caption);
        mainButton.addEventListener("click", () => {
            sessionStorage.setItem("perfilSelecionado", JSON.stringify(perfil));
            window.location.href = perfil.tipo === "adolescente" ? "adolescente.html" : "responsavel.html";
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-profile";
        deleteButton.type = "button";
        deleteButton.title = "Excluir perfil";
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => {
            if (!confirm(`Excluir o perfil "${perfil.nome}"?`)) return;
            atualizarConta(conta.perfis.filter(item => item.id !== perfil.id));
            carregarPerfis();
        });

        if(perfil.tipo === "adolescente") deleteButton.remove();
        card.append(mainButton);
        if(perfil.tipo !== "adolescente") card.append(deleteButton);
        profilesGrid.appendChild(card);
    });

    addProfileButton.classList.toggle("hidden", conta.tipo === "adolescente" || perfis.length >= 6);
}

function abrirModal() {
    if (conta.tipo === "adolescente") return;
    modal.classList.remove("hidden");
    profileName.focus();
}

function fecharModal() {
    modal.classList.add("hidden");
    profileName.value = "";
}

document.querySelectorAll(".avatar-option").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".avatar-option").forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        selectedAvatar = button.dataset.avatar;
    });
});

addProfileButton.addEventListener("click", abrirModal);
firstProfileButton.addEventListener("click", abrirModal);
closeModal.addEventListener("click", fecharModal);

modal.addEventListener("click", event => {
    if (event.target === modal) fecharModal();
});

profileForm.addEventListener("submit", event => {
    event.preventDefault();
    const nome = profileName.value.trim();

    if (!nome) {
        alert("Digite o nome do perfil.");
        return;
    }
    if (nome.length > 30) {
        alert("O nome deve ter no máximo 30 caracteres.");
        return;
    }
    if ((conta.perfis || []).filter(p=>p.tipo!=="adolescente").length >= 6) {
        alert("Essa conta já possui o limite de 6 perfis.");
        return;
    }

    const novoPerfil = {
        id: nexoCreateId(),
        nome,
        avatar: selectedAvatar,
        tipo: 'responsavel',
        criadoEm: new Date().toISOString()
    };

    atualizarConta([...(conta.perfis || []), novoPerfil]);
    fecharModal();
    carregarPerfis();
});

logoutButton.addEventListener("click", nexoLogout);

carregarPerfis();
