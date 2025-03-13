import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatWindow from "../components/ChatWindow";
import { rest } from "msw";
import { setupServer } from "msw/node";

// ✅ Mock API Response for Token
const server = setupServer(
  rest.post("http://localhost:5000/token", (req, res, ctx) => {
    return res(ctx.json({ access_token: "mock_token", token_type: "bearer" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Mock WebSocket with Message Handling
class MockWebSocket {
  send = jest.fn();
  close = jest.fn();
  readyState = 1; // OPEN state
  onmessage = jest.fn();
  onopen = jest.fn();
  onclose = jest.fn();

  addEventListener(event: string, callback: (event?: any) => void) {
    if (event === "open") {
      setTimeout(() => callback({ type: "open" }), 100);
    }
    if (event === "message") {
      this.onmessage = callback;
    }
  }

  removeEventListener = jest.fn();
}

global.WebSocket = jest.fn(() => new MockWebSocket()) as any;

describe("ChatWindow Component", () => {
  test("renders chat window correctly", async () => {
    render(<ChatWindow />);
    expect(screen.getByText("💬 Financial Chatbot")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });

  test("allows user to type a message", async () => {
    render(<ChatWindow />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello Bot!" } });
    expect(input).toHaveValue("Hello Bot!");
  });

  test("sends message when send button is clicked", async () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Hello Bot!" } });
    fireEvent.click(sendButton);

    expect(input).toHaveValue(""); // ✅ Input should be cleared after sending
    expect(global.WebSocket).toHaveBeenCalled(); // ✅ Ensure WebSocket was used
  });

  test("disables input if WebSocket is not connected", async () => {
    global.WebSocket = jest.fn(() => ({
      readyState: 3, // CLOSED state
      send: jest.fn(),
      close: jest.fn(),
    })) as any;

    render(<ChatWindow />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
    });
  });

  test("receives messages from WebSocket", async () => {
    render(<ChatWindow />);

    // ✅ Simulate WebSocket receiving a message
    await waitFor(() => {
      const mockWs = new MockWebSocket();
      mockWs.onmessage({ data: "Hello from Bot!" });
      expect(screen.getByText("Bot: Hello from Bot!")).toBeInTheDocument();
    });
  });
});
