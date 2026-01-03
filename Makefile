.PHONY: setup start stop status frontend-start frontend-stop backend-run help

# Default target
help:
	@echo "Usage:"
	@echo "  make setup         Install all dependencies (frontend & backend)"
	@echo "  make start         Start the frontend server in the background"
	@echo "  make stop          Stop the frontend server"
	@echo "  make status        Check if the frontend is running"
	@echo "  make backend-demo  Run the Python MCP host demo"

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
	@if [ -f frontend.pid ]; then \
		echo "Stopping frontend (PID: $$(cat frontend.pid))..."; \
		kill $$(cat frontend.pid) && rm frontend.pid; \
		echo "Stopped."; \
	else \
		echo "Frontend is not running (no frontend.pid found)."; \
	fi

status:
	@if [ -f frontend.pid ]; then \
		echo "Frontend is running (PID: $$(cat frontend.pid))"; \
		ps -p $$(cat frontend.pid) > /dev/null || (echo "Wait, process died?" && rm frontend.pid); \
	else \
		echo "Frontend is not running."; \
	fi

backend-demo:
	@echo "Running Better-Auth MCP Host Client Demo..."
	cd backend && . venv/bin/activate && python agent.py
