import { createClient } from "redis";
import {RedisStore} from "connect-redis";
import dotenv from 'dotenv'

dotenv.config()
const redisClient = createClient({url:'redis://localhost:6379'});
await redisClient.connect();

const sessionScheme = {
  store: new RedisStore({ client: redisClient }),  
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}

const initSession = (req, res, next) => {
  if (!req.session.initialized) {
    req.session.userMessage = [];
    req.session.agentMessage = [];
    req.session.originalCode = [];
    req.session.translation = [];
    req.session.initialized = true;
    req.session.save();
  }
  next();
};

export {sessionScheme, initSession}