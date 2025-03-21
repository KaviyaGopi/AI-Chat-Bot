import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const chatHistory = {};
const personalities = {
  professional: "You have to reply formally.",
  friendly: "You can be jovial and very friendly.",
  witty: "You are a sarcastic chatbot who answers questions with ridiculous, humorous responses."
};

app.post('/check-safety', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { 
            role: "system", 
            content: `You are a strict AI content moderation assistant. Your job is to classify user messages as SAFE or UNSAFE. 
          
          A message is UNSAFE if it contains or asks about:
          1. **Self-harm or suicide-related content** (e.g., "How to suicide?", "I want to die.")
          2. **Medical advice** (e.g., fertility, conception, pregnancy, or health issues)
          3. **Illegal or violent activities** (e.g., weapons, drugs, terrorism, bomb-making)
          4. **Hate speech, threats, or harassment** (e.g., racism, abuse, insults)
          5. **Sexually explicit content or inappropriate requests**
          
          Reply strictly with:
          - **"UNSAFE"** if the message contains any of the above.
          - **"SAFE"** if it does not.`
          },
          
          { role: "user", content: message }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const classification = response.data.choices[0].message.content.trim().toUpperCase();

    if (classification === "UNSAFE") {
      // Step 2: Generate a vague and unhelpful response
      const vagueResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [
            { 
              role: "system", 
              content: 'You are a bureaucratic assistant who replies really really long'
            },
            { role: "user", content: "Talk about random thing like scam, murders, theft" }
          ],
          max_tokens: 200                    
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({ isUnsafe: true, filteredText: vagueResponse.data.choices[0].message.content });
    }

    res.json({ isUnsafe: false });

  } catch (error) {
    console.error("Groq Safety API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error checking safety' });
  }
});



app.post('/check-profanity', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: "system",
            content: `    
            Can you check if the message contains very vulgar and bad words, if its a small word leave
            
            Reply strictly with:
            - "UNSAFE" if the message contains any bad words.
            - "SAFE" if the message contains no bad words.`
          },
    
          {
            role: "user",
            content: message // This is the user message being evaluated.
          }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const classification = response.data.choices[0].message.content.trim().toUpperCase();

    if (classification === "UNSAFE") {
      return res.json({ isProfane: true, filteredText: "Let's talk about something else!" });
    }

    res.json({ isProfane: false });

  } catch (error) {
    console.error("Groq Safety API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error checking safety' });
  }
});


// This is the main chat endpoint
app.post('/chat', async (req, res) => {
  const { userId, message, personality } = req.body;

  if (!userId || !message || !personalities[personality]) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  try {
    // Step 1: We are checking if the message contains profanity
    const profanityCheck = await axios.post(`http://localhost:${port}/check-profanity`, { message });
    if (profanityCheck.data.isProfane) {
      return res.json({ isProfane: true, reply: "Let's talk about something else!" });
    }

    // Step 2: We are checking if the message is safe (if no profanity found)
    const safetyCheck = await axios.post(`http://localhost:${port}/check-safety`, { message });
    if (safetyCheck.data.isUnsafe) {
      return res.json({ isProfane: false, isUnsafe: true, reply: safetyCheck.data.filteredText }); // Use the vague response!
    }

    // Step 3: If message is both safe and doesn't contain profanity, process chat
    chatHistory[userId] = chatHistory[userId] || [];
    chatHistory[userId].push({ role: 'user', content: message });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: "system", content: personalities[personality] },
          ...chatHistory[userId],
        ],
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let botReply = response.data.choices[0].message.content;

    chatHistory[userId].push({ role: 'assistant', content: botReply });
    res.json({ isProfane: false, isUnsafe: false, reply: botReply });

  } catch (error) {
    console.error("Groq API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
