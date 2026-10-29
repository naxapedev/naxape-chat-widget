# Naxape Chat Widget

An embeddable, lightweight, and stylish chat widget built with React 19, Tailwind CSS, and Vite. Features style isolation via Shadow DOM to prevent styling conflicts on host websites.

## Features

- **Isolated Styling**: Encapsulated using Shadow DOM so it never interferes with the host website's CSS.
- **Single Bundle**: Compiles into a single standalone `widget.js` file (IIFE).
- **Customizable**: Configurable chatbot identity (`chatbotId`, `chatbotName`, `secureKey`).
- **Markdown & GFM Support**: Formatted responses with tables, links, and lists.
- **Lead Capture**: Built-in lead collection form.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your backend API URL:
```bash
cp .env.example .env
```
In `.env`:
```env
VITE_API_BASE=https://api.yourdomain.com
```

### 3. Development
Start the local development server:
```bash
npm run dev
```

### 4. Build for Production
To generate the standalone `widget.js` bundle:
```bash
npm run build
```
The output file will be generated at:
```
dist/widget.js
```

## Embedding on Any Website

Add the following snippet before the closing `</body>` tag on any webpage:

```html
<!-- Naxape Chat Widget -->
<script>
  window.naxapeWidgetConfig = {
    chatbotId: "YOUR_CHATBOT_ID",
    chatbotName: "Customer Support",
    secureKey: "YOUR_SECURE_KEY"
  };
</script>
<script src="https://cdn.yourdomain.com/widget.js" defer></script>
```
