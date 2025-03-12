import express from 'express'
import { calculateDistance } from '../controllers/distance.js'
import { locationSchema } from '../validators/addressValidators.js'
import { validateJoi } from '../middleware/validateJoi.js'

const router = express.Router()

router.post('/distance', validateJoi(locationSchema), calculateDistance)

export default router
