import generateResponse from "../config/groq.js";
import User from "../models/user.js";
import Website from "../models/website.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `You are an elite frontend developer. Build a stunning, production-grade website using ONLY vanilla HTML, CSS, and JavaScript in a single file.

USER REQUEST: {USER_PROMPT}

DESIGN RULES (follow strictly):
- Use :root CSS variables for colors: --primary, --primary-dark, --accent, --bg-dark (#0f0f1a), --bg-light (#f8f9fa), --text-primary, --text-secondary
- Use curated HSL colors matching the site purpose. NEVER plain red/blue/green
- System font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Headings: clamp(2.5rem,5vw,4rem), font-weight:800, letter-spacing:-0.02em
- Body: 1.05rem, line-height:1.7
- Sections: padding clamp(4rem,8vw,7rem) clamp(1rem,5vw,5rem), max-width:1200px centered
- Cards: border-radius:16px, padding:2rem, box-shadow:0 8px 30px rgba(0,0,0,0.12), hover: translateY(-6px) with shadow increase, transition:all 0.3s ease
- Buttons: gradient background, color:#fff, border-radius:50px, padding:14px 32px, hover: translateY(-2px) + glow shadow
- Glassmorphism on navbar: background:rgba(15,15,26,0.8), backdrop-filter:blur(20px), border-bottom:1px solid rgba(255,255,255,0.1), position:fixed
- Hero: min-height:100vh, gradient/dark background, @keyframes fadeInUp animation on heading, CTA button with gradient
- Grid layouts: 3 cols desktop, 2 cols tablet, 1 col mobile using CSS Grid
- Smooth transitions on ALL interactive elements
- Use ::before/::after for decorative accents

RESPONSIVE (mandatory):
- Media queries for max-width:768px (hamburger menu, single column, stacked sections) and max-width:1024px (2 columns)
- Mobile hamburger: 3 CSS spans, toggles with JS, smooth slide transition
- Images: max-width:100%, object-fit:cover
- No horizontal scroll on any device

FUNCTIONALITY (must work):
- SPA navigation: data-page attributes, .page.active toggling, smooth transitions, home visible by default
- Contact form with JS validation (red borders on error, success message on submit)
- All requested features (todo, calculator, gallery, etc.) must have COMPLETE working JavaScript
- NO placeholder buttons, NO "coming soon", NO dead UI

CONTENT: Real professional text, NO lorem ipsum. Use Unsplash images (url?auto=format&fit=crop&w=800&q=80).

TECHNICAL: One HTML file, inline <style> and <script>, no external resources, system fonts only, iframe srcdoc compatible.

OUTPUT: Return ONLY raw JSON, no markdown:
{"message":"brief description","code":"<COMPLETE HTML>"}`;

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
        if (!parsed || !parsed.code) {
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
