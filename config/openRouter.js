const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const openRouetrApiKey = process.env.OPENROUTER_API_KEY;
const model = "deepseek/deepseek-chat";

const generateResponse = async (prompt) => {
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
      temperature:0.2
    }),
  });
};
