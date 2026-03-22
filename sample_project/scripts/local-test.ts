import express, { Request, Response } from 'express';
import { handler } from '../lambda/handler';

const app = express();
const port = 3000;

app.get('/', async (req: Request, res: Response) => {
  console.log('--- Simulating Lambda Invocation ---');
  
  // Mocking the API Gateway Proxy Event (v2)
  const event: any = {
    version: '2.0',
    routeKey: '$default',
    rawPath: '/',
    headers: req.headers,
    requestContext: {
      http: {
        method: req.method,
        path: '/',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: req.get('user-agent'),
      },
    },
  };

  try {
    const result: any = await handler(event, {} as any, () => {});
    
    // Set headers from Lambda response
    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }

    res.status(result.statusCode || 200).send(result.body);
  } catch (error) {
    console.error('Lambda Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Lambda Local Test Server running at http://localhost:${port}`);
  console.log(`Open this URL in your browser to view your blog redirect page.\n`);
});
