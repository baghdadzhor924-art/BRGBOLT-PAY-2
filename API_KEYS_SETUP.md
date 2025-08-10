# API Keys Setup Guide

This application requires several API keys to function properly. Follow the steps below to get your API keys and configure them.

## Required API Keys

### 1. BrowseAI API Key
**Purpose**: Web scraping and data extraction
**Get it from**: https://www.browse.ai/
**Steps**:
1. Sign up for a free account
2. Go to your dashboard
3. Copy your API key from the settings

### 2. OpenAI API Key
**Purpose**: AI content generation for landing pages using GPT-4
**Get it from**: https://platform.openai.com/api-keys
**Steps**:
1. Sign up for a free account
2. Go to API Keys section
3. Create a new API key
4. Copy the key

### 3. SerpAPI Key
**Purpose**: Search engine results and competitor analysis
**Get it from**: https://serpapi.com/
**Steps**:
1. Sign up for a free account (100 searches/month free)
2. Go to your dashboard
3. Copy your API key

### 4. Remove Background API Key (Optional)
**Purpose**: Image processing and background removal
**Get it from**: https://www.remove.bg/
**Steps**:
1. Sign up for a free account
2. Go to API section
3. Copy your API key

## Configuration

1. **Edit the `.env` file** in your project root
2. **Replace the placeholder values** with your actual API keys:

```env
# BrowseAI API Key
VITE_BROWSE_AI_API_KEY=your_actual_browse_ai_key_here

# OpenAI API Key
VITE_OPENAI_API_KEY=your_actual_openai_key_here

# SerpAPI Key
VITE_SERP_API_KEY=your_actual_serp_key_here

# Remove Background API Key (optional)
VITE_REMOVE_BG_API_KEY=your_actual_remove_bg_key_here
```

## Testing Your Setup

1. **Start the development server**: `npm run dev`
2. **Open the app** in your browser
3. **Enter a product URL** (e.g., Amazon product link)
4. **Select a language** (English or Arabic)
5. **Click "Generate Landing Page"**

## Troubleshooting

### If you get API errors:
- Check that your API keys are correct
- Ensure you have sufficient credits/quota
- Verify the API keys are properly set in the `.env` file
- Restart the development server after changing `.env`

### If the app doesn't work without API keys:
The app will fall back to mock data if API keys are not provided, but for full functionality, you need the API keys.

## Free Tier Limits

- **BrowseAI**: Limited free tier available
- **OpenAI**: Pay-per-use pricing with GPT-4
- **SerpAPI**: 100 searches/month free
- **Remove Background**: Limited free tier

## Security Note

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API keys secure and don't share them publicly 