import {
    Controller,
    Get,
    Post,
    Param,
    Delete,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    StreamableFile,
    Res,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('documents')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    /**
     * Upload d'un document pour un club
     */
    @Post('upload/:clubId/:userId')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/documents',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadFile(
        @Param('clubId', ParseIntPipe) clubId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.documentService.create(clubId, userId, file);
    }

    /**
     * Récupérer TOUS les fichiers d'un club (paginé)
     */
    @Get('club/:clubId')
    async getAllFiles(
        @Param('clubId', ParseIntPipe) clubId: number,
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
        return this.documentService.findPaginated(clubId, undefined, page, limit);
    }

    /**
     * Récupérer uniquement les IMAGES d'un club (paginé)
     */
    @Get('club/:clubId/images')
    async getClubImages(
        @Param('clubId', ParseIntPipe) clubId: number,
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
        return this.documentService.findPaginated(clubId, 'image', page, limit);
    }

    /**
     * Récupérer uniquement les DOCUMENTS (PDF, etc.) d'un club (paginé)
     */
    @Get('club/:clubId/docs')
    async getClubDocs(
        @Param('clubId', ParseIntPipe) clubId: number,
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 10,
    ) {
        return this.documentService.findPaginated(clubId, 'pdf', page, limit);
    }

    /**
     * Télécharger un document spécifique
     */
    @Get('download/:id')
    async downloadFile(
        @Param('id', ParseIntPipe) id: number,
        @Res({ passthrough: true }) res,
    ): Promise<StreamableFile> {
        const document = await this.documentService.findOne(id);
        const file = createReadStream(document.file);

        res.set({
            'Content-Disposition': `attachment; filename="${document.name}"`,
            'Content-Type': document.type,
        });

        return new StreamableFile(file);
    }

    /**
     * Supprimer un document
     */
    @Delete(':id')
    async deleteDocument(@Param('id', ParseIntPipe) id: number) {
        return this.documentService.delete(id);
    }
}
