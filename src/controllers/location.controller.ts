import { Request, Response, NextFunction } from 'express';
import { ILocationService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Locaciones - Maneja HTTP requests (SRP)
export class LocationController {
  constructor(private readonly locationService: ILocationService) {}

  getAllLocations = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('GET /locations - Obteniendo lista de locaciones');

      const locations = await this.locationService.getAllLocations();

      res.status(200).json({
        success: true,
        data: locations,
        count: locations.length,
      });
    } catch (error) {
      next(error);
    }
  };
}