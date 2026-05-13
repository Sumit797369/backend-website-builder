const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

const model = "llama-3.3-70b-versatile";

const generateResponse = async (prompt) => {
const groqApiKey = process.env.GROQ_API_KEY;

const systemPrompt = `
You are an elite frontend developer and UI designer.

You must return ONLY valid raw JSON.

The JSON format must be:
{
"message": "short success message",
"code": "full html document"
}

STRICT RULES:

Generate a COMPLETE standalone HTML document.
Use ONLY HTML + TailwindCSS CDN + vanilla JavaScript.
DO NOT use React.
DO NOT use JSX.
DO NOT use React Router.
DO NOT use BrowserRouter.
DO NOT use imports.
DO NOT use npm packages.
DO NOT use href="/".
DO NOT use window.location.
DO NOT navigate outside the page.
Use ONLY section-based navigation like href="#about".
Make all websites modern and beautiful.
Use proper spacing and typography.
Use smooth animations.
Use responsive layouts.
Use glassmorphism and gradients where appropriate.
Include Tailwind CDN in every response.

The HTML MUST include:

IMPORTANT:
Return ONLY raw JSON.
Do NOT use markdown.
Do NOT use backticks.
`;

const res = await fetch(groqUrl, {
method: "POST",
headers: {
Authorization: `Bearer ${groqApiKey}`,
content: "application/json",
},
body: JSON.stringify({
model,
messages: [
{
role: "system",
content: systemPrompt,
},
{
role: "user",
content: prompt,
},
],
temperature: 0.2,
max_tokens: 8000,
response_format: {
type: "json_object",
},
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