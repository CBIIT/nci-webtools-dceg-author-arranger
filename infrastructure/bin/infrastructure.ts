#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudFrontS3Stack } from '../lib/cloudfront-s3-stack';
import { S3DataStack } from '../lib/s3-data-stack';

const TIER = process.env.TIER;
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;

// Exit if required environment variables are not defined
if (!TIER) {
  console.error("Error: TIER environment variable is not defined");
  process.exit(1);
}

if (!AWS_ACCOUNT_ID) {
  console.error("Error: AWS_ACCOUNT_ID environment variable is not defined");
  process.exit(1);
}

const app = new cdk.App();

const region = process.env.AWS_REGION || 'us-east-1';

// Create S3 data stack
new S3DataStack(app, `AuthorArrangerDataStack-${TIER}`, {
  env: { account: AWS_ACCOUNT_ID, region },
  stackName: `${TIER}-author-arranger-s3-data`,
  description: 'S3 data bucket for Author Arranger application',
});

// Create CloudFront and S3 website stack
new CloudFrontS3Stack(app, `AuthorArrangerStack-${TIER}`, {
  env: { account: AWS_ACCOUNT_ID, region },
  stackName: `${TIER}-author-arranger-website`,
  description: 'CloudFront and S3 infrastructure for Author Arranger Angular application',
});

app.synth();
