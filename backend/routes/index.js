import express from 'express'
import healthRoutes from './health.js'

const router = express.Router()

router.use('/health', healthRoutes)

export default router
