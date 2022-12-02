import express from 'express';
import cors from 'cors';
import json_stringify_safe from 'json-stringify-safe';
import theResult from './index';

const PORT = process.env.PORT || 5000;

function convertToString(value: unknown, shouldAddSpaceToJson = true): string {
  const isError = (obj: unknown) => {
    return Object.prototype.toString.call(obj) === '[object Error]';
    // return obj && obj.stack && obj.message && typeof obj.stack === 'string'
    //        && typeof obj.message === 'string';
  };

  try {
    switch (typeof value) {
      case 'string':
      case 'boolean':
      case 'number':
      default:
        return '' + value;

      case 'undefined':
        return '';

      case 'object':
        if (value == null) {
          return '';
        } else if (isError(value)) {
          const error1: Error = value as Error;
          return error1.stack || error1.message;
        } else {
          if (shouldAddSpaceToJson) {
            return json_stringify_safe(value, null, 2);
          } else {
            return json_stringify_safe(value);
          }
        }
    }
  } catch (e) {
    return '' + value;
  }
}

function consoleLog(logMsg: unknown): void {
  const parsedMsg = convertToString(logMsg).trim();
  // eslint-disable-next-line no-console
  console.log(parsedMsg);
}

function consoleError(errMsg: unknown): void {
  const parsedMsg = convertToString(errMsg).trim();
  // eslint-disable-next-line no-console
  console.error(parsedMsg);
}

process.on('unhandledRejection', (reason, promise) => {
  consoleError(`ERROR: Promise: ${promise}\nReason: ${convertToString(reason)}`);
});

process.on('uncaughtException', err => {
  consoleError('---------\nUncaught Exception at: ' + err.stack + '\n---------');
});

consoleLog('WEB SERVER - STARTED!');

const app = express()
  // Middleware
  .use(cors())
  .use(express.json())
  .use(
    express.urlencoded({
      extended: true,
    })
  )

  // API routes
  .get('/', (req, res, next) => {
    return res.json({
      result: theResult(),
    });
  })

  // Wildcard
  .all('*', (req: express.Request, res: express.Response) => {
    consoleError(`Express - Wildcard was caught! ${req.path}`);
    return res.sendStatus(404);
  });

app.listen(PORT, () => consoleLog(`Express - Listening on ${PORT}\nhttp://localhost:${PORT}`));
