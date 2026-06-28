const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake_key');

async function processComplaint(text) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        const nlp = require('compromise');
        const doc = nlp(text);
        
        // AI Summarization: Get main sentence and nouns
        let summary = doc.sentences().first().text();
        if (summary.length > 60) {
            summary = summary.substring(0, 57) + '...';
        }
        if (!summary) summary = text.substring(0, 50);

        // AI Classification, Department Routing, and Priority
        let category = 'General';
        let department = 'General Support';
        let priority = 'Medium';

        const lowerText = text.toLowerCase();
        
        const categories = [
            { keys: ['water', 'leak', 'pipe', 'plumbing', 'drain'], cat: 'Water Leakage', dept: 'Water Board', prio: 'High' },
            { keys: ['pothole', 'road', 'street', 'asphalt', 'crack'], cat: 'Road Issue', dept: 'Road Department', prio: 'Medium' },
            { keys: ['garbage', 'waste', 'trash', 'dump', 'smell', 'bin'], cat: 'Sanitation', dept: 'Sanitation Department', prio: 'Medium' },
            { keys: ['electricity', 'power', 'wire', 'light', 'shock', 'pole'], cat: 'Electrical', dept: 'Electrical Department', prio: 'Critical' },
            { keys: ['noise', 'loud', 'music', 'party', 'sound'], cat: 'Noise Complaint', dept: 'Police Department', prio: 'Low' },
            { keys: ['tree', 'branch', 'fallen', 'park', 'grass'], cat: 'Parks & Forestry', dept: 'Parks Department', prio: 'Low' }
        ];

        // Perform NLP keyword extraction
        const nouns = doc.nouns().out('array').map(n => n.toLowerCase());
        const verbs = doc.verbs().out('array').map(v => v.toLowerCase());
        const allWords = [...nouns, ...verbs, ...lowerText.split(/\W+/)];

        for (let c of categories) {
            if (c.keys.some(k => allWords.includes(k) || lowerText.includes(k))) {
                category = c.cat;
                department = c.dept;
                priority = c.prio;
                break;
            }
        }

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            summary,
            category,
            department,
            priority
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        Analyze the following civic complaint and provide a JSON response with no markdown formatting.
        Complaint: "${text}"
        
        Required fields in JSON:
        - "summary": A very brief, one-sentence summary of the complaint.
        - "category": The type of issue (e.g., Water Leakage, Pothole, Garbage, Electrical, etc.).
        - "department": The specific government department responsible (e.g., Water Board, Road Department, Sanitation Department, Electrical Department).
        - "priority": The urgency level (Low, Medium, High, Critical).
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI Error:", error);
        return {
            summary: text,
            category: 'General',
            department: 'General Support',
            priority: 'Medium'
        };
    }
}

async function analyzeImage(imageBuffer, mimeType) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        return {
            category: "Pothole",
            department: "Road Department",
            priority: "High"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = `Analyze this image of a civic issue. Return JSON with no markdown formatting:
        {"category": "issue type", "department": "responsible department", "priority": "Low/Medium/High/Critical"}`;
        
        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
         return {
            category: 'General',
            department: 'General Support',
            priority: 'Medium'
        };
    }
}

module.exports = { processComplaint, analyzeImage };
