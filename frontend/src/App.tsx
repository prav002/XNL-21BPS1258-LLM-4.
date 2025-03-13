import React from "react";
import ChatWindow from "./components/ChatWindow";
import { Container } from "@mui/material";

function App() {
  return (
    <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <ChatWindow />
    </Container>
  );
}

export default App;
