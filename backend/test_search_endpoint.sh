#!/bin/bash

# Exit on error
set -e

# Define a cleanup function to kill the server
cleanup() {
  echo "Cleaning up..."
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true # Added 2>/dev/null to suppress "No such process" if already killed
  fi
  # Remove the test database file
  rm -f ./data/db/ministers.json
  echo "Cleanup complete."
}

# Trap EXIT signal to run cleanup function
trap cleanup EXIT

# Ensure the data directory exists and ministers.json is empty
mkdir -p ./data/db
echo "[]" > ./data/db/ministers.json
echo "Test ministers.json initialized."

# Start the backend server in the background
echo "Starting backend server..."
node index.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for the server to start
sleep 3
echo "Server should be up."

# Function to make requests and check status
assert_status() {
  local url=$1
  local expected_status=$2
  local method=${3:-POST} # Default to POST if not specified
  local data_payload=${4:-} # Optional data payload for POST

  echo -n "Testing $method $url... "
  
  local response_file=$(mktemp)
  local status_code
  
  if [ "$method" == "POST" ]; then
    if [ -n "$data_payload" ]; then
      status_code=$(curl -s -o "$response_file" -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data_payload" "$url")
    else
      status_code=$(curl -s -o "$response_file" -w "%{http_code}" -X POST "$url")
    fi
  else # GET
    status_code=$(curl -s -o "$response_file" -w "%{http_code}" -X GET "$url")
  fi

  if [ "$status_code" -eq "$expected_status" ]; then
    echo "OK (Status: $status_code)"
  else
    echo "FAIL (Status: $status_code, Expected: $expected_status)"
    echo "Response:"
    cat "$response_file"
    exit 1
  fi
  # Return response file path for further checks if needed
  echo "$response_file"
}

assert_response_contains() {
  local response_file=$1
  local expected_text=$2
  echo -n "Checking response for \"$expected_text\"... "
  if grep -q "$expected_text" "$response_file"; then
    echo "OK"
  else
    echo "FAIL"
    echo "Response content:"
    cat "$response_file"
    exit 1
  fi
}

assert_response_count() {
  local response_file=$1
  local expected_count=$2
  echo -n "Checking response for $expected_count items... "
  # Assuming items are JSON objects in an array: count occurrences of "id":
  local actual_count=$(grep -o '"id":' "$response_file" | wc -l)
  if [ "$actual_count" -eq "$expected_count" ]; then
    echo "OK"
  else
    echo "FAIL (Found $actual_count, Expected $expected_count)"
    echo "Response content:"
    cat "$response_file"
    exit 1
  fi
}


# --- Test Cases ---

# Add Ministers
echo "Adding initial ministers..."
assert_status "http://localhost:3001/api/add_minister" 201 "POST" '{"name": "Alice Wonderland", "info": "Curious individual"}'
assert_status "http://localhost:3001/api/add_minister" 201 "POST" '{"name": "Bob The Builder", "info": "Can he fix it?"}'
assert_status "http://localhost:3001/api/add_minister" 201 "POST" '{"name": "Charlie Chaplin", "info": "Silent film actor"}'
assert_status "http://localhost:3001/api/add_minister" 201 "POST" '{"name": "Diana Prince", "info": "Wonder Woman"}'
assert_status "http://localhost:3001/api/add_minister" 201 "POST" '{"name": "Test Minister", "info": "Test Info for testing"}'
echo "Initial ministers added."

# Test: Search by name (exact match, should be partial)
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=Alice%20Wonderland" 200)
assert_response_contains "$res_file" "Alice Wonderland"
assert_response_count "$res_file" 1

# Test: Search by partial name (case insensitive)
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=bob" 200)
assert_response_contains "$res_file" "Bob The Builder"
assert_response_count "$res_file" 1

# Test: Search by info
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=Silent%20film" 200)
assert_response_contains "$res_file" "Charlie Chaplin"
assert_response_count "$res_file" 1

# Test: Search term matches multiple ministers (name and info)
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=Test" 200)
assert_response_contains "$res_file" "Test Minister"
assert_response_contains "$res_file" "Test Info for testing" # This check assumes the minister object is returned with both
assert_response_count "$res_file" 1 # Only one minister named "Test Minister"

# Test: Search term matches multiple ministers (name)
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=Wonder" 200)
assert_response_contains "$res_file" "Alice Wonderland" # "Wonderland"
assert_response_contains "$res_file" "Diana Prince"   # "Wonder Woman"
assert_response_count "$res_file" 2

# Test: Search with a term that has no matches
assert_status "http://localhost:3001/api/search_minister?q=NonExistentName" 404

# Test: Search with an empty query string for q
assert_status "http://localhost:3001/api/search_minister?q=" 400

# Test: Search without the q query parameter
assert_status "http://localhost:3001/api/search_minister" 400

# Test: Search with special characters (e.g., space already tested, let's try something else if relevant)
# The current backend implementation uses toLowerCase().includes(), so most special chars are treated literally.
# If specific escaping or handling was added, more tests would be needed.
# For now, a simple check:
res_file=$(assert_status "http://localhost:3001/api/search_minister?q=fix%20it%3F" 200) # "fix it?"
assert_response_contains "$res_file" "Bob The Builder"
assert_response_count "$res_file" 1

echo "All backend tests passed!"
# Cleanup will be called automatically on exit
exit 0
