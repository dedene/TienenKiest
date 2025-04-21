#!/bin/sh

# Forward SIGTERM to the Node.js process
trap 'kill -TERM $NODE_PID' TERM INT

# Start Node.js server
node server.js &
NODE_PID=$!

# Wait for Node.js to terminate
wait $NODE_PID
# Exit with the same code as Node.js
exit $?