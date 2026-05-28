"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerController = exports.OfferController = void 0;
const offers_service_1 = require("./offers.service");
const barber_service_1 = require("../barbers/barber.service");
const api_response_utils_1 = require("../../../shared/utils/api-response.utils");
const error_middleware_1 = require("../../../shared/middlewares/error.middleware");
const offers_dto_1 = require("./offers.dto");
class OfferController {
    /**
     * GET /api/offers — Público: ofertas activas vigentes
     */
    async getAllPublic(req, res, next) {
        try {
            const offers = await offers_service_1.offerService.findAllPublic();
            res.status(200).json((0, api_response_utils_1.successResponse)(offers));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/offers/admin — Admin: todas las ofertas del barbero
     */
    async getMyOffers(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { includeInactive } = req.query;
            const offers = await offers_service_1.offerService.findAllByBarber(profile.id, includeInactive === 'true');
            res.status(200).json((0, api_response_utils_1.successResponse)(offers));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/offers/admin/:id — Admin: una oferta específica
     */
    async getById(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = offers_dto_1.offerIdParamSchema.parse(req.params);
            const offer = await offers_service_1.offerService.findById(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(offer));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/offers/admin — Crear oferta
     */
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const validated = offers_dto_1.createOfferSchema.parse(req.body);
            const offer = await offers_service_1.offerService.create(validated, profile.id);
            res.status(201).json((0, api_response_utils_1.successResponse)(offer, 'Oferta creada exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/offers/admin/:id — Actualizar oferta
     */
    async update(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = offers_dto_1.offerIdParamSchema.parse(req.params);
            const validated = offers_dto_1.updateOfferSchema.parse(req.body);
            const offer = await offers_service_1.offerService.update(id, profile.id, validated);
            res.status(200).json((0, api_response_utils_1.successResponse)(offer, 'Oferta actualizada exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/offers/admin/:id/deactivate — Desactivar (soft delete)
     */
    async deactivate(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = offers_dto_1.offerIdParamSchema.parse(req.params);
            const offer = await offers_service_1.offerService.deactivate(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(offer, 'Oferta desactivada'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/offers/admin/:id/reactivate — Reactivar
     */
    async reactivate(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = offers_dto_1.offerIdParamSchema.parse(req.params);
            const offer = await offers_service_1.offerService.reactivate(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(offer, 'Oferta reactivada'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/offers/admin/:id — Eliminar permanentemente (Super Admin)
     */
    async delete(req, res, next) {
        try {
            const { id } = offers_dto_1.offerIdParamSchema.parse(req.params);
            await offers_service_1.offerService.deletePermanent(id);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Oferta eliminada permanentemente'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OfferController = OfferController;
exports.offerController = new OfferController();
