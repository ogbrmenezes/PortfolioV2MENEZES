// Chatbot Gemini - front-end
(() => {
    const form = document.querySelector('.chatbot-input');
    const input = form?.querySelector('input[name="message"]');
    const messagesEl = document.querySelector('.chatbot-messages');
    const btnToggle = document.querySelector('.chatbot-toggle');
    const btnClose = document.querySelector('.chatbot-close');
    const btnClear = document.querySelector('.chatbot-clear');

const API_URL = 'https://ogbrmenezesportfolio.onrender.com/api/chat-gemini';
    let busy = false;
    let history = [];

    const addMessage = (text, role = 'user') => {
        if (!messagesEl) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const setTyping = (state) => {
        if (!messagesEl) return;
        if (state) {
            const div = document.createElement('div');
            div.className = 'chat-msg typing';
            div.textContent = 'Digitando...';
            messagesEl.appendChild(div);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        } else {
            const typingEl = messagesEl.querySelector('.chat-msg.typing');
            typingEl?.remove();
        }
    };

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!input || !messagesEl) return;
        const text = input.value.trim();
        if (!text || busy) return;
        busy = true;

        addMessage(text, 'user');
        history.push({ role: 'user', content: text });
        input.value = '';

        setTyping(true);
        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history })
            });
            const data = await resp.json();
            setTyping(false);
            const reply = data?.reply || data?.error || 'Sem resposta.';
            addMessage(reply, 'bot');
            history.push({ role: 'assistant', content: reply });
        } catch (err) {
            setTyping(false);
            addMessage('Erro ao conectar à IA.', 'bot');
        } finally {
            busy = false;
        }
    });

    btnClose?.addEventListener('click', () => setTyping(false));
    btnToggle?.addEventListener('click', () => setTyping(false));

    // Limpar conversa
    btnClear?.addEventListener('click', () => {
        history = [];
        if (messagesEl) {
            messagesEl.innerHTML = '';
        }
    });
})();
