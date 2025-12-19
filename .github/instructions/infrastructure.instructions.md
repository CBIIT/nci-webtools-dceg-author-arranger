# Author Arranger Infrastructure Deployment Instructions

## Overview

This project uses AWS CDK (Cloud Development Kit) with TypeScript to deploy the Author Arranger Angular application to AWS using CloudFront and S3.

## Prerequisites

- Node.js 18+ (for CDK)
- Node.js 16 (for Angular build)
- AWS CLI configured with appropriate credentials
- AWS Account with necessary permissions

## Infrastructure Components

### Stacks

1. **AuthorArrangerStack** (`{TIER}-author-arranger-website`)
   - S3 bucket: `author-arranger-website-{tier}`
   - CloudFront distribution
   - Origin Access Identity for secure S3 access
   - Automatic deployment from `docs/` directory
   - Domain: `authorarranger-{tier}.nci.nih.gov`

### Environment Variables

Required for all deployments:

```bash
export TIER=dev|qa|prod
export AWS_ACCOUNT_ID=your-aws-account-id
```

Optional:

```bash
export AWS_REGION=us-east-1  # defaults to CDK_DEFAULT_REGION
export SSL_CERTIFICATE_ARN=arn:aws:acm:...  # for custom domain
```

## GitHub Actions Workflows

### 1. Deploy Infrastructure (`deploy-infrastructure.yml`)

**Purpose**: Full stack deployment including CDK infrastructure and Angular application

**Triggers**: 
- Manual via workflow_dispatch
- On push to main/develop branches

**Workflow Steps**:
1. Bootstrap CDK (first time only)
2. Deploy data stack
3. Build Angular application (Node 16)
4. Deploy website stack (includes app deployment)
5. Invalidate CloudFront cache

**Required GitHub Secrets**:
- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SSL_CERTIFICATE_ARN` (optional)

**Usage**:
1. Go to GitHub Actions tab
2. Select "Deploy Infrastructure"
3. Click "Run workflow"
4. Choose environment (dev, qa, prod)
5. Click "Run workflow"

### 2. Deploy Frontend (`deploy-frontend.yml`)

**Purpose**: Fast frontend-only deployments when infrastructure unchanged

**Triggers**:
- Manual via workflow_dispatch

**Workflow Steps**:
1. Build Angular application (Node 16)
2. Sync to S3 with appropriate cache headers
3. Invalidate CloudFront cache
4. Wait for invalidation to complete

**When to Use**:
- Code changes only (HTML, TypeScript, CSS)
- No infrastructure changes needed
- Faster than full deployment (~5 min vs ~15 min)

## Local Development

### Setup

```bash
# Install dependencies
cd infrastructure
npm install

# Build CDK project
npm run build
```

### CDK Commands

```bash
# Set environment variables
export TIER=dev
export AWS_ACCOUNT_ID=123456789012

# Synthesize CloudFormation templates
npm run cdk synth

# View differences
npm run cdk diff

# Deploy all stacks
npm run deploy

# Deploy specific stack
npm run cdk deploy dev-author-arranger-s3-data
npm run cdk deploy dev-author-arranger-website

# Destroy stacks
npm run cdk destroy dev-author-arranger-website
npm run cdk destroy dev-author-arranger-s3-data
```

### Build Angular App

```bash
# From project root
export NODE_OPTIONS=--openssl-legacy-provider
npm install
npm run build
# Output: docs/ directory
```

## First Time Deployment

### 1. Configure GitHub Secrets

In your GitHub repository, go to Settings → Secrets and variables → Actions:

1. Add `AWS_ACCOUNT_ID` - Your AWS account ID (12 digits)
2. Add `AWS_ACCESS_KEY_ID` - AWS access key with deployment permissions
3. Add `AWS_SECRET_ACCESS_KEY` - AWS secret access key
4. Add `SSL_CERTIFICATE_ARN` (optional) - ACM certificate ARN for custom domain

### 2. Bootstrap CDK (First Time Only)

The first deployment will automatically bootstrap CDK in your AWS account/region. This creates:
- CDK staging bucket
- IAM roles for CloudFormation
- ECR repository for Docker images (if needed)

### 3. Run First Deployment

1. Go to GitHub Actions tab
2. Select "Deploy Infrastructure" workflow
3. Click "Run workflow"
4. Select environment: `dev`
5. Click "Run workflow"

This will:
- Bootstrap CDK (if needed)
- Build Angular application
- Create website S3 bucket
- Create CloudFront distribution
- Deploy application
- Output CloudFront URL

### 4. Configure DNS

After successful deployment:

1. Get CloudFront distribution domain from AWS Console or workflow output
2. Create CNAME record in your DNS:
   - Name: `authorarranger-dev` (or appropriate tier)
   - Type: CNAME
   - Value: `d1234567890abc.cloudfront.net` (your CloudFront domain)
   - TTL: 300

## Deployment Environments

- **dev**: Development environment (`authorarranger-dev.nci.nih.gov`)
- **qa**: Quality assurance environment (`authorarranger-qa.nci.nih.gov`)
- **prod**: Production environment (`authorarranger-prod.nci.nih.gov`)

Each environment has separate:
- AWS CloudFormation stacks
- S3 buckets
- CloudFront distributions
- Domain names

## Monitoring and Troubleshooting

### Check Stack Status

```bash
aws cloudformation describe-stacks --stack-name dev-author-arranger-website
```

### View CloudFront Distribution

```bash
aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].Id, 'author-arranger')]"
```

### Check S3 Bucket

```bash
aws s3 ls s3://author-arranger-website-dev/
```

### View Deployment Logs

Go to GitHub Actions → Select workflow run → View job logs

### Common Issues

1. **"Stack already exists"**: Stack is already deployed, use frontend workflow for updates
2. **"Bucket already exists"**: Bucket names must be unique, check TIER is correct
3. **"Access Denied"**: Check AWS credentials and IAM permissions
4. **"CloudFront invalidation failed"**: Check distribution exists and is deployed

## Migration from Jenkins/Ansible

The GitHub Actions workflows replace the previous Jenkins/Ansible deployment:

| Ansible Task | GitHub Actions |
|--------------|----------------|
| Backup app | S3 versioning (automatic) |
| Git checkout | `actions/checkout@v4` |
| Copy docs/ to server | S3 deployment via CDK |
| Apache permissions | S3 bucket policies |

Benefits:
- No server maintenance required
- Global CDN via CloudFront
- Automatic SSL/TLS
- Versioned deployments
- Easy rollback capabilities

## Rollback

If deployment fails or issues occur:

### Frontend Rollback (S3 versioning)

```bash
# List versions
aws s3api list-object-versions --bucket author-arranger-website-dev

# Restore specific version
aws s3api copy-object \
  --copy-source author-arranger-website-dev/index.html?versionId=PREVIOUS_VERSION \
  --bucket author-arranger-website-dev \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Infrastructure Rollback (CloudFormation)

```bash
# Rollback to previous stack state
aws cloudformation rollback-stack --stack-name dev-author-arranger-website
```

## Security Notes

- All S3 buckets are private (not public)
- CloudFront uses Origin Access Identity for secure S3 access
- Data bucket has encryption at rest (S3-managed)
- SSL/TLS in transit via CloudFront
- Versioning enabled for data bucket
- Stack resources tagged for compliance

## Support

For issues or questions:
1. Check GitHub Actions workflow logs
2. Review AWS CloudFormation events in AWS Console
3. Check CloudWatch Logs if Lambda@Edge is configured
4. Contact DevOps team
