import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In, Not } from "typeorm";
import { Document } from "./entities/document.entity";
import { Club } from "../clubs/entities/club.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        @InjectRepository(Club)
        private readonly clubRepository: Repository<Club>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Récupérer les fichiers d'un club avec pagination et filtrage par type
     */
    async findPaginated(
        clubId: number,
        type?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: Document[], total: number, page: number, lastPage: number }> {
        const skip = (page - 1) * limit;

        const where: any = { club: { id: clubId } };

        if (type === 'image') {
            where.type = Like('image/%');
        } else if (type === 'pdf') {
            where.type = In(['application/pdf']);
        } else if (type === 'document') {
            // Document = tout ce qui n'est pas image
            where.type = Not(Like('image/%'));
        }

        const [data, total] = await this.documentRepository.findAndCount({
            where,
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
        });

        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    /**
     * Créer un nouveau document
     */
    async create(
        clubId: number,
        userId: number,
        file: Express.Multer.File,
    ): Promise<Document> {
        const club = await this.clubRepository.findOne({ where: { id: clubId } });
        if (!club) {
            throw new NotFoundException(`Club avec ID ${clubId} introuvable`);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec ID ${userId} introuvable`);
        }

        const document = new Document();
        document.name = file.originalname;
        document.file = file.path;
        document.date = new Date();
        document.type = file.mimetype; // e.g. 'image/png', 'application/pdf'
        document.size = file.size;
        document.club = club;
        document.user = user;

        return this.documentRepository.save(document);
    }

    async findOne(id: number): Promise<Document> {
        const doc = await this.documentRepository.findOne({
            where: { id },
            relations: ['club'],
        });
        if (!doc) {
            throw new NotFoundException(`Document avec ID ${id} introuvable`);
        }
        return doc;
    }

    async delete(id: number): Promise<void> {
        const doc = await this.findOne(id);
        // On pourrait ici supprimer physiquement le fichier avec fs.unlink
        await this.documentRepository.remove(doc);
    }
}