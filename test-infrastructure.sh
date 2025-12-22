#!/bin/bash

echo "🧪 Testing Infrastructure Deployment Workflow"
echo "📋 Tier: dev"
echo ""
echo "Available AWS SSO profiles:"
echo "  1) NCIAWSDevReadAccess-410438873708"
echo "  2) NCIAWSDevReadAccess-201624419975"
read -p "Select profile (1 or 2): " PROFILE_CHOICE

if [ "$PROFILE_CHOICE" = "1" ]; then
  PROFILE="NCIAWSDevReadAccess-410438873708"
  ACCOUNT_ID="410438873708"
elif [ "$PROFILE_CHOICE" = "2" ]; then
  PROFILE="NCIAWSDevReadAccess-201624419975"
  ACCOUNT_ID="201624419975"
else
  echo "❌ Invalid profile choice"
  exit 1
fi

echo "Using profile: $PROFILE"
echo "Exporting AWS credentials..."

# Export AWS credentials from SSO profile
eval $(aws configure export-credentials --profile $PROFILE --format env)

if [ $? -ne 0 ]; then
  echo "❌ Failed to export AWS credentials"
  echo "💡 Run: aws sso login --profile $PROFILE"
  exit 1
fi

# Ensure AWS_REGION is set
export AWS_REGION="us-east-1"

echo "✅ AWS credentials exported successfully"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo ""

echo "🚀 Running infrastructure workflow locally..."

act workflow_dispatch \
  --container-architecture linux/amd64 \
  -W .github/workflows/deploy-infrastructure.local.yml \
  --input tier=dev \
  --secret-file .secrets \
  --env AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  --env AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  --env AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN" \
  --env AWS_REGION="$AWS_REGION" \
  --env AWS_PAGER="" \
  --env AWS_ACCOUNT_ID="$ACCOUNT_ID"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Infrastructure workflow test completed!"
else
  echo ""
  echo "❌ Infrastructure workflow test failed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
