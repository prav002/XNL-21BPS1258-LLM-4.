import os
import time
import jwt
import faiss
import numpy as np
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer
from mistralai import Mistral
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn

# ✅ Hardcode the Mistral API Key Here (TEMPORARY)
MISTRAL_API_KEY = "Z1jj75jnYOZuIGmgGC4kiXH5hbYkSnuo"  # 🔴 Replace with actual API key

# ✅ Initialize Mistral AI Client (NEW FORMAT)
client = Mistral(api_key=MISTRAL_API_KEY)

# ✅ JWT Security Configuration (Use Random 32-Character Hex Key)
SECRET_KEY = os.urandom(32).hex()  # 🔹 Generate Random Secret Key at Startup
ALGORITHM = "HS256"
security = HTTPBearer()

# ✅ Function to Generate JWT Token Dynamically
def create_jwt_token(username: str):
    """Generate a JWT Token"""
    expiration = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    payload = {"sub": username, "exp": expiration}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

# ✅ Function to Verify JWT Token
def verify_jwt_token(token: str):
    """Verify the JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ FastAPI Initialization
app = FastAPI(
    title="Financial AI Chatbot",
    description="Secure API for Mistral AI chatbot with JWT authentication and vector retrieval",
    version="1.0",
)

# ✅ Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load Pre-trained Embedding Model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# ✅ Sample Financial Documents
documents = [
    "Stock market is volatile due to inflation and interest rates.",
    "Bitcoin and Ethereum are leading cryptocurrencies with high volatility.",
    "Long-term investments in index funds like S&P 500 offer stable returns.",
    "The Federal Reserve plays a key role in economic policy and interest rates.",
    "Cryptocurrency regulations vary across different countries and impact adoption."
]

# ✅ Convert documents to vectors
doc_vectors = embedding_model.encode(documents)

# ✅ Initialize FAISS Vector Index
dimension = doc_vectors.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(doc_vectors, dtype=np.float32))  # Add document vectors to FAISS

def retrieve_relevant_document(user_query):
    """Finds the most relevant financial document using FAISS."""
    query_vector = embedding_model.encode([user_query])
    _, nearest_doc_index = index.search(np.array(query_vector, dtype=np.float32), 1)
    return documents[nearest_doc_index[0][0]]  # Return best-matching document

def get_ai_response(user_input):
    """Fetches a response from Mistral AI with relevant financial context."""
    try:
        relevant_doc = retrieve_relevant_document(user_input)

        response = client.chat.complete(
            model="mistral-large-latest",
            messages=[
                {"role": "system", "content": "You are a financial assistant. Always provide accurate, professional responses."},
                {"role": "system", "content": f"Relevant financial document: {relevant_doc}"},
                {"role": "user", "content": user_input}  # ✅ Ensure User Message is Last!
            ]
        )

        return response.choices[0].message.content  # ✅ Extract response correctly

    except Exception as e:
        print(f"Error fetching Mistral AI response: {e}")
        return "I'm having trouble processing your request."

# ✅ API Endpoint to Generate JWT Token (Frontend Calls This First)
@app.post("/token")
async def generate_token(username: str = Query(...)):
    """Generate a JWT token for a user"""
    token = create_jwt_token(username)
    return {"access_token": token, "token_type": "bearer"}

# ✅ Secure WebSocket Chatbot with JWT Authentication
@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    """Handles WebSocket messages securely with JWT authentication."""
    await websocket.accept()
    
    try:
        # ✅ Extract token from WebSocket Query Parameters
        token = websocket.query_params.get("token")

        if not token:
            await websocket.send_text("Error: Authentication token required.")
            await websocket.close()
            return
        
        # ✅ Validate JWT Token
        try:
            verify_jwt_token(token)
        except HTTPException as e:
            await websocket.send_text(f"Error: {e.detail}")
            await websocket.close()
            return
        
        while True:
            query = await websocket.receive_text()
            response = get_ai_response(query)
            await websocket.send_text(response)

    except WebSocketDisconnect:
        print("WebSocket connection closed by client")

# ✅ Run FastAPI Server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
