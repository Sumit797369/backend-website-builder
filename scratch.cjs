const fs = require('fs');
require('dotenv').config();

fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You must return only valid raw JSON.' },
      { role: 'user', content: 'create a very simple html calculator. Return exactly: { "message": "ok", "code": "<html></html>"}' }
    ],
    temperature: 0.2,
    max_tokens: 8000,
    response_format: { type: 'json_object' }
  })
}).then(r => r.json()).then(d => {
  if (d.error) {
    console.error("GROQ ERROR:", d.error);
    return;
  }
  if (d.choices) {
    const content = d.choices[0].message.content;
    console.log("Raw Response:", content);
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    const sliced = content.slice(start, end + 1);
    try { 
      JSON.parse(sliced); 
      console.log('Parsed successfully'); 
    } catch(e) { 
      console.log('Parse failed:', e.message); 
    }
  }
}).catch(console.error);
