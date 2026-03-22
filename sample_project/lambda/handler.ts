import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const blogUrl = 'https://iamjaekim.github.io';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Jae's Blog</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --bg: #0f172a;
                --text: #f8fafc;
            }
            body { 
                font-family: 'Outfit', sans-serif;
                background: radial-gradient(circle at top right, #1e293b, var(--bg));
                color: var(--text);
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
                overflow: hidden;
            }
            .container {
                padding: 3rem;
                background: rgba(30, 41, 59, 0.4);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 32px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                max-width: 480px;
                animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            h1 { font-weight: 600; margin-top: 0; margin-bottom: 1rem; font-size: 2.5rem; letter-spacing: -0.025em; }
            p { font-weight: 300; font-size: 1.125rem; opacity: 0.8; margin-bottom: 2.5rem; line-height: 1.6; }
            .btn {
                display: inline-block;
                background: linear-gradient(135deg, var(--primary), #818cf8);
                color: white;
                text-decoration: none;
                padding: 1rem 2.5rem;
                border-radius: 16px;
                font-weight: 600;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3);
            }
            .btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome! 👋</h1>
            <p>This page is powered by AWS Lambda. <br> To see what I'm truly working on, visit my blog below!</p>
            <a href="${blogUrl}" class="btn">Take me to the blog</a>
        </div>
    </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: htmlBody,
  };
};
