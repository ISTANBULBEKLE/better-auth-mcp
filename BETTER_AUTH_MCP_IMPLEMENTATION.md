# Better-Auth MCP Implementation Guide

## 🎯 Project Aim
The core objective of this repository is to demonstrate the **Model Context Protocol (MCP)** as a standard for connecting AI agents to real-world applications and ecosystems. 

It specifically showcases:
1. **Local Data Interoperability**: Bridging a SQLite/Prisma database to a Python agent.
2. **Framework Education**: Providing expert knowledge via specialized MCP servers.
3. **Transport Diversity**: Demonstrating both **STDIO** (local process) and **SSE** (Server-Sent Events) communication patterns.

---

## 🛠️ System Architecture

### 1. The Business Logic (The "Application")
- **Frontend**: A Next.js 15 application using the App Router.
- **Authentication**: Powered by `better-auth`, managing user sessions and secure routes.
- **Database**: SQLite managed via **Prisma ORM**.
- **Domain**: A "Song Library" application where users can manage a collection of tracks.

### 2. The MCP Layer (The "Bridge")
We implement MCP in three distinct flavors:

#### A. The Project Server (`backend/mcp_server/server.py`)
- **Transport**: STDIO
- **Purpose**: Exposes the application's internal database to any MCP-capable agent.
- **Tools**: `list_songs`, `add_song`.
- **Logic**: Directly queries the `dev.db` shared with the frontend.

#### B. The Expert Server (`backend/mcp_server/expert.py`)
- **Transport**: STDIO
- **Purpose**: Simulates a framework's "Documentation Agent."
- **Tools**: `explain_plugin`, `get_setup_tips`.

#### C. The Visual Explorer (`frontend/app/mcp-explorer`)
- **Transport**: SSE (Server-Sent Events) over HTTP.
- **Purpose**: A browser-based debugger that visualizes the handshake.
- **Innovation**: Uses a Next.js **CORS Proxy** (`/api/mcp-proxy`) to allow web-based agents to communicate with restricted remote servers.

---

## 🚀 Showcase Walkthrough

### 1. Terminal Showcase (Efficiency)
This demo shows how a backend script can instantly inherit the capabilities of two different servers.
- **Demo 1**: The agent connects to `server.py`, lists the songs from the database, and proves it has "Context" of the app.
- **Demo 2**: The agent connects to `expert.py` to answer technical questions about `better-auth`.

### 2. Visual Showcase (Education)
This is for the team presentation. It reveals the "Magic" behind the protocol.
- **Handshake Step 1**: `initialize`. Negotiates versions.
- **Handshake Step 1.5**: `initialized`. Confirms the client is ready (Crucial for spec compliance).
- **Handshake Step 2**: `list_tools`. Server streams back its capabilities.
- **Result**: Visual cards representing the server's API appear on screen.

---

## 📋 Technical Implementation Details

### MCP Specifications Followed
- **JSON-RPC 2.0**: All communication follows the standard request/response/notification format.
- **SSE Stream Processing**: The frontend implements a custom buffer to handle split chunks in chunked encoding transfers.
- **STDIO Lifecycle**: The Python `ClientSession` manages the lifecycle of sub-processes for local servers.

### Handling Cross-Origin (CORS)
Browsers block direct requests to remote MCP servers (like `chonkie.ai`). This repo implements a **Server-Side Proxy** in Next.js to bypass these restrictions, allowing the `fetch` API to behave like a native MCP client.

---

## 👨‍💻 Running Locally
Ensure you have run `make setup` and `make start` first.

1. **Test the Agentic Bridge**:
   ```bash
   cd backend && source venv/bin/activate && python agent.py
   ```
2. **Explore the Protocol**:
   Visit `http://localhost:3000/mcp-explorer` in your browser.

---
*Created for the Better-Auth MCP Showcase Demo.*
