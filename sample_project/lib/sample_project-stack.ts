import { Stack, StackProps, CfnOutput, aws_lambda as lambda, aws_lambda_nodejs as lambda_nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class SampleProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Define the Lambda function that returns our HTML response
     */
    const handler = new lambda_nodejs.NodejsFunction(this, 'BlogHandler', {
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_24_X,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      description: 'Lambda function returning a simple webpage with my blog URL'
    });

    /**
     * Add a public Function URL to access the Lambda via HTTP
     */
    const functionUrl = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Open access for the blog URL redirect
    });

    /**
     * Output the URL for easy access after deployment
     */
    new CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'The public URL to access your blog link page'
    });
  }
}
