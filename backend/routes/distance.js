import express from 'express'
import { getHistory } from '../controllers/history.js'
import { locationSchema } from '../validators/addressValidators.js'
import { validateJoi } from '../middleware/validateJoi.js'

const router = express.Router()

router.get('/', validateJoi(locationSchema), getHistory)

export default router
