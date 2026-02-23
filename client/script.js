const confessionList = document.getElementById("confessionList");
const confessionTemplate = document.getElementById("confessionTemplate");
const confessionForm = document.getElementById("confessionForm");
const formMessage = document.getElementById("formMessage");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const loginStatus = document.getElementById("loginStatus");

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.error || "Request failed";
    throw new Error(message);
  }

  return response.json();
}

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function setLoginState(authenticated, user = null) {
  if (authenticated) {
    loginButton.classList.add("hidden");
    logoutButton.classList.remove("hidden");
    loginStatus.textContent = "Logged in";
    
    // Update profile display
    if (user && user.displayName) {
      const profileName = document.querySelector(".profile__name");
      if (profileName) {
        profileName.textContent = user.displayName;
      }
    }
  } else {
    loginButton.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    loginStatus.textContent = "Not logged in";
    
    // Reset profile display
    const profileName = document.querySelector(".profile__name");
    if (profileName) {
      profileName.textContent = "Student #294";
    }
  }
}

async function checkAuth() {
  try {
    const data = await fetchJson("/auth/me", { method: "GET" });
    setLoginState(data.authenticated, data.user);
    return data.authenticated;
  } catch (error) {
    setLoginState(false);
    return false;
  }
}

function renderConfession(confession) {
  const fragment = confessionTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");
  const dateEl = fragment.querySelector(".card__date");
  const textEl = fragment.querySelector(".card__text");

  dateEl.textContent = formatDate(confession.createdAt);
  textEl.textContent = confession.text;

  const reactionButtons = fragment.querySelectorAll(".reaction");
  reactionButtons.forEach((button) => {
    const type = button.dataset.type;
    const count = confession.reactions[type] || 0;
    button.querySelector(".reaction__count").textContent = count;
    button.addEventListener("click", () => handleReaction(confession.id, type, button));
  });

  const actionButtons = fragment.querySelectorAll("[data-action]");
  actionButtons.forEach((button) => {
    const action = button.dataset.action;
    button.addEventListener("click", () => handleAction(action, confession));
  });

  card.dataset.id = confession.id;
  return fragment;
}

async function loadConfessions() {
  confessionList.innerHTML = "";
  try {
    const confessions = await fetchJson("/confessions", { method: "GET" });
    confessions.forEach((confession) => {
      confessionList.appendChild(renderConfession(confession));
    });
  } catch (error) {
    confessionList.textContent = "Unable to load confessions.";
  }
}

async function handleReaction(id, type, button) {
  try {
    const data = await fetchJson(`/confessions/${id}/react`, {
      method: "POST",
      body: JSON.stringify({ type })
    });

    const countEl = button.querySelector(".reaction__count");
    countEl.textContent = data.reactions[type];
  } catch (error) {
    alert(error.message);
  }
}

async function handleAction(action, confession) {
  const secretCode = prompt("Enter your secret code");
  if (!secretCode) {
    return;
  }

  if (action === "edit") {
    const updatedText = prompt("Update your confession", confession.text);
    if (!updatedText) {
      return;
    }

    try {
      await fetchJson(`/confessions/${confession.id}`, {
        method: "PUT",
        body: JSON.stringify({ text: updatedText, secretCode })
      });
      await loadConfessions();
    } catch (error) {
      alert(error.message);
    }
  }

  if (action === "delete") {
    const confirmed = confirm("Delete this confession?");
    if (!confirmed) {
      return;
    }

    try {
      await fetchJson(`/confessions/${confession.id}`, {
        method: "DELETE",
        body: JSON.stringify({ secretCode })
      });
      await loadConfessions();
    } catch (error) {
      alert(error.message);
    }
  }
}

confessionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const text = document.getElementById("confessionText").value.trim();
  const secretCode = document.getElementById("secretCode").value.trim();

  try {
    await fetchJson("/confessions", {
      method: "POST",
      body: JSON.stringify({ text, secretCode })
    });
    confessionForm.reset();
    formMessage.textContent = "Confession posted.";
    await loadConfessions();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

loginButton.addEventListener("click", () => {
  window.location.href = "/auth/google";
});

logoutButton.addEventListener("click", async () => {
  try {
    await fetchJson("/auth/logout", { method: "POST" });
    setLoginState(false);
  } catch (error) {
    alert(error.message);
  }
});

checkAuth();
loadConfessions();
