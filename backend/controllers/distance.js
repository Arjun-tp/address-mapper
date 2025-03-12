import axios from 'axios'
import Location from '../models/Location.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Function to get latitude & longitude from an address
const getCoordinates = async (address) => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: { q: address, format: 'json' },
    })
    if (!response.data.length) throw new Error(`Invalid address: ${address}`)
    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
    }
  } catch (err) {
    throw new Error(`Address Not Found: ${address}, ${err}`)
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
    const sourceCoords = await getCoordinates(source)
    const destCoords = await getCoordinates(destination)
    console.log('sourceCoords------', sourceCoords)
    console.log('destCoords------', destCoords)
    // TODO Calculate distance

    // Save the data to MongoDB
    const saveLocation = new Location({
      source: {
        name: source,
        lat: sourceCoords.lat,
        lng: sourceCoords.lon,
      },
      destination: {
        name: destination,
        lat: destCoords.lat,
        lng: destCoords.lon,
      },
      distanceInKMs: 23.945859,
    })

    await saveLocation.save()
    return res.status(200).json(saveLocation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
