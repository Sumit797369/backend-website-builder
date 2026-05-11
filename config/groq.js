const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
const model = "llama-3.3-70b-versatile";

const generateResponse = async (prompt) => {
  const groqApiKey = process.env.GROQ_API_KEY || "gsk_5F3K2V8M9L1Q7Z4X0C6N3B8A5D2Y9P4E1H7W0R6T3U9I8O2";
  const res = await fetch(groqUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "You must return only valid raw JSON without any markdown formatting, backticks, or explanations." },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500
    }),
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Groq API error: " + err);
  }
  
  const data = await res.json();
  return data.choices[0].message.content;
};

export default generateResponse;
