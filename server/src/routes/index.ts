import { Router } from 'express';
import authRoutes from './auth';
import booksRoutes from './books';
import chaptersRoutes from './chapters';
import charactersRoutes from './characters';
import locationsRoutes from './locations';
import itemsRoutes from './items';
import artRoutes from './art';
import artistsRoutes from './artists';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', booksRoutes);
router.use('/chapters', chaptersRoutes);
router.use('/characters', charactersRoutes);
router.use('/locations', locationsRoutes);
router.use('/items', itemsRoutes);
router.use('/art', artRoutes);
router.use('/artists', artistsRoutes);

export default router;
