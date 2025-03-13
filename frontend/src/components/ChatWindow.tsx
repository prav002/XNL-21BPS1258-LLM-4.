import { useState, useEffect } from "react";
import { Box, TextField, IconButton, Typography, Paper, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { motion } from "framer-motion"; // ✅ Import animation library

const ChatWindow = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // ✅ Typing Indicator

  useEffect(() => {
    fetch("http://localhost:5000/token?username=testuser", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          setToken(data.access_token);
          connectWebSocket(data.access_token);
        } else {
          console.error("❌ Failed to fetch token");
        }
      })
      .catch((error) => console.error("❌ Error fetching token:", error));

    return () => socket?.close();
  }, []);

  const connectWebSocket = (token: string) => {
    if (socket) {
      socket.close();
    }

    const ws = new WebSocket(`ws://localhost:5000/chat?token=${token}`);

    ws.onopen = () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: event.data, sender: "bot" }]);
        setIsTyping(false);
      }, 1200); // ✅ Simulated typing delay
    };

    ws.onclose = () => {
      console.log("🔄 WebSocket Closed. Reconnecting...");
      setIsConnected(false);
      setTimeout(() => connectWebSocket(token), 2000);
    };

    setSocket(ws);
  };

  const sendMessage = () => {
    if (input.trim() !== "" && socket?.readyState === WebSocket.OPEN) {
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      socket.send(input);
      setInput("");
    }
  };

  return (
    <Box
      sx={{
        width: "420px",
        height: "550px",
        borderRadius: "16px",
        backdropFilter: "blur(10px)", // ✅ Glassmorphism effect
        background: "rgba(255, 255, 255, 0.15)",
        boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0078D7, #005bb5)",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#fff",
        }}
      >
        <ChatBubbleOutlineIcon />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Financial Chatbot
        </Typography>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, padding: 2, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: "12px",
                marginBottom: "8px",
                maxWidth: "75%",
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user" ? "#DCF8C6" : "#ECECEC",
                borderRadius: "14px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: msg.sender === "user" ? "#0B6E4F" : "#333",
                }}
              >
                {msg.sender === "user" ? "You" : "Bot"}:
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>{msg.text}</Typography>
            </Paper>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "8px" }}>
            <CircularProgress size={18} sx={{ color: "#0078D7" }} />
            <Typography sx={{ fontSize: "14px", color: "#555" }}>Bot is typing...</Typography>
          </Box>
        )}
      </Box>

      {/* Input & Send Button */}
      <Box sx={{ display: "flex", padding: "12px", background: "#fff", gap: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              background: "#fff",
              border: "1px solid #ddd",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!isConnected}
          sx={{
            background: "#0078D7",
            color: "#fff",
            "&:hover": { background: "#005bb5" },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow;
