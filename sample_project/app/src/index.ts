import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "Hello from the Outer Loop! 🚀",
    timestamp: new Date().toISOString(),
    engine: "OrbStack",
    orchestrator: "Tilt"
  });
});

app.listen(port, () => {
  console.log(`🚀 Sample app listening at http://localhost:${port}`);
});
