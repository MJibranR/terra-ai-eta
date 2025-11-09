// pages/api/analyze-farm-location.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { location, budget, experience, goals } = req.body;

        const response = await fetch('http://127.0.0.1:8000/api/analyze-farm-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location,
                budget: budget || 'medium',
                experience: experience || 'beginner',
                goals: goals || 'Start a sustainable farm'
            }),
        });

        if (!response.ok) {
            throw new Error(`FastAPI returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Analysis API Error:', error);
        res.status(500).json({
            success: false,
            response: `Analysis failed: ${error.message}`,
            type: 'error'
        });
    }
}