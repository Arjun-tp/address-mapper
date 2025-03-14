const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Address Mapper API',
    version: '1.0.0',
    description: 'API documentation for Address Mapper backend',
  },
  servers: [
    {
      url: 'https://address-mapper-production.up.railway.app',
      description: 'Production Server',
    },
    {
      url: 'http://localhost:7004',
      description: 'Development Server, use this only while doing local development',
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Returns server health status.',
        responses: {
          200: {
            description: 'Server is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string', example: 'Server is running' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Internal server error' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/history': {
      get: {
        summary: 'Get paginated location history',
        description: 'Retrieves paginated location history from the database.',
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            required: false,
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 5 },
            required: false,
            description: 'Number of records per page',
          },
        ],
        responses: {
          200: {
            description: 'Successfully retrieved paginated history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 5 },
                    totalRecords: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 20 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/LocationHistory' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Invalid query parameters',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to retrieve history',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/location/distance': {
      post: {
        summary: 'Calculate Distance',
        description:
          'Calculates the distance between two locations using Google API or Haversine formula.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['source', 'destination'],
                properties: {
                  source: {
                    type: 'string',
                    example: 'New York, USA',
                  },
                  destination: {
                    type: 'string',
                    example: 'Los Angeles, USA',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successfully calculated distance',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: {
                      type: 'string',
                      example: '60b6c0f3c1f6b314541c2a93',
                    },
                    source: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'New York, USA' },
                        lat: {
                          type: 'number',
                          format: 'float',
                          example: 40.7128,
                        },
                        lng: {
                          type: 'number',
                          format: 'float',
                          example: -74.006,
                        },
                      },
                    },
                    destination: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Los Angeles, USA' },
                        lat: {
                          type: 'number',
                          format: 'float',
                          example: 34.0522,
                        },
                        lng: {
                          type: 'number',
                          format: 'float',
                          example: -118.2437,
                        },
                      },
                    },
                    distanceInKMs: {
                      type: 'number',
                      format: 'float',
                      example: 3940.5,
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2023-06-15T12:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request parameters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Source and destination cannot be the same',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to calculate distance',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      LocationHistory: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60b6c0f3c1f6b314541c2a93' },
          source: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'New York, USA' },
              lat: { type: 'number', format: 'float', example: 40.7128 },
              lng: { type: 'number', format: 'float', example: -74.006 },
            },
          },
          destination: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Los Angeles, USA' },
              lat: { type: 'number', format: 'float', example: 34.0522 },
              lng: { type: 'number', format: 'float', example: -118.2437 },
            },
          },
          distanceInKMs: { type: 'number', format: 'float', example: 3940.5 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-06-15T12:30:00.000Z',
          },
        },
      },
    },
  },
}

export default swaggerDefinition
