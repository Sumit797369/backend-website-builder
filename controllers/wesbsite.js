import generateResponse from "../config/groq.js";
import User from "../models/user.js";
import Website from "../models/website.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE AN EXPERT FRONTEND WEB DEVELOPER AND UI/UX DESIGNER.

YOUR TASK IS TO GENERATE A COMPLETE, FULLY FUNCTIONAL, AND MODERN WEBSITE BASED ON THE USER PROMPT.

---

USER REQUIREMENT:
{USER_PROMPT}
-------------

TECH STACK:

* HTML
* CSS
* Vanilla JavaScript

IMPORTANT RULES:

1. Generate FULLY WORKING websites
2. Include COMPLETE functionality and logic
3. Do NOT generate placeholder UI
4. Do NOT leave unfinished code
5. Ensure buttons, inputs, forms, and features work correctly
6. Use responsive modern design
7. Use clean CSS styling
8. Keep code concise but functional
9. Do NOT use React
10. Do NOT use Tailwind
11. Do NOT use external libraries
12. Do NOT use npm packages
13. Do NOT use imports or exports
14. Everything must work directly in browser preview
15. Prevent blank screens and JavaScript errors

IF USER ASKS:

* Calculator → create fully working calculator
* Todo App → create working todo app
* Portfolio → create complete portfolio website
* Landing Page → create modern responsive landing page

---

## JSON OUTPUT FORMAT ONLY

RETURN ONLY VALID RAW JSON.

DO NOT:

* use markdown
* use \`\`\`json
* add explanations
* add comments
* add extra text

Response format:

{
"message": "short message",
"files": [
{
"path": "index.html",
"content": "full html code"
},
{
"path": "style.css",
"content": "full css code"
},
{
"path": "script.js",
"content": "full javascript code"
}
]
}

ABSOLUTE RULES:

* RESPONSE MUST BE VALID JSON ONLY
* ENSURE JSON.parse() WORKS
* ALL WEBSITE FEATURES MUST WORK
* GENERATE COMPLETE HTML/CSS/JS CODE
* AVOID JAVASCRIPT ERRORS
* ENSURE RESPONSIVE DESIGN
* NO EMPTY FILES
* NO PLACEHOLDER CONTENT
`;
export const generteWebsite=async(req,res)=>{
    try {
        const {prompt} = req.body
        if(!prompt){
            return res.status(400).json({message:"Prompt is required"})
        }
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({message:"user not found"})
        }
        if (user.credits<10) {
          return res.status(400).json({message:"You do not have enough credits"})
        }
        const finalPrompt=masterPrompt.replace("USER_PROMPT",prompt)
        let raw= ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed ; i++) {
          raw = await generateResponse(finalPrompt)
          try {
            parsed=await extractJson(raw)
          } catch (e) {
            console.error("JSON parse error:", e.message);
            parsed = null;
          }
          if (!parsed) {
            raw = await generateResponse(finalPrompt + "\n\nRETURN ONLY RAW JSON")
            try {
              parsed=await extractJson(raw)
            } catch (e) {
              console.error("JSON parse error fallback:", e.message);
              parsed = null;
            }
          }
        }
        if (!parsed || !parsed.files) {
          console.log("ai returned invalid response",raw);
          return res.status(400).json({message:"ai returned invalid response"})
          
        }
        const website = await Website.create({
          user:user._id,
          title:prompt.slice(0,60),
          slug: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
          latesCode: JSON.stringify(parsed),
          conversation:[
            {
              role:"ai",
              content: parsed.message || "Here is your website."
            },
            {
              role:"user",
              content:prompt
            }
          ]
        })
        user.credits = user.credits - 10;
        await user.save()
        return res.status(201).json({
          websiteId: website._id,
          remainingCredits: user.credits,
          latesCode: parsed
        });
        // raw= await generateResponse(finalPrompt)
    } catch (error) {
        console.error("Generate website error:", error);
        return res.status(500).json({message: error.message || `generate website error`})
    }

}

export const deployWebsite = async (req, res) => {
    try {
        const { id } = req.params;
        const website = await Website.findOne({ _id: id, user: req.userId });
        
        if (!website) {
            return res.status(404).json({ message: "Website not found" });
        }

        website.deployed = true;
        // In a real app, this would use the Vercel or Netlify API.
        // For now, we simulate deployment by providing a shareable live link based on the slug.
        website.deployUrl = `http://localhost:5173/preview/${website.slug}`;
        await website.save();

        return res.status(200).json({ 
            message: "Website deployed successfully",
            url: website.deployUrl
        });
    } catch (error) {
        console.error("Deploy error:", error);
        return res.status(500).json({ message: "Failed to deploy website" });
    }
}

export const getWebsiteBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const website = await Website.findOne({ slug });
        
        if (!website) {
            return res.status(404).json({ message: "Website not found" });
        }

        return res.status(200).json(website);
    } catch (error) {
        console.error("Fetch website error:", error);
        return res.status(500).json({ message: "Failed to fetch website" });
    }
}