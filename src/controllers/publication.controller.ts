import { Request, Response, NextFunction } from 'express';
import { IPublicationService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Locaciones - Maneja HTTP requests (SRP)
export class PublicationController {
    constructor(private readonly publicationService: IPublicationService) { }

    getAllPublications = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            console.log('GET /publications - Obteniendo lista de publicaciones');

            const publications = await this.publicationService.getAllPublications();

            res.status(200).json({
                success: true,
                data: publications,
                count: publications.length,
            });
        } catch (error) {
            next(error);
        }
    };
}