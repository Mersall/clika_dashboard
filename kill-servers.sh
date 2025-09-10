#!/bin/bash

echo "Killing all Clika Dashboard local servers..."

# Kill any Vite processes
pkill -f "vite"

# Kill any npm run dev processes
pkill -f "npm run dev"

# Kill any node processes in this project directory
pkill -f "node.*clika-dashboard-repo"

# Kill processes on common development ports
for port in 3000 3001 3002 3003 3004 3005 5173 5174 8000 8080; do
    pid=$(lsof -ti TCP:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
done

echo "All servers killed successfully!"

# Optional: Show any remaining node/npm processes
echo -e "\nRemaining node/npm processes (if any):"
ps aux | grep -E "node|npm" | grep -v grep | grep -v "mcp-server" | grep -v "/System/"