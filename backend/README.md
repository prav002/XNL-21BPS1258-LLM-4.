📌 Overview

The backend is built using FastAPI, featuring:

WebSocket-based real-time chat
JWT authentication for security
Mistral AI integration for financial insights
FAISS vector search for document retrieval

🚀 Tech Stack

FastAPI – Lightweight and fast backend framework
WebSockets – Enables real-time chat
JWT Authentication – Secures user communication
FAISS (Facebook AI Similarity Search) – Optimized document retrieval
Mistral AI – AI-powered financial response generation
SentenceTransformers – Text embedding model for document search
Uvicorn – ASGI server to run FastAPI

📡 API Endpoints

Method	 Endpoint	                        Description
POST	/token?username={your_username} 	Generates a JWT token for authentication
WS	    /chat?token={JWT_TOKEN} 	        Establishes WebSocket connection for real-time chat