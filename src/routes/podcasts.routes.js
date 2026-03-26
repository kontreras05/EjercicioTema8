import express from 'express';
import {
  getPublishedPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
  getAllPodcastsAdmin,
  togglePublishPodcast
} from '../controllers/podcasts.controller.js';
import { verifySession } from '../middleware/session.middleware.js';
import { requireRole } from '../middleware/rol.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/podcasts:
 *   get:
 *     summary: Lista todos los podcasts publicados
 *     tags: [Podcasts]
 *     responses:
 *       200:
 *         description: Lista de podcasts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Podcast'
 */
router.get('/', getPublishedPodcasts);

/**
 * @swagger
 * /api/podcasts/admin/all:
 *   get:
 *     summary: Lista todos los podcasts (incluyendo no publicados)
 *     tags: [Podcasts]
 *     security:
 *       - BearerToken: []
 *     responses:
 *       200:
 *         description: Lista completa de podcasts
 *       403:
 *         description: No autorizado
 */
router.get('/admin/all', verifySession, requireRole('admin'), getAllPodcastsAdmin);

/**
 * @swagger
 * /api/podcasts/{id}:
 *   get:
 *     summary: Obtiene un podcast publicado por ID
 *     tags: [Podcasts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Podcast'
 *       404:
 *         description: No encontrado
 */
router.get('/:id', getPodcastById);

/**
 * @swagger
 * /api/podcasts:
 *   post:
 *     summary: Crea un nuevo podcast
 *     tags: [Podcasts]
 *     security:
 *       - BearerToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PodcastInput'
 *     responses:
 *       201:
 *         description: Podcast creado
 *       401:
 *         description: No autenticado
 */
router.post('/', verifySession, createPodcast);

/**
 * @swagger
 * /api/podcasts/{id}:
 *   put:
 *     summary: Actualiza un podcast existente
 *     tags: [Podcasts]
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PodcastInput'
 *     responses:
 *       200:
 *         description: Podcast actualizado
 *       403:
 *         description: No es el autor o admin
 */
router.put('/:id', verifySession, updatePodcast);

/**
 * @swagger
 * /api/podcasts/{id}:
 *   delete:
 *     summary: Elimina un podcast
 *     tags: [Podcasts]
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast eliminado
 *       403:
 *         description: Solo admin
 */
router.delete('/:id', verifySession, requireRole('admin'), deletePodcast);

/**
 * @swagger
 * /api/podcasts/{id}/publish:
 *   patch:
 *     summary: Alterna el estado de publicación
 *     tags: [Podcasts]
 *     security:
 *       - BearerToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado modificado exitosamente
 *       403:
 *         description: Solo admin
 */
router.patch('/:id/publish', verifySession, requireRole('admin'), togglePublishPodcast);

export default router;
