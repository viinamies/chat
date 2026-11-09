const form = document.querySelector("#chatForm");
const input = document.querySelector("#prompt");
const messagesEl = document.querySelector("#messages");\n// Set this to your deployed Cloudflare Worker URL.\nconst API_URL = "LISAA_CLOUDFLARE_WORKER_URL_TAHAN";
const sendBtn = document.querySelector(".send-btn");
const suggestions = document.querySelector("#suggestions");
let history = [];

function addMessage(role, content, typing = false) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "mini-avatar";
    avatar.textContent = "✳";
    row.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (typing) {
    bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  } else {
    const p = document.createElement("p");
    p.textContent = content;
    bubble.appendChild(p);
  }
  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return row;
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || sendBtn.disabled) return;
  suggestions.hidden = true;
  addMessage("user", clean);
  history.push({ role: "user", content: clean });
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;
  const loading = addMessage("assistant", "", true);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Jokin meni pieleen.");
    loading.remove();
    addMessage("assistant", data.reply);
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    loading.remove();
    addMessage("assistant", error.message);
    history.pop();
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
});
input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
suggestions.addEventListener("click", event => {
  const button = event.target.closest("button[data-prompt]");
  if (button) sendMessage(button.dataset.prompt);
});
document.querySelector("#clearBtn").addEventListener("click", () => {
  history = [];
  messagesEl.innerHTML = "";
  suggestions.hidden = false;
  addMessage("assistant", "Uusi keskustelu aloitettu! 😊 Mitä haluaisit tietää?");
});
