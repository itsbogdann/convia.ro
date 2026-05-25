import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

/**
 * FilesModule
 *
 * Thin wrapper around Supabase Storage for direct-from-browser uploads.
 * The signed-upload flow keeps file bytes off our API server entirely;
 * the browser PUTs to Supabase using a short-lived URL we generate.
 *
 *   POST /api/teams/:teamId/files/sign-upload   (developer+)
 */
@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
