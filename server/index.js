// Dependencies
import express from 'express';
import consign from 'consign';

const app = express();
const api = express.Router();

consign()
  .include('./libs/middlewares.js')
  .then('routes')
  .include('./libs/boots.js')
  .into(app, api);



