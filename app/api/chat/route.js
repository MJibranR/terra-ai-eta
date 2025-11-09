// app/api/chat/route.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { message, chat_history } = req.body;

        console.log('Forwarding to FastAPI:', { message });

        const response = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                chat_history: chat_history || []
            }),
        });

        if (!response.ok) {
            throw new Error(`FastAPI returned ${response.status}`);
        }

        const data = await response.json();
        console.log('FastAPI response:', data);

        res.status(200).json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).json({
            success: false,
            response: `Backend connection failed: ${error.message}`,
            type: 'error'
        });
    }
}