import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

const app = new cdk.App();
const stack = new cdk.Stack(app, 'ArticleSummarizerStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
    }
})

// lambda function for summarization
const summarizeFn = new lambda.Function(stack, 'SummarizeFunction', {
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda'),
    environment: {
        MISTRAL_API_KEY: process.env.MISTRAL_API_KEY!,
        PROMPT: process.env.PROMPT! || 'Summarize the following text concisely:'
    },
    timeout: cdk.Duration.seconds(30),
    memorySize: 1024
});

// API gateway
const api = new apigateway.RestApi(stack, 'SummarizerApi', {
    restApiName: 'Article Summarizer API',
    defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
    }
});

const summarize = api.root.addResource('summarize');
summarize.addMethod('POST', new apigateway.LambdaIntegration(summarizeFn));

new cdk.CfnOutput(stack, 'ApiEndpoint', {
    value: api.url,
    description: 'API Gateway endpoint URL'
});

app.synth();