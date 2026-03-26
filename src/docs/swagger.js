import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PodcastHub API',
      version: '1.0.0',
      description: 'API para la plataforma de podcasts PodcastHub con autenticación y JWT',
    },
    components: {
      securitySchemes: {
        BearerToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        PodcastInput: {
          type: 'object',
          required: ['title', 'description', 'category', 'duration'],
          properties: {
            title: { type: 'string', minLength: 3 },
            description: { type: 'string', minLength: 10 },
            category: { type: 'string', enum: ['tech', 'science', 'history', 'comedy', 'news'] },
            duration: { type: 'integer', minimum: 60 },
            episodes: { type: 'integer', default: 1 },
            published: { type: 'boolean', default: false }
          }
        },
        Podcast: {
          allOf: [
            { $ref: '#/components/schemas/PodcastInput' },
            {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                author: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          ]
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
