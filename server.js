const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// 🔥 Habilita CORS para que o GitHub Pages possa acessar a API
app.use(cors({
  origin: "*", // Se quiser, posso deixar mais seguro depois
}));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY não definido. Configure a variável antes de usar /api/chat-gemini.');
}

const ALLOWED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
];

const envModel = process.env.GEMINI_MODEL;
const MODEL_NAME = ALLOWED_MODELS.includes(envModel) ? envModel : 'gemini-flash-latest';
let model = null;

const initModel = () => {
  if (!apiKey) return;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
    if (envModel && !ALLOWED_MODELS.includes(envModel)) {
      console.warn(`GEMINI_MODEL="${envModel}" não está na lista permitida. Usando fallback: ${MODEL_NAME}`);
    }
    console.log(`Modelo ativo: ${MODEL_NAME}`);
  } catch (err) {
    console.error('Falha ao iniciar modelo Gemini:', err);
  }
};

initModel();

const SYSTEM_PROMPT =
  'Você é um assistente do portfólio do Gabriel Menezes. Responda em português, seja objetivo e cordial.';

app.post('/api/chat-gemini', async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensagem obrigatória.' });
  }
  if (!model) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada ou modelo não inicializado.' });
  }

  try {
    const roleMap = { user: 'user', assistant: 'model', model: 'model' };

    const mappedHistory = history
      .filter((h) => h && h.role && h.content)
      .map((h) => ({
        role: roleMap[h.role] || 'user',
        parts: [{ text: h.content }],
      }));

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      ...mappedHistory,
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: { temperature: 0.6, topP: 0.9 },
    });

    const reply = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';
    return res.json({ reply });
  } catch (err) {
    const status = err?.response?.status;
    const detail = err?.response?.data || err?.message || err;
    console.error('Erro Gemini:', detail);
    return res.status(status || 500).json({ error: 'Falha ao gerar resposta.' });
  }
});

// 🔥 Removemos express.static e o fallback do index.html
// Porque o Render será APENAS backend

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Gemini rodando na porta ${PORT}`);
});
