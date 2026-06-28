const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        const nlp = require('compromise');
        const doc = nlp(message);
        
        let reply = "Hello! I am your AI Civic Assistant. How can I help you today?";
        const nouns = doc.nouns().out('array').map(n => n.toLowerCase());
        const verbs = doc.verbs().out('array').map(v => v.toLowerCase());
        const lowerMsg = message.toLowerCase();

        // Simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 800));

        if (lowerMsg.includes('status') || lowerMsg.includes('track') || lowerMsg.includes('where is')) {
            reply = "You can track all your active complaints and view real-time department routing in the 'Complaints' dashboard.";
        } else if (nouns.includes('pothole') || nouns.includes('road') || nouns.includes('street')) {
            reply = "It sounds like you've found a road issue. Our AI will automatically route this to the Road Department if you submit a new complaint with an image or description!";
        } else if (nouns.includes('water') || nouns.includes('leak') || nouns.includes('pipe')) {
            reply = "Water leaks are considered High Priority! Please head over to 'New Complaint' and report it so our AI can alert the Water Board immediately.";
        } else if (nouns.includes('garbage') || nouns.includes('waste') || nouns.includes('trash')) {
            reply = "Sanitation is important. Submit a new complaint, and our system will route it to the Sanitation Department.";
        } else if (nouns.includes('electricity') || nouns.includes('power') || nouns.includes('light')) {
            reply = "Electrical issues are Critical! Please file a complaint right away so we can alert the Electrical Department.";
        } else if (doc.has('#Question')) {
            reply = "That's a great question! I am currently running in offline NLP mode. To process complex queries, please submit a formal complaint ticket.";
        } else if (message.length > 5) {
            reply = "I understand. The best way to get this resolved is to use our 'New Complaint' tab so our AI can analyze and route your issue to the correct officials.";
        }

        return res.json({ reply });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are a helpful AI assistant for a Public Grievance Intelligence System. 
        A user says: "${message}". 
        Provide a short, helpful, and friendly response. If they mention a civic issue, encourage them to submit a complaint through the platform.`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        res.json({ reply: response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ reply: "Sorry, I am having trouble understanding right now." });
    }
});

module.exports = router;
