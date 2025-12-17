#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudFrontS3Stack } from '../lib/cloudfront-s3-stack';

const app = new cdk.App();

new CloudFrontS3Stack(app, 'AuthorArrangerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'CloudFront and S3 infrastructure for Author Arranger Angular application',
});

app.synth();
