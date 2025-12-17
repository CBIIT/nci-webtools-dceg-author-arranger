import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { createTags } from "./utils/tags";

export interface CloudFrontS3StackProps extends cdk.StackProps {
  enableAuth?: boolean; // Enable Lambda@Edge authentication
  sessionsTable?: dynamodb.TableV2; // DynamoDB table for sessions
  apiDomainName?: string; // e.g., abcdef.execute-api.us-east-1.amazonaws.com or custom domain
  apiOriginPath?: string; // e.g., "/api" (stage name or base path)
}

export class CloudFrontS3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly edgeFunction?: lambda.Function;

  constructor(scope: Construct, id: string, props?: CloudFrontS3StackProps) {
    super(scope, id, props);

    const tier = process.env.TIER || "dev";
    const sslCertificateArn = process.env.SSL_CERTIFICATE_ARN;

    // Define custom domain and certificate if SSL certificate ARN is provided
    const domainName = `authorarranger-${tier}.nci.nih.gov`;
    let certificate: certificatemanager.ICertificate | undefined;

    if (sslCertificateArn) {
      certificate = certificatemanager.Certificate.fromCertificateArn(
        this,
        "SSLCertificate",
        sslCertificateArn
      );
    }

    // Create S3 bucket for hosting frontend files
    this.bucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: `author-arranger-website-${tier}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - change for production
      autoDeleteObjects: true, // For development - change for production
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Add tags to S3 bucket
    const s3Tags = createTags({ tier, resourceName: "s3" });
    Object.entries(s3Tags).forEach(([key, value]) => {
      cdk.Tags.of(this.bucket).add(key, value);
    });

    // Create Lambda@Edge function if auth is enabled
    const edgeFunctions: cloudfront.EdgeLambda[] = [];
    if (props?.enableAuth) {
      const secretName = `${tier}/authorarranger/oidc-config`;

      const cloudFrontAuthLogGroup = logs.LogGroup.fromLogGroupName(
        this,
        "CloudFrontAuthLogGroup",
        `/aws/lambda/${tier}-authorarranger-cloudfront-oidc-auth`
      );

      this.edgeFunction = new lambda.Function(this, "CloudFrontAuthFunction", {
        functionName: `${tier}-authorarranger-cloudfront-oidc-auth`,
        description: `OIDC authentication for CloudFront (${tier} environment)`,
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: "cloudfront_auth.lambda_handler",
        code: lambda.Code.fromAsset("../backend/lambda/oidc-auth", {
          bundling: {
            image: lambda.Runtime.PYTHON_3_11.bundlingImage,
            platform: "linux/amd64", // Force x86_64 for Lambda@Edge
            user: "root",
            command: [
              "bash",
              "-c",
              [
                "pip install -r requirements.txt -t /asset-output --platform manylinux2014_x86_64 --only-binary=:all:",
                "cp -r . /asset-output",
              ].join(" && "),
            ],
          },
        }),
        timeout: cdk.Duration.seconds(5),
        memorySize: 128,
        logGroup: cloudFrontAuthLogGroup,
      });

      this.edgeFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["secretsmanager:GetSecretValue"],
          resources: [
            `arn:aws:secretsmanager:us-east-1:${
              cdk.Stack.of(this).account
            }:secret:${secretName}-*`,
          ],
        })
      );

      if (props?.sessionsTable) {
        props.sessionsTable.grantReadWriteData(this.edgeFunction);
      }

      edgeFunctions.push({
        functionVersion: this.edgeFunction.currentVersion,
        eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
      });

      const lambdaTags = createTags({
        tier,
        resourceName: "cloudfront-oidc-auth",
      });
      Object.entries(lambdaTags).forEach(([key, value]) => {
        if (this.edgeFunction) {
          cdk.Tags.of(this.edgeFunction).add(key, value);
        }
      });

      new cdk.CfnOutput(this, "EdgeFunctionArn", {
        value: this.edgeFunction.currentVersion.edgeArn,
        description: "Lambda@Edge function ARN for CloudFront",
        exportName: undefined, // Do not export - prevents cross-stack dependency issues
      });
    }

    let apiOrigin: origins.HttpOrigin | undefined;
    let apiOriginRequestPolicy: cloudfront.OriginRequestPolicy | undefined;
    if (props?.apiDomainName) {
      apiOrigin = new origins.HttpOrigin(props.apiDomainName, {
        originPath: props.apiOriginPath || "",
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      });

      apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(
        this,
        "ApiOriginRequestPolicy",
        {
          originRequestPolicyName: `${tier}-api-origin-request-policy`,
          comment:
            "Policy for API Gateway origin - forwards cookies/query but not Host header",
          cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
          queryStringBehavior:
            cloudfront.OriginRequestQueryStringBehavior.all(),
          headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
        }
      );
    }


    // Create CloudFront distribution configuration
    const distributionConfig: cloudfront.DistributionProps = {
      comment: `CloudFront distribution for authorarranger-${tier}.nci.nih.gov`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        ...(edgeFunctions.length > 0 && { edgeLambdas: edgeFunctions }),
      },
      ...(apiOrigin &&
        apiOriginRequestPolicy && {
          additionalBehaviors: {
            "/api/*": {
              origin: apiOrigin,
              viewerProtocolPolicy:
                cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
              originRequestPolicy: apiOriginRequestPolicy,
            },
          },
        }),
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
      // Add custom domain and certificate if SSL certificate ARN is provided
      ...(certificate && {
        domainNames: [domainName],
        certificate: certificate,
      }),
    };

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(
      this,
      "FrontendDistribution",
      distributionConfig
    );

    // Add tags to CloudFront distribution
    const cloudfrontTags = createTags({ tier, resourceName: "cloudfront" });
    Object.entries(cloudfrontTags).forEach(([key, value]) => {
      cdk.Tags.of(this.distribution).add(key, value);
    });

    // Deploy Angular application files to S3
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("../docs")],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });

    // Stack outputs
    new cdk.CfnOutput(this, "WebsiteURL", {
      value: certificate 
        ? `https://${domainName}` 
        : `https://${this.distribution.distributionDomainName}`,
      description: "Website URL",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: this.distribution.distributionId,
      description: "CloudFront Distribution ID",
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "S3 Bucket Name",
    });
  }
}