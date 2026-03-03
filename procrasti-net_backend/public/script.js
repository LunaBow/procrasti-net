let ws;
let messagesContainer;
let typingContainer;
let usernameInput;
let messageInput;
let typingTimeout = null;
const typing = [];

async function init() {
    messagesContainer = document.getElementById('messages');
    typingContainer = document.getElementById('typing');
    usernameInput = document.getElementById('username');
    messageInput = document.getElementById('message');


    try {
        const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProto}//${location.host}/ws`; 
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            ws.send(JSON.stringify({event: 'join', user_id: usernameInput.value, chat_id: 7 }));
        }
        ws.onmessage = event => {
            const data = JSON.parse(event.data);

            switch (data.event) {
                case 'message':
                    addMessage(data.data.user_id, data.data.message);
                    break;
                case 'startTyping':
                    typing.push(data.data.user_id);
                    renderTyping();
                    break;
                case 'stopTyping':
                    typing.splice(typing.indexOf(data.data.user_id), 1);
                    renderTyping();
                    break;
            }
        }
        ws.onerror = (e) => {
            console.warn("WebSocket error:", e);
        };
    } catch (e) {
        console.warn("WebSocket disabled:", e);
    }

    usernameInput.value = localStorage.getItem('username') ?? '';

    usernameInput.addEventListener('keyup', event => {
        localStorage.setItem('username', usernameInput.value);
    });

    messageInput.addEventListener('keyup', event => {
        if (typingTimeout !== null) {
            clearTimeout(typingTimeout);
        } else if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({event: 'startTyping', user_id: usernameInput.value,chat_id: 7}));
        }

        typingTimeout = setTimeout(() => {
            typingTimeout = null;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({event: 'stopTyping', user_id: usernameInput.value, chat_id: 7}));
            }
        }, 3000);

        if (event.key === 'Enter') {
            if (!usernameInput.value || !messageInput.value) return;

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({event: 'message', user_id: usernameInput.value, message: messageInput.value, chat_id: 7}));
                ws.send(JSON.stringify({event: 'stopTyping', user_id: usernameInput.value, chat_id: 7}));
            }
            messageInput.value = '';

            if (typingTimeout !== null) {
                clearTimeout(typingTimeout);
                typingTimeout = null;
            }
        }
    });
}

function addMessage(username, message) {
    const wrapper = document.createElement('div');
    const user = document.createElement('span');
    const msg = document.createElement('p');

    user.textContent = username;
    msg.textContent = message;

    wrapper.append(msg, user);
    wrapper.classList.add('message');

    messagesContainer.append(wrapper);
}

function renderTyping() {
    if (typing.length === 0) {
        typingContainer.innerText = '';
        return;
    }

    const users = typing.join(', ');
    typingContainer.innerText = `${users} ${typing.length > 1 ? 'are' : 'is'} typing`;
}

document.addEventListener('DOMContentLoaded', init);