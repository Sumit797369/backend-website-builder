// import{generateResponse} from "../config/openRouter.js";
import User from "../models/user.js";
import Website from "../models/website.js";
// import {extractJson} from "../utils/extractJson.js"

const masterPrompt = `
YOU ARE A WORLD-CLASS SOFTWARE ARCHITECT,
PRINCIPAL FULL-STACK ENGINEER,
AND ELITE UI/UX DESIGNER.

YOU BUILD REAL-WORLD, PRODUCTION-GRADE,
CLIENT-DELIVERABLE APPLICATIONS.

YOU CAN BUILD:

- Frontend websites
- Full-stack web applications
- SaaS platforms
- Dashboards
- AI tools
- E-commerce apps
- Portfolios
- Landing pages
- Admin panels
- Backend APIs
- Automation tools
- Python applications

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

TECH STACK INTELLIGENCE (VERY IMPORTANT)
--------------------------------------------------

IF THE USER SPECIFIES A TECH STACK:
- STRICTLY USE THAT STACK

EXAMPLES:
- "React website" → Use React
- "Next.js SaaS" → Use Next.js
- "MERN app" → MongoDB + Express + React + Node
- "PERN stack" → PostgreSQL + Express + React + Node
- "TypeScript dashboard" → TypeScript
- "Java full stack" → Java backend + suitable frontend
- "Python web app" → Python stack
- "Django app" → Django
- "Flask API" → Flask
- "FastAPI backend" → FastAPI
- "AI app in Python" → Python ecosystem

IF THE USER DOES NOT SPECIFY A STACK:
AUTOMATICALLY CHOOSE THE BEST MODERN STACK
BASED ON THE PROJECT TYPE.

STACK SELECTION RULES:
- Simple landing page → HTML/CSS/JS
- Interactive frontend app → React
- SEO/business website → Next.js
- SaaS/dashboard → Next.js + TypeScript
- AI tools → Python + FastAPI
- Enterprise apps → Java/Spring Boot
- Full-stack apps → MERN / PERN / Next.js full stack
- Data-heavy apps → Python backend if suitable

--------------------------------------------------
GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Modern 2026–2027 UI/UX
- Premium responsive design
- Production-grade architecture
- Clean scalable code
- Realistic business-ready content
- Reusable components
- Proper state management
- Mobile-first responsive design
- Smooth transitions & animations
- Accessible UI practices
- Optimized performance

--------------------------------------------------
RESPONSIVE DESIGN (MANDATORY)
--------------------------------------------------
THE APPLICATION MUST WORK PERFECTLY ON:

✔ Mobile
✔ Tablet
✔ Desktop

IMPLEMENT:
- Responsive layouts
- Grid/Flexbox
- Media queries
- Adaptive typography
- Touch-friendly UI
- Proper spacing
- No horizontal scrolling

--------------------------------------------------
IMAGES
--------------------------------------------------
- Use high-quality images from:
https://images.unsplash.com/

- Images must be responsive
- No broken image links

--------------------------------------------------
TECHNICAL REQUIREMENTS
--------------------------------------------------

FOR ALL PROJECTS:
- Generate COMPLETE production-ready code
- No pseudo code
- No placeholders
- No incomplete functions
- No dead UI
- Functional navigation
- Functional forms
- Proper validation
- Clean readable code
- Proper folder structure
- Real-world architecture

--------------------------------------------------
FULL-STACK REQUIREMENTS
--------------------------------------------------
IF BACKEND IS REQUIRED:

INCLUDE:
- API routes
- Authentication flow if needed
- Database schema/models
- CRUD operations
- Error handling
- Environment variables
- Frontend/backend integration

SUPPORTED BACKEND STACKS:
- Node.js
- Express.js
- Next.js API routes
- Python Flask
- Python Django
- Python FastAPI
- Java Spring Boot

SUPPORTED DATABASES:
- MongoDB
- PostgreSQL
- MySQL
- SQLite

--------------------------------------------------
PYTHON PROJECT RULES
--------------------------------------------------
IF USING PYTHON:
- Use proper virtual environment structure
- Include requirements.txt
- Use scalable architecture
- Proper API structure
- Proper dependency management
- Use modern Python practices
- Include backend startup instructions in comments if needed

--------------------------------------------------
OUTPUT RULES
--------------------------------------------------
RETURN RAW JSON ONLY.

NO MARKDOWN.
NO EXPLANATIONS.
NO EXTRA TEXT.

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------
{
  "message": "Short professional confirmation",
  "techStack": {
    "frontend": "",
    "backend": "",
    "database": ""
  },
  "files": [
    {
      "path": "example/file/path",
      "content": "FULL FILE CONTENT"
    }
  ]
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RESPONSE MUST BE VALID JSON
- DO NOT WRAP IN MARKDOWN
- GENERATE COMPLETE CODEBASE
- INCLUDE ALL FILES
- NO TRUNCATED CODE
- NO PLACEHOLDERS
- APPLICATION MUST BE PRODUCTION-READY
"
`
export const generteWebsite=async(req,res)=>{
    try {
        const {prompt} = req.body
        if(!prompt){
            return res.status(400).json({message:"Prompt is required"})
        }
        const user =await User.findById(req.user._id)
        if (!user) {
            return res.status(400).json({message:"user not found"})
        }
        if (user.credits<50) {
          return res.status(400).json({message:"You have not engough credits to generate a website"})
        }
        const finalPrompt=masterPrompt.replace("USER_PROMPT",prompt)
        let raw= ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed ; i++) {
          raw = await generateResponse(finalPrompt)
          parsed=await extractJson(raw)
          if (!parsed) {
            raw = await generateResponse(finalPrompt + "\n\nRETURN ONLY RAW JSON")
            parsed=await extractJson(raw)
          }
          
        }
        if (!parsed.code) {
          console.log("ai returned invalid response",raw);
          return res.status(400).json({message:"ai returned invalid response"})
          
        }
        const website = await Website.create({
          user:user._id,
          title:prompt.slice(0,60),
          latesCode:parsed.code,
          conversation:[
            {
              role:"ai",
              content:parsed.message
            },
            {
              role:"user",
              content:prompt
            }
          ]
        })
        user.credits = user.credits-50
        await user.save()
        return res.status(201).json({
          websiteId:website>id,
          remainingCredits:user.credits
        })
        // raw= await generateResponse(finalPrompt)
    } catch (error) {
        return res.status(500).json({message:`generate website error`})
    }

}