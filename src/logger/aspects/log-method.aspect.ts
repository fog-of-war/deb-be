// // log-method.aspect.ts
// import { createAspect, createMethodDecorator } from 'aspect.js';
// import { LoggerService } from '../logger.service';

// const LogMethodAspect = createAspect({
//   before(metadata) {
//     const logger = new LoggerService();
//     logger.logWithMethodName(metadata.target.name, 'Method executed');
//   }
// });

// export const LogMethod = createMethodDecorator(LogMethodAspect);
