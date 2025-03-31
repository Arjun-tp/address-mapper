import axios from 'axios'
import Location from '../models/Location.js'
import { apiUrls, MAX_NUMBER_OF_RETRIES } from '../config/constant.js'
import { google_config } from '../config/vars.js'
import { retryOnFail } from '../utils/retryOnFail.js'
import { sleep } from '../utils/sleep.js'

/**
 * Retrieves latitude and longitude for a given address using the Nominatim API.
 *
 * @async
 * @function getCoordinates
 * @param {string} address - The address to geocode.
 * @param {number} [attemptCount=MAX_NUMBER_OF_RETRIES] - The number of retry attempts for API failures.
 * @returns {Promise<{status: string, data?: {lat: number, lon: number}, err?: Error}>} - Returns the coordinates on success or an error on failure.
 */
const getCoordinates = async (
  address,
  attemptCount = MAX_NUMBER_OF_RETRIES
) => {
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
      },
    }
  } catch (err) {
    const attemptsLeft = attemptCount - 1
    if (!attemptsLeft)
      return {
        status: 'failed',
        err,
      }
    // sleep to prevent rate limiting
    await sleep({
      reason: `[NOMINATIM-API] Call failed, ${attemptsLeft} attempts left`,
      ms: 500,
    })
    return await getCoordinates(address, attemptsLeft)
  }
}

/**
 * @param placeName
 * @returns {Promise<{status: string, data: {lat: *, lon: *}}|null>}
 */

const getCoordinatesFromGoogle = async (placeName) => {
  try {
    const response = await axios.get(apiUrls.GOOGLE_GEOCODING, {
      params: {
        address: placeName,
        key: google_config.GOOGLE_API_KEY,
      },
    })

    if (response.data.status !== 'OK') {
      throw new Error(
        `Geocoding failed for ${placeName}: ${response.data.status}`
      )
    }

    const location = response.data.results[0].geometry.location
    return {
      status: 'success',
      data: {
        lat: location.lat,
        lon: location.lng,
      },
    }
  } catch (error) {
    console.error('[GOOGLE-GEOCODING]', error.message)
    return null
  }
}

/**
 * Calculates the great-circle distance (orthodromic distance) between two geographical points using the Haversine formula.
 *
 * @function getDistance
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @returns {number} - Distance in kilometers.
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c // Distance in km
}

/**
 * Calculates the distance between a source and a destination using Google Routes API or falls back to the Haversine formula if the API fails.
 *
 * @async
 * @function calculateDistance
 * @param {import("express").Request} req - Express request object containing `source` and `destination` in the request body.
 * @param {import("express").Response} res - Express response object for returning the calculated distance.
 * @returns {Promise<e.Response<any, Record<string, any>>>} - Sends the response with distance data or an error message.
 */
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
    let [sourceCoords, destCoords] = await Promise.all([
      getCoordinates(source),
      getCoordinates(destination),
    ])

    if (sourceCoords.status === 'failed') {
      const [googleSourceCoords] = await Promise.all([
        getCoordinatesFromGoogle(source),
      ])

      if (!googleSourceCoords) {
        return res.status(400).json({
          error: { message: `${source} is invalid address`, type: 'source' },
        })
      }
      sourceCoords = googleSourceCoords
    }

    if (destCoords.status === 'failed') {
      const [googleDestCoords] = await Promise.all([
        getCoordinatesFromGoogle(destination),
      ])
      if (!googleDestCoords) {
        return res.status(400).json({
          error: {
            message: `${destination} is invalid address`,
            type: 'destination',
          },
        })
      }

      destCoords = googleDestCoords
    }

    if (
      sourceCoords.data.lat === destCoords.data.lat &&
      sourceCoords.data.lon === destCoords.data.lon
    ) {
      return res
        .status(400)
        .json({ error: 'Source and destination cannot be the same' })
    }

    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: sourceCoords.data.lat,
            longitude: sourceCoords.data.lon,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destCoords.data.lat,
            longitude: destCoords.data.lon,
          },
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

    const response = await retryOnFail({
      promise: googlePromise,
      methodName: '[GOOGLE-API]',
    })

    let distanceMeters = response?.data?.routes?.[0]?.distanceMeters

    // If Google API fails, fallback to Haversine formula or Orthodromic distance
    if (!distanceMeters || typeof distanceMeters !== 'number') {
      console.log(
        '[GOOGLE-API] Failed to fetch distance, using Haversine formula'
      )
      distanceMeters =
        getDistance(
          sourceCoords.data.lat,
          sourceCoords.data.lon,
          destCoords.data.lat,
          destCoords.data.lon
        ) * 1000 // Convert to meters
    }

    if (!distanceMeters || typeof distanceMeters !== 'number') {
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
      distanceInKMs: (distanceMeters / 1000).toFixed(3),
    })

    await saveLocation.save()
    return res.status(200).json(saveLocation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
