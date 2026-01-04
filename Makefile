.PHONY: setup start stop status frontend-start frontend-stop backend-run backend-start backend-stop clean help

# Default target
help:
	@echo "Usage:"
	@echo "  make setup         Install all dependencies (frontend & backend)"
	@echo "  make start         Start the frontend server in the background"
	@echo "  make stop          Stop the frontend server (and any orphaned processes)"
	@echo "  make status        Check if the frontend is running"
	@echo "  make backend-demo  Run the Python MCP host demo"
	@echo "  make backend-start Start local MCP servers in background"
	@echo "  make backend-stop  Stop local MCP servers"

setup:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Setting up backend virtual environment and dependencies..."
	cd backend && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
	@echo "Initializing database..."
	cd frontend && npx prisma db push && node prisma/seed.js
	@echo "Setup complete!"

start:
	@echo "Starting Next.js frontend at http://localhost:3000..."
	@cd frontend && npm run dev > ../frontend.log 2>&1 & echo $$! > frontend.pid
	@echo "Frontend started (PID: $$(cat frontend.pid))"
	@echo "Logs available at: frontend.log"

stop:
	@echo "Stopping frontend processes on port 3000..."
	@lsof -t -i :3000 | xargs kill -9 2>/dev/null || true
	@if [ -f frontend.pid ]; then \
		echo "Cleaning up frontend.pid..."; \
		rm frontend.pid; \
	fi
	@echo "Frontend stopped."

status:
	@@lsof -i :3000 > /dev/null && echo "Frontend is running on port 3000." || echo "Frontend is not running."

backend-demo:
	@echo "Running Better-Auth MCP Host Client Demo..."
	cd backend && . venv/bin/activate && python agent.py

backend-start:
	@echo "Starting local MCP servers in background..."
	@cd backend && . venv/bin/activate && nohup python mcp_server/server.py > mcp_server.log 2>&1 & echo $$! > mcp_server.pid
	@cd backend && . venv/bin/activate && nohup python mcp_server/expert.py > mcp_expert.log 2>&1 & echo $$! > mcp_expert.pid
	@echo "Local MCP servers started."

backend-stop:
	@echo "Stopping local MCP servers..."
	@if [ -f backend/mcp_server.pid ]; then kill $$(cat backend/mcp_server.pid) && rm backend/mcp_server.pid; fi
	@if [ -f backend/mcp_expert.pid ]; then kill $$(cat backend/mcp_expert.pid) && rm backend/mcp_expert.pid; fi
	@echo "Local MCP servers stopped."

start-all: start backend-start
	@echo "All services started."

stop-all: stop backend-stop
	@echo "All services stopped."

clean: stop-all
	@echo "Cleaning up log files..."
	rm -f frontend.log backend/*.log
