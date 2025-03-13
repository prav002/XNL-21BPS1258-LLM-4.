Backend Tests (tests/test_api.py)
The backend tests use pytest and FastAPI TestClient to validate:

✅ JWT Token Generation
✅ Authentication for WebSocket
✅ API Responses from FastAPI
✅ Vector Search (FAISS) Retrieval for LLM
📝 Test Cases in test_api.py
Test Case	                    Description
test_generate_token()      	  Tests if the API correctly generates a JWT token when given a username.
test_token_protection()	      Ensures WebSocket rejects connections without a valid authentication token.
test_valid_token_connection()	Checks if WebSocket accepts a connection when a valid token is provided.


Frontend Tests (tests/ChatWindow.test.tsx)
The frontend tests use Jest and React Testing Library to validate:

✅ UI Rendering of the Chatbot
✅ User Input Handling
✅ WebSocket Connection & Messaging
✅ API Mocking for Token Authentication
📝 Test Cases in ChatWindow.test.tsx

Test Case	                                    Description

renders chat window correctly  	              Ensures that UI elements like chatbot title and input field are present.
allows user to type a message 	              Checks if the input box correctly takes user input.
sends message when send button is clicked	    Ensures messages are sent and input field clears.
disables input if WebSocket is not connected	Simulates WebSocket disconnect and ensures input field is disabled.
receives messages from WebSocket	            Mocks WebSocket to check if incoming messages are displayed.
