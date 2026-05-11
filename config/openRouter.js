const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

const freeModels = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-nemo:free"
];

const generateResponse = async (prompt) => {
  const openRouetrApiKey = process.env.OPENROUTER_API_KEY;
  let lastError = null;

  // Loop through fallback models if one is rate-limited
  for (const model of freeModels) {
    try {
      console.log("Trying model: " + model);
      const res = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouetrApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "Your must return only valid raw JSON." },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 8000
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Model ${model} failed:`, err);
        lastError = err;
        continue; // Immediately try the next model
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Request crashed on ${model}:`, error.message);
      lastError = error.message;
      continue;
    }
  }

  throw new Error("openRouter err: All free models failed. " + lastError);
};

export default generateResponse;