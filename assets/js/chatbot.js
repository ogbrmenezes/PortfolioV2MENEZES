// Chatbot Gemini - front-end
(() => {
    const form = document.querySelector('.chatbot-input');
    const input = form?.querySelector('input[name="message"]');
    const messagesEl = document.querySelector('.chatbot-messages');
    const btnToggle = document.querySelector('.chatbot-toggle');
    const btnClose = document.querySelector('.chatbot-close');
    const btnClear = document.querySelector('.chatbot-clear');

    const API_URL = 'https://ogbrmenezesportfolio.onrender.com/api/chat-gemini';
    const SYSTEM_PROMPT = [
        'Voce e o assistente do portfolio do profissional Gabriel Menezes.',
        'Use apenas as informacoes fornecidas aqui; nao invente stacks ou experiencias que nao estejam listadas.',
        'Perfil real: Arquiteto de Solucoes (desde 2026) e desenvolvedor Python. Atua com APIs, automacao e integracoes, com experiencia em suporte/operacao de varejo e logistica (Americanas), foco em estabilidade, SLA e eficiencia. Certificacao Android Partner Associate.',
        'Carreira: Analista de Suporte N2 na Americanas (2023-2025) com automacoes em Python; promovido a Arquiteto de Solucoes a partir de 2026. Atividades: homologacao de produtos, apoio a desenvolvimento e suporte, desenho de integracoes, automacao de tarefas.',
        'Projetos: Zhaz Repairs (portal OS, tecnicos, metricas, Flask+Python+SQL), RoboZap (bot que envia chamados no WhatsApp, Python+JS+APIs), Zhaz Controle (kanban corporativo HTML/CSS).',
        'Skills: Backend (Python, Flask, APIs, SQL, Automacao), Frontend (HTML, CSS, JavaScript, Responsivo), Infra/Suporte (Redes, ITIL, GLPI/ServiceNow, Service Aide, MDM, Android).',
        'Contato: ogabrieldemenezes@gmail.com, GitHub github.com/ogbrmenezes, LinkedIn linkedin.com/in/ogabrielmenezes.',
        'Resposta curta para papel atual: "Gabriel atua como Arquiteto de Solucoes, focado em integracoes, automacao, estabilidade e eficiencia para operacoes de varejo e logistica. Papel atual: Arquiteto de Solucoes."',
        'Restricoes: Fale apenas sobre Gabriel Menezes, seu perfil, carreira, projetos, habilidades ou contato. Se perguntarem algo fora do tema, responda: "Posso ajudar apenas com informacoes sobre o profissional Gabriel Menezes." Se nao souber, diga que a informacao nao esta disponivel. Nao use placeholders ou texto generico. Nao mencione stacks nao listadas (ex.: Django, AWS, Spark, Big Data, GCP, Azure, Kubernetes, Terraform, DevOps cloud).'
    ].join(' ');

    const FALLBACK_REPLY = 'Gabriel atua como Arquiteto de Solucoes, focado em integracoes, automacao, estabilidade e eficiencia (Python/APIs/automacao). Posso detalhar perfil, carreira, projetos (Zhaz Repairs, RoboZap, Zhaz Controle), habilidades ou contato.';
    const BLOCKED_KEYWORDS = ['django', 'aws', 'amazon web services', 'spark', 'big data', 'gcp', 'google cloud', 'azure', 'kubernetes', 'terraform', 'devops cloud'];
    const ROLE_KEYWORDS = ['setor', 'atua', 'atuando', 'trabalha', 'cargo', 'funcao', 'hoje', 'agora'];
    const ROLE_ANSWER = 'Gabriel atua como Arquiteto de Solucoes, focado em integracoes, automacao, estabilidade e eficiencia (Python/APIs/automacao) para operacoes de varejo e logistica.';

    let busy = false;
    let history = [{ role: 'system', content: SYSTEM_PROMPT }];

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
        const lowerQuestion = text.toLowerCase();
        const askedRoleDirect = ROLE_KEYWORDS.some((kw) => lowerQuestion.includes(kw));

        addMessage(text, 'user');
        history.push({ role: 'user', content: text });
        input.value = '';

        if (askedRoleDirect) {
            addMessage(ROLE_ANSWER, 'bot');
            history.push({ role: 'assistant', content: ROLE_ANSWER });
            busy = false;
            return;
        }

        busy = true;
        setTyping(true);
        try {
            const resp = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history })
            });
            const data = await resp.json();
            setTyping(false);
            const rawReply = data?.reply || data?.error || '';
            const lower = (rawReply || '').toLowerCase();
            const hasBlocked = BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
            const reply = (!rawReply || rawReply.includes('[Insira') || rawReply.includes('[insira') || hasBlocked)
                ? FALLBACK_REPLY
                : rawReply;
            addMessage(reply, 'bot');
            history.push({ role: 'assistant', content: reply });
        } catch (err) {
            setTyping(false);
            addMessage('Erro ao conectar com a IA.', 'bot');
        } finally {
            busy = false;
        }
    });

    btnClose?.addEventListener('click', () => setTyping(false));
    btnToggle?.addEventListener('click', () => setTyping(false));

    // Limpar conversa
    btnClear?.addEventListener('click', () => {
        history = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (messagesEl) {
            messagesEl.innerHTML = '';
        }
    });
})();
