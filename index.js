import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();

import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import serverConfig from './src/config/config.js';
import chalk from './src/utils/chalk.js';
import DatabaseConnection from './src/config/mongoWrapper.js';
import logger from './src/utils/logger.js';

// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

// import main from './src/router/main.route.js';
// import userRoute from './src/router/user.route.js';
import instituteRoute from './src/routes/institute.route.js';
import userRoute from './src/routes/user.route.js';
import studentRoute from './src/routes/student.route.js';
import teacherRoute from './src/routes/teacher.route.js';
import instituteClassRouter from './src/routes/instituteClass.route.js';
import academicSessionRoute from './src/routes/academicSession.route.js';
import { contextMiddleware } from './src/middleware/contextStore.js';
let dbConnection;
const app = express();
const server = createServer(app);

(async () => {
  try {
    // Initialize MongoDB connection
    dbConnection = new DatabaseConnection(serverConfig.MONGO_URL);
    await dbConnection.connect();
  } catch (error) {
    logger.error('Error during MongoDB operations:', error);
  }
})();

// const swaggerOptions = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Institute Backend Service Docs',
//       version: '1.0.0',
//     },
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//     },
//     security: [
//       {
//         BearerAuth: [],
//       },
//     ],
//   },
//   apis: ['./src/router/*.js'],
// };

// const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(compression());

// Apply JSON parser to all routes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.use(cookieParser());
app.use(contextMiddleware);

// database connection
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('*', (req, res, next) => {
  const { hostname, originalUrl, protocol, method } = req;
  logger.info(`${method === 'GET' ? chalk.getReq(method) : chalk.postReq(method)}  ${protocol}://${hostname}:${serverConfig.PORT}${originalUrl}`);
  next();
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.get('/docs.json', (req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send(swaggerSpec);
// });

// use routes here
// app.use('/', main);
app.use('/', instituteRoute);
app.use('/', userRoute);
app.use('/', studentRoute);
app.use('/', teacherRoute);
app.use('/', instituteClassRouter);
app.use('/', academicSessionRoute);

app.get('/', (req, res) => {
    res.send('Institute API is running');
});

server.listen(serverConfig.PORT, () => {
  logger.info(`index.js << Server listening on port ${serverConfig.PORT}`);
});
