// Centralised Groq model selection — the ONLY place a model id lives in code.
// Override at runtime by setting GROQ_MODEL in the environment (.env) and restarting.
// List valid ids for this key via: GET https://api.groq.com/openai/v1/models
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
