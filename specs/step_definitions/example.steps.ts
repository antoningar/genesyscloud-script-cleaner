import { Given, When, Then } from '@cucumber/cucumber';
import { handler } from '../../src/handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { strict as assert } from 'assert';

let mockEvent: APIGatewayProxyEvent;
let mockContext: Context;
let response: any;

Given('a valid input event', function () {
  mockEvent = {
    httpMethod: 'GET',
    path: '/test',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      path: '/test',
      stage: 'dev',
      requestId: 'request-id',
      requestTime: '01/Jan/2023:12:00:00 +0000',
      requestTimeEpoch: 1672574400000,
      identity: {
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: '127.0.0.1',
        principalOrgId: null,
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'test-agent',
        user: null,
        apiKey: null,
        apiKeyId: null,
        clientCert: null
      },
      resourceId: 'resource-id',
      resourcePath: '/test',
      authorizer: null
    },
    resource: '/test',
    body: null,
    isBase64Encoded: false
  };

  mockContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'aws-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/[$LATEST]log-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };
});

When('the lambda function is invoked', async function () {
  response = await handler(mockEvent, mockContext);
});

Then('it should return a successful response', function () {
  assert.equal(response.statusCode, 200);
});

Then('the response should contain the expected message', function () {
  const body = JSON.parse(response.body);
  assert.equal(body.message, 'Function executed successfully');
  assert.ok(body.timestamp);
});