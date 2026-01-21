import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Query,
    Post,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Status } from 'src/common/enums';

/**
 * Controller pour la Gestion des Adhésions
 *
 * LOGIQUE IMPORTANTE:
 * - Le statut d'adhésion est stocké dans l'entity APPLICATION
 * - Les memberships enregistrent l'adhésion effective
 * - Les endpoints utilisent les applications pour filtrer par statut
 */
@Controller('memberships')
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) {}

    /**
     * Créer une nouvelle adhésion
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipsService.create(createMembershipDto);
    }

    /**
     * Récupérer les adhésions/demandes avec filtrage
     *
     * Query parameters:
     * - clubId: ID du club (optionnel)
     * - status: Statut de l'application - PENDING, APPROVED, REJECTED (optionnel)
     * - page: Numéro de page (défaut: 1)
     * - limit: Nombre de résultats par page (défaut: 10)
     *
     * Exemple d'utilisation:
     * GET /memberships?clubId=1&status=PENDING&page=1&limit=10
     */
    @Get()
    findAll(
        @Query('clubId') clubId?: number,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.membershipsService.findAll({
            clubId: clubId ? +clubId : undefined,
            status,
            page: page ? +page : 1,
            limit: limit ? +limit : 10,
        });
    }

    /**
     * Récupérer une adhésion spécifique par ID
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.membershipsService.findOne(+id);
    }

    /**
     * Mettre à jour le statut d'une demande d'adhésion (Application)
     *
     * Statuts possibles:
     * - PENDING: En attente d'approbation
     * - APPROVED: Approuvée (crée la membership)
     * - REJECTED: Rejetée (supprime la membership)
     *
     * Exemple:
     * PATCH /memberships/123/status
     * Body: { "status": "APPROVED" }
     */
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: string,
    ) {
        // Convertir le statut string en enum
        const enumStatus = Status[status as keyof typeof Status];

        if (!enumStatus) {
            return {
                error: 'Statut invalide. Statuts acceptés: PENDING, APPROVED, REJECTED',
            };
        }

        return this.membershipsService.updateStatus(+id, enumStatus);
    }

    /**
     * Vérifier l'adhésion d'un utilisateur à un club
     *
     * Query parameters:
     * - userId: ID de l'utilisateur (requis)
     * - clubId: ID du club (requis)
     *
     * Retourne:
     * - exists: true si l'utilisateur a une application approuvée
     * - membership: détails de l'adhésion
     * - status: statut de l'application
     *
     * Exemple:
     * GET /memberships/check/status?userId=5&clubId=1
     */
    @Get('check/status')
    @HttpCode(HttpStatus.OK)
    async checkMembership(
        @Query('userId') userId?: number,
        @Query('clubId') clubId?: number,
    ) {
        // Validation des paramètres
        if (!userId || !clubId) {
            return {
                error: 'userId et clubId sont obligatoires',
                exists: false,
            };
        }

        try {
            const result = await this.membershipsService.findByUserAndClub(
                +userId,
                +clubId,
            );

            return {
                exists: result.exists,
                membership: result.membership,
                status: result.status,
                isActive: result.status === Status.APPROVED,
            };
        } catch (error) {
            return {
                error: error.message,
                exists: false,
            };
        }
    }

    /**
     * Obtenir les détails d'une membership avec son application
     *
     * Exemple:
     * GET /memberships/1/with-application
     */
    @Get(':id/with-application')
    @HttpCode(HttpStatus.OK)
    async getMembershipWithApplication(@Param('id') id: string) {
        return this.membershipsService.getMembershipWithApplication(+id);
    }
}