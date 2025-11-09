// pages/api/farming-knowledge/[topic].js
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { topic } = req.query;

        const response = await fetch(`http://127.0.0.1:8000/api/farming-knowledge/${topic}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`FastAPI returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Knowledge API Error:', error);
        res.status(500).json({
            success: false,
            response: `Knowledge load failed: ${error.message}`,
            type: 'error'
        });
    }
}