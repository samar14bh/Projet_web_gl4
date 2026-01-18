import { Module, Global } from '@nestjs/common';
import { SseService } from './sse.service';

/**
 * Module SSE (Server-Sent Events)
 * @Global() permet d'utiliser SseService partout sans importer le module
 */
@Global()
@Module({
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}