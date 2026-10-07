import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI SDK with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API endpoint to analyze photo subject and recommend studio treatments
app.post('/api/analyze-subject', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request' });
    }

    if (!ai) {
      return res.json({
        category: 'Subject',
        subjectName: 'Detected Object',
        tags: ['Photo', 'Subject'],
        recommendedBackdropColor: '#F5F5F7',
        recommendedBackdropName: 'Studio Neutral',
        advice: 'Clean background removal ready.',
        isECommerceReady: true,
      });
    }

    // Clean base64 data if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Analyze the main subject of this photo for background removal and photo editing. Respond strictly in JSON format.',
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description:
                'Primary category: e.g. Portrait, Pet, Footwear, Fashion, Electronics, Vehicle, Plant, Food, or Object',
            },
            subjectName: {
              type: Type.STRING,
              description: 'Short descriptive title of the subject (e.g. "Running Sneaker", "Golden Retriever", "Studio Portrait")',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 descriptive tags',
            },
            recommendedBackdropColor: {
              type: Type.STRING,
              description: 'Recommended hex color code that complements the subject (e.g. "#F8FAFC", "#1E293B", "#FEF3C7")',
            },
            recommendedBackdropName: {
              type: Type.STRING,
              description: 'Creative name for this recommended backdrop (e.g. "Clean Minimal White", "Moody Slate", "Warm Sunset")',
            },
            advice: {
              type: Type.STRING,
              description: 'A 1-sentence tip on how best to present this cutout (e.g. "Add a subtle contact shadow for realistic e-commerce presentation.")',
            },
            isECommerceReady: {
              type: Type.BOOLEAN,
              description: 'Whether this item is typically used in e-commerce or product catalogs',
            },
          },
          required: [
            'category',
            'subjectName',
            'tags',
            'recommendedBackdropColor',
            'recommendedBackdropName',
            'advice',
            'isECommerceReady',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error('Error analyzing subject:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze subject',
      fallback: {
        category: 'Subject',
        subjectName: 'Detected Object',
        tags: ['Photo', 'Cutout'],
        recommendedBackdropColor: '#FFFFFF',
        recommendedBackdropName: 'Studio White',
        advice: 'Background removed with precision.',
        isECommerceReady: true,
      },
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// Mount Vite middleware in development, or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
