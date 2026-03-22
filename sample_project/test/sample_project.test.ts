import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as SampleProject from '../lib/sample_project-stack';

test('Lambda Function & Function URL Created with Node 24', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SampleProject.SampleProjectStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    // 1. Check if the Lambda function exists and has the correct runtime
    template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs24.x',
        Handler: 'index.handler'
    });

    // 2. Check if a public Function URL is configured
    template.hasResourceProperties('AWS::Lambda::Url', {
        AuthType: 'NONE'
    });

    // 3. Verify we have the Function URL in outputs
    template.hasOutput('FunctionUrl', {});
});
