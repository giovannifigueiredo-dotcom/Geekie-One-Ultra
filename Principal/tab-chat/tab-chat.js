// WebLLM local AI chat — v16.0.0 multimodal
const CHAT_STORAGE_KEY = 'geekie_chat_messages';
const WEBLLM_MODEL_PREFERENCES = [
  'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  'Llama-3.2-1B-Instruct-q4f16_1-MLC'
];

async function getWebLLMEngine() {
  if (webLLMEngine) return webLLMEngine;
  if (!navigator.gpu) throw new Error('WebGPU não disponível');
  const webllm = await import('https://esm.run/@mlc-ai/web-llm');
  const modelId = chooseWebLLMModel(webllm);
  webLLMEngine = await webllm.CreateMLCEngine(modelId, { initProgressCallback });
  return webLLMEngine;
}