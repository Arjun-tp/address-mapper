import axios from 'axios'
import Location from '../models/Location.js'
import { apiUrls, MAX_NUMBER_OF_RETRIES } from '../config/constant.js'
import { google_config } from '../config/vars.js'
import { retryOnFail } from '../utils/retryOnFail.js'
import { sleep } from '../utils/sleep.js'

// Function to get latitude & longitude from an address
const getCoordinates = async (address, attemptCount = MAX_NUMBER_OF_RETRIES) => {
  try {

    const response = await axios.get(apiUrls.NOMINATIM_URL, {
      params: { q: address, format: 'json' },
    })

    if (!response.data.length) throw new Error(`Invalid address: ${address}`)
    return {
      status: 'success',
      data: {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      }
    }
  } catch (err) {
    const attemptsLeft = attemptCount - 1
    if (!attemptsLeft)
      return {
        status: 'failed',
        err
      }
    // sleep to prevent rate limiting
    await sleep({ reason: `[NOMINATIM-API] Call failed, ${attemptsLeft} attempts left`, ms: 500 })
    return await getCoordinates(address, attemptsLeft)
  }
}

export const calculateDistance = async (req, res) => {
  try {
    const { source, destination } = req.body

    // Prevent same source and destination
    if (source.toLowerCase() === destination.toLowerCase()) {
      return res
        .status(400)
        .json({ error: 'Source and destination cannot be the same' })
    }

    // Get coordinates
    const [sourceCoords, destCoords] = await Promise.all([getCoordinates(source), getCoordinates(destination)])

    if (sourceCoords.status === 'failed') {
      return res.status(400).json({
        error: { message: `${source} is invalid address`, type: 'source' }
      })
    }

    if (destCoords.status === 'failed') {
      return res.status(400).json({
        error: { message: `${destination} is invalid address`, type: 'destination' }
      })
    }

    if (sourceCoords.data.lat === destCoords.data.lat && sourceCoords.data.lon === destCoords.data.lon) {
      return res.status(400)
        .json({ error: 'Source and destination cannot be the same' })
    }

    const requestBody = {
      origin: {
        location: {
          latLng: { latitude: sourceCoords.data.lat, longitude: sourceCoords.data.lon },
        },
      },
      destination: {
        location: {
          latLng: { latitude: destCoords.data.lat, longitude: destCoords.data.lon },
        },
      },
      travelMode: 'DRIVE',
      languageCode: 'en-US',
      units: 'METRIC',
    }

    // Send request to Google Routes API

    const googlePromise = axios.post(apiUrls.GOOGLE_URL, requestBody, {
      headers: {
        'X-Goog-Api-Key': google_config.GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
      },
    })

    const response = await retryOnFail({ promise: googlePromise, methodName: '[GOOGLE-API]' })

    const distanceMeters =  response?.data?.routes?.[0]?.distanceMeters 
    
    if (!distanceMeters || typeof distanceMeters !== 'number' ) {
      throw new Error('[GOOGLE-API]: failed to fetch distance in meters')
    }

    // Save the data to MongoDB
    const saveLocation = new Location({
      source: {
        name: source,
        lat: sourceCoords.data.lat,
        lng: sourceCoords.data.lon,
      },
      destination: {
        name: destination,
        lat: destCoords.data.lat,
        lng: destCoords.data.lon,
      },
      distanceInKMs: distanceMeters / 1000,
    })

    await saveLocation.save()
    return res.status(200).json(saveLocation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
