# 🚀 Better-Auth MCP Integration Demo

Welcome to the **Better-Auth x Model Context Protocol (MCP)** showcase. This project demonstrates how to bridge a modern Next.js 15 application with AI agents using the MCP standard.

## 🏁 Quick Start

### 1. Setup & Installation
```bash
make setup
```

### 2. Start the Application
```bash
make start-all
```
- **Frontend**: [http://localhost:3000](http://localhost:3000) (Login: test@example.com / password)
- **Visual Explorer**: [http://localhost:3000/mcp-explorer](http://localhost:3000/mcp-explorer)

### 3. Stop the Application
```bash
make stop-all
```

---

## 🎬 The Three-Part Showcase

### Part 1: Local Project MCP (STDIO)
Demonstrates an AI agent reading from your actual application database.
```bash
make backend-demo
```
*Look for "DEMO 1" in the terminal output.*

### Part 2: Local Knowledge MCP (Expert Tool)
Demonstrates a dedicated documentation server providing framework wisdom.
*Look for "DEMO 2" in the terminal output.*

### Part 3: The Visual Finale (SSE in Browser)
For the most impact, open the **[Visual MCP Explorer](http://localhost:3000/mcp-explorer)**.
- Connect to any SSE MCP endpoint (default provided).
- Watch the **Protocol Handsake** happen live.
- Inspect **Server Capabilities** and **JSON-RPC** streams.

---

## 📚 Deep Dive
For a full breakdown of the architecture, business logic, and MCP specifications:
👉 **[BETTER_AUTH_MCP_IMPLEMENTATION.md](./BETTER_AUTH_MCP_IMPLEMENTATION.md)**

## 📁 Key Files
- `backend/agent.py`: The Python orchestrator (The "AI Agent").
- `backend/mcp_server/server.py`: The database MCP server (STDIO).
- `frontend/app/mcp-explorer/`: The visual handshake generator (SSE).
- `frontend/app/api/mcp-proxy/`: The CORS-bypass bridge.
