#!/bin/bash

echo "Testing MongoDB Paraphrase API"
echo "--------------------------"
echo

echo "1. Testing paraphrase endpoint..."
curl -X POST http://localhost:3000/api/paraphrase \
  -H "Content-Type: application/json" \
  -d '{"text": "In order to utilize this API effectively, it is necessary to implement proper error handling."}' \
  | json_pp
echo

echo "2. Getting all phrases from database..."
curl -X GET http://localhost:3000/api/phrases | json_pp
echo

echo "3. Adding a new phrase..."
curl -X POST http://localhost:3000/api/phrases \
  -H "Content-Type: application/json" \
  -d '{"original": "in a timely manner", "simplified": "promptly", "category": "verbose"}' \
  | json_pp
echo

echo "4. Testing paraphrase with the new phrase..."
curl -X POST http://localhost:3000/api/paraphrase \
  -H "Content-Type: application/json" \
  -d '{"text": "Please complete this task in a timely manner."}' \
  | json_pp
echo

echo "5. Deleting a phrase (replace ID with an actual ID from step 2)..."
# For this test, you'll need to copy an _id from the output of step 2
echo "curl -X DELETE http://localhost:3000/api/phrases/YOUR_PHRASE_ID_HERE"
# Uncomment and replace with a real ID:
# curl -X DELETE http://localhost:3000/api/phrases/6123456789abcdef01234567