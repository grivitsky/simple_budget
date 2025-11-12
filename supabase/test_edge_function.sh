#!/bin/bash

# Test Edge Function: update-currency-rates
# Replace these with your actual values:
PROJECT_REF="your-project-ref"
SERVICE_ROLE_KEY="your-service-role-key"

# Make POST request to Edge Function
curl -X POST \
  "https://${PROJECT_REF}.supabase.co/functions/v1/update-currency-rates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -d '{}'

echo ""

