const IS_PRODUCTION = true;

// Base API URL
export const API_BASE_URL = IS_PRODUCTION 
  ? 'https://backend.aisita.ai/api'
  : 'http://127.0.0.1:8000/api';

// Chart API URL
export const CHART_API_URL = IS_PRODUCTION
  ? 'https://backend.aisita.ai/api/chart'
  : 'http://localhost:8888/.netlify/functions/chart-proxy';

// Yahoo Finance API URL
export const YAHOO_API_URL = IS_PRODUCTION
  ? 'https://backend.aisita.ai/api'
  : 'http://localhost:3005';

// OpenRouter API URL
export const OPENROUTER_API_URL = `${API_BASE_URL}/openrouter`;

// Firebase login URL
export const FIREBASE_LOGIN_URL = `${API_BASE_URL}/firebase-login`;

// Models API URL
export const MODELS_API_URL = `${API_BASE_URL}/models`;

// Model cost calculation URL
export const MODEL_COST_URL = `${API_BASE_URL}/model-cost`;

// Frontend URL
export const FRONTEND_URL = 'https://aisita.ai';

export const APP_ENV = IS_PRODUCTION ? 'production' : 'development';
