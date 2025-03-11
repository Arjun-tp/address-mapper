import Location from '../models/Location.js'

export const getHistory = async (req, res) => {
  try {
    let { page, limit } = req.query

    page = parseInt(page) || 1
    limit = parseInt(limit) || 10

    const skip = (page - 1) * limit

    const history = await Location.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalRecords = await Location.countDocuments()

    res.json({
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data: history,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve history', err })
  }
}
