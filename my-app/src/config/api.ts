// API Configuration
// This uses the environment variable set in .env.local or defaults to localhost for development

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default API_URL;
