import { APIGatewayProxyResult } from 'aws-lambda';
import { ScriptService } from './business/script-service';

interface Context {
  clientContext: ClientContext
};

interface ClientContext {
  gc_client_id: string
  gc_client_secret: string
  gc_aws_region: string
};

interface Event {
  script_id: string
}

function validateOAuthCredentials(context: Context): boolean {
  if (!context?.clientContext) {
    return false;
  }

  const { gc_client_id, gc_client_secret, gc_aws_region } = context.clientContext;

  return !!(gc_client_id && gc_client_id.trim() !== '' &&
           gc_client_secret && gc_client_secret.trim() !== '' &&
           gc_aws_region && gc_aws_region.trim() !== '');
}

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));

    if (!event?.script_id || event.script_id.trim() === '') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Bad Request: Missing script_id',
          error: 'script_id is required in the event payload',
        }),
      };
    }

    if (!validateOAuthCredentials(context)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Unauthorized: Invalid or missing OAuth credentials',
          error: 'Missing required OAuth parameters: gc_client_id, gc_client_secret, gc_aws_region',
        }),
      };
    }

    const exampleService = new ScriptService();
    const result = await exampleService.process(event.script_id, undefined, context.clientContext);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        result
      ),
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

// CLI runner
if (require.main === module) {
  const fakeEvent: Event = {
    script_id: ""
  };

  const fakeContext: Context = {
    clientContext: {
      gc_client_id: '',
      gc_client_secret: '',
      gc_aws_region: 'eu_west_1'
    }
  };

  handler(fakeEvent, fakeContext)
    .then(result => {
      console.log('Result:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}