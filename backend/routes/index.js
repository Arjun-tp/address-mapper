import express from 'express'
import healthRoutes from './health.js'
import historyRoutes from './history.js'
import locationRoutes from './distance.js'

const router = express.Router()

router.use('/health', healthRoutes)
router.use('/history', historyRoutes)
router.use('/location', locationRoutes)

export default router
