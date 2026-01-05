import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

type Schema = Record<string, unknown>;

const envelopeSchema = (message: string, dataSchema?: Schema): Schema => ({
  type: 'object',
  properties: {
    message: { type: 'string', example: message },
    data: dataSchema ?? { type: 'object', additionalProperties: true },
    pagination: {
      type: 'object',
      nullable: true,
      additionalProperties: true
    }
  },
  required: ['message', 'data']
});

const successResponse = (description: string, dataSchema?: Schema, message = description): Schema => ({
  description,
  content: {
    'application/json': {
      schema: envelopeSchema(message, dataSchema)
    }
  }
});

const errorBodySchema = (message: string): Schema => ({
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        message: { type: 'string', example: message },
        details: {
          type: 'object',
          nullable: true,
          additionalProperties: true
        }
      },
      required: ['message']
    }
  },
  required: ['error']
});

const errorResponse = (description: string): Schema => ({
  description,
  content: {
    'application/json': {
      schema: errorBodySchema(description)
    }
  }
});

const objectIdParam = (name: string, description: string): Schema => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: {
    type: 'string',
    minLength: 24,
    maxLength: 24
  }
});

const queryParam = (name: string, schema: Schema, description?: string): Schema => ({
  name,
  in: 'query',
  required: false,
  description,
  schema
});

const schemas: Record<string, Schema> = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'trainer', 'client'] },
      avatarUrl: { type: 'string', format: 'uri', nullable: true },
      status: { type: 'string', enum: ['active', 'blocked', 'pending'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'name', 'email', 'role', 'status', 'createdAt', 'updatedAt']
  },
  TrainerProfile: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      bio: { type: 'string', nullable: true },
      specialties: { type: 'array', items: { type: 'string' } },
      yearsOfExperience: { type: 'number', nullable: true },
      pricePerSession: { type: 'number', nullable: true },
      location: { type: 'string', nullable: true },
      onlineSessionsAvailable: { type: 'boolean' },
      ratingAverage: { type: 'number' },
      ratingCount: { type: 'number' },
      socialLinks: { type: 'array', items: { type: 'string', format: 'uri' }, nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'userId', 'specialties', 'onlineSessionsAvailable', 'ratingAverage', 'ratingCount', 'createdAt', 'updatedAt']
  },
  ClientProfile: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      age: { type: 'number', nullable: true },
      height: { type: 'number', nullable: true },
      weight: { type: 'number', nullable: true },
      goals: { type: 'string', nullable: true },
      medicalRestrictions: { type: 'string', nullable: true },
      preferences: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'userId', 'createdAt', 'updatedAt']
  },
  Exercise: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      sets: { type: 'integer', nullable: true },
      reps: { type: 'integer', nullable: true },
      rest: { type: 'string', nullable: true },
      notes: { type: 'string', nullable: true }
    },
    required: ['name']
  },
  WorkoutPlan: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      trainerId: { type: 'string' },
      clientId: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string', nullable: true },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      durationWeeks: { type: 'integer', nullable: true },
      exercises: { type: 'array', items: { $ref: '#/components/schemas/Exercise' } },
      status: { type: 'string', enum: ['active', 'completed', 'archived'] },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'trainerId', 'clientId', 'title', 'level', 'exercises', 'status', 'createdAt', 'updatedAt']
  },


  Session: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      trainerId: { type: 'string' },
      clientId: { type: 'string' },
      date: { type: 'string' },
      startTime: { type: 'string' },
      endTime: { type: 'string' },
      type: { type: 'string', enum: ['online', 'presential'] },
      status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
      notes: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'trainerId', 'clientId', 'date', 'startTime', 'endTime', 'type', 'status', 'createdAt', 'updatedAt']
  },
  ProgressLog: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      clientId: { type: 'string' },
      trainerId: { type: 'string', nullable: true },
      date: { type: 'string', format: 'date-time' },
      weight: { type: 'number', nullable: true },
      bodyFatPercent: { type: 'number', nullable: true },
      measurements: { type: 'object', additionalProperties: { type: 'number' }, nullable: true },
      notes: { type: 'string', nullable: true },
      workoutPlanId: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'clientId', 'date', 'createdAt', 'updatedAt']
  },
  Message: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      senderId: { type: 'string' },
      receiverId: { type: 'string' },
      content: { type: 'string' },
      read: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'senderId', 'receiverId', 'content', 'read', 'createdAt', 'updatedAt']
  },
  ConversationSummary: {
    type: 'object',
    properties: {
      otherUserId: { type: 'string' },
      lastMessage: { $ref: '#/components/schemas/Message' }
    },
    required: ['otherUserId', 'lastMessage']
  },
  Review: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      trainerId: { type: 'string' },
      authorId: { type: 'string' },
      workoutPlanId: { type: 'string', nullable: true },
      rating: { type: 'number', minimum: 1, maximum: 5 },
      comment: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['_id', 'trainerId', 'authorId', 'rating', 'createdAt', 'updatedAt']
  },

  AuthPayload: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/User' },
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' }
    },
    required: ['user', 'accessToken', 'refreshToken']
  }
};

const tags = [
  { name: 'System', description: 'Health checks and internal utilities' },
  { name: 'Auth', description: 'Authentication and password management' },
  { name: 'Users', description: 'User profile management' },
  { name: 'Admin', description: 'Administrator utilities' },
  { name: 'Trainers', description: 'Trainer discovery and profile updates' },
  { name: 'Clients', description: 'Client profile and assets' },
  { name: 'Workout Plans', description: 'Workout plan lifecycle' },

  { name: 'Sessions', description: 'Coaching session bookings' },
  { name: 'Progress Logs', description: 'Client progress tracking' },
  { name: 'Messages', description: 'In-app messaging' },
  { name: 'Reviews', description: 'Trainer reviews' },

];

const components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  schemas,
  responses: {
    Unauthorized: errorResponse('Authentication required'),
    Forbidden: errorResponse('Forbidden'),
    NotFound: errorResponse('Resource not found'),
    ValidationError: errorResponse('Validation failed')
  }
};

const secured: Array<Record<string, string[]>> = [{ bearerAuth: [] }];

const paths: Record<string, Record<string, Schema>> = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Health check',
      description: 'Returns the API status and current timestamp.',
      security: [],
      servers: [{ url: `http://localhost:${env.PORT}` }],
      responses: {
        200: successResponse('Healthy', {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' }
          },
          required: ['status', 'timestamp']
        })
      }
    }
  },
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new client',
      description: 'Creates a new client account and returns access tokens.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 }
              },
              required: ['name', 'email', 'password']
            }
          }
        }
      },
      responses: {
        201: successResponse('User registered', { $ref: '#/components/schemas/AuthPayload' }),
        400: { $ref: '#/components/responses/ValidationError' },
        409: errorResponse('Email already registered')
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      description: 'Authenticates an existing user and returns tokens.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 }
              },
              required: ['email', 'password']
            }
          }
        }
      },
      responses: {
        200: successResponse('Authenticated', { $ref: '#/components/schemas/AuthPayload' }),
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh tokens',
      description: 'Exchanges a refresh token for a new access token pair.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string', minLength: 10 }
              },
              required: ['refreshToken']
            }
          }
        }
      },
      responses: {
        200: successResponse('Tokens refreshed', {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          },
          required: ['accessToken', 'refreshToken']
        }),
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change password',
      description: 'Allows authenticated users to rotate their password.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                oldPassword: { type: 'string', minLength: 6 },
                newPassword: { type: 'string', minLength: 6 }
              },
              required: ['oldPassword', 'newPassword']
            }
          }
        }
      },
      responses: {
        200: successResponse('Password updated', { type: 'null', nullable: true }, 'Password updated'),
        400: { $ref: '#/components/responses/ValidationError' },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Request password reset token',
      description: 'Generates a mock password reset token for the supplied email.',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' }
              },
              required: ['email']
            }
          }
        }
      },
      responses: {
        200: successResponse('Reset token generated', {
          type: 'object',
          properties: {
            resetToken: { type: 'string' }
          },
          required: ['resetToken']
        }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get my profile',
      security: secured,
      responses: {
        200: successResponse('Current user', { $ref: '#/components/schemas/User' }),
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Update my profile',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2 },
                avatarUrl: { type: 'string', format: 'uri' }
              }
            }
          }
        }
      },
      responses: {
        200: successResponse('Profile updated', { $ref: '#/components/schemas/User' }),
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by id',
      security: secured,
      parameters: [objectIdParam('id', 'User identifier')],
      responses: {
        200: successResponse('User detail', { $ref: '#/components/schemas/User' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/admin/users': {
    get: {
      tags: ['Admin'],
      summary: 'List users',
      description: 'Requires admin role.',
      security: secured,
      parameters: [
        queryParam('role', { type: 'string', enum: ['admin', 'trainer', 'client'] }, 'Filter by role'),
        queryParam('status', { type: 'string', enum: ['active', 'blocked', 'pending'] }, 'Filter by status')
      ],
      responses: {
        200: successResponse('User list', { type: 'array', items: { $ref: '#/components/schemas/User' } }),
        403: { $ref: '#/components/responses/Forbidden' }
      }
    },
    post: {
      tags: ['Admin'],
      summary: 'Create user',
      description: 'Creates any type of user (admin, trainer, client).',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
                role: { type: 'string', enum: ['admin', 'trainer', 'client'] }
              },
              required: ['name', 'email', 'password', 'role']
            }
          }
        }
      },
      responses: {
        201: successResponse('User created', { $ref: '#/components/schemas/User' }),
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  },
  '/admin/users/{id}/status': {
    patch: {
      tags: ['Admin'],
      summary: 'Update user status',
      description: 'Requires admin role.',
      security: secured,
      parameters: [objectIdParam('id', 'User identifier')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['active', 'blocked', 'pending'] }
              },
              required: ['status']
            }
          }
        }
      },
      responses: {
        200: successResponse('Status updated', { $ref: '#/components/schemas/User' }),
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  },
  '/trainers': {
    get: {
      tags: ['Trainers'],
      summary: 'List trainers',
      description: 'Public endpoint that supports filtering by location, specialty, rating, and price.',
      security: [],
      parameters: [
        queryParam('location', { type: 'string' }, 'Filter by city/location'),
        queryParam('specialties', { type: 'string' }, 'Comma separated specialties'),
        queryParam('minRating', { type: 'number', minimum: 0 }, 'Minimum rating'),
        queryParam('maxPrice', { type: 'number', minimum: 0 }, 'Maximum price per session')
      ],
      responses: {
        200: successResponse('Trainer directory', { type: 'array', items: { $ref: '#/components/schemas/TrainerProfile' } })
      }
    }
  },
  '/trainers/me': {
    put: {
      tags: ['Trainers'],
      summary: 'Update my trainer profile',
      description: 'Requires trainer role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                bio: { type: 'string', maxLength: 500 },
                specialties: { type: 'array', items: { type: 'string' } },
                yearsOfExperience: { type: 'integer', minimum: 0 },
                pricePerSession: { type: 'number', minimum: 0 },
                location: { type: 'string' },
                onlineSessionsAvailable: { type: 'boolean' },
                socialLinks: { type: 'array', items: { type: 'string', format: 'uri' } }
              }
            }
          }
        }
      },
      responses: {
        200: successResponse('Trainer profile updated', { $ref: '#/components/schemas/TrainerProfile' }),
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    }
  },
  '/trainers/{id}': {
    get: {
      tags: ['Trainers'],
      summary: 'Get trainer by id',
      security: [],
      parameters: [objectIdParam('id', 'Trainer user identifier')],
      responses: {
        200: successResponse('Trainer profile', { $ref: '#/components/schemas/TrainerProfile' }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/clients/me': {
    get: {
      tags: ['Clients'],
      summary: 'Get my client profile',
      security: secured,
      responses: {
        200: successResponse('Client profile', { $ref: '#/components/schemas/ClientProfile' })
      }
    },
    put: {
      tags: ['Clients'],
      summary: 'Update my client profile',
      description: 'Requires client role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                age: { type: 'integer', minimum: 1, maximum: 120 },
                height: { type: 'number', minimum: 0 },
                weight: { type: 'number', minimum: 0 },
                goals: { type: 'string' },
                medicalRestrictions: { type: 'string' },
                preferences: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: successResponse('Client profile updated', { $ref: '#/components/schemas/ClientProfile' })
      }
    }
  },
  '/clients/me/workout-plans': {
    get: {
      tags: ['Clients'],
      summary: 'List my workout plans',
      security: secured,
      responses: {
        200: successResponse('Workout plans', { type: 'array', items: { $ref: '#/components/schemas/WorkoutPlan' } })
      }
    }
  },
  '/workout-plans': {
    post: {
      tags: ['Workout Plans'],
      summary: 'Create workout plan',
      description: 'Trainer only.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clientId: { type: 'string', minLength: 24, maxLength: 24 },
                title: { type: 'string', minLength: 3 },
                description: { type: 'string' },
                level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                durationWeeks: { type: 'integer', minimum: 1 },
                exercises: { type: 'array', items: { $ref: '#/components/schemas/Exercise' }, minItems: 1 }
              },
              required: ['clientId', 'title', 'exercises']
            }
          }
        }
      },
      responses: {
        201: successResponse('Workout plan created', { $ref: '#/components/schemas/WorkoutPlan' })
      }
    },
    get: {
      tags: ['Workout Plans'],
      summary: 'List workout plans',
      security: secured,
      parameters: [
        queryParam('trainerId', { type: 'string' }, 'Filter by trainer'),
        queryParam('clientId', { type: 'string' }, 'Filter by client'),
        queryParam('status', { type: 'string', enum: ['active', 'completed', 'archived'] }, 'Filter by status')
      ],
      responses: {
        200: successResponse('Workout plan list', { type: 'array', items: { $ref: '#/components/schemas/WorkoutPlan' } })
      }
    }
  },
  '/workout-plans/{id}': {
    get: {
      tags: ['Workout Plans'],
      summary: 'Get workout plan',
      security: secured,
      parameters: [objectIdParam('id', 'Workout plan id')],
      responses: {
        200: successResponse('Workout plan detail', { $ref: '#/components/schemas/WorkoutPlan' }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    put: {
      tags: ['Workout Plans'],
      summary: 'Update workout plan',
      description: 'Trainer or admin.',
      security: secured,
      parameters: [objectIdParam('id', 'Workout plan id')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clientId: { type: 'string', minLength: 24, maxLength: 24 },
                title: { type: 'string' },
                description: { type: 'string' },
                level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                durationWeeks: { type: 'integer', minimum: 1 },
                exercises: { type: 'array', items: { $ref: '#/components/schemas/Exercise' } }
              }
            }
          }
        }
      },
      responses: {
        200: successResponse('Workout plan updated', { $ref: '#/components/schemas/WorkoutPlan' })
      }
    },
    delete: {
      tags: ['Workout Plans'],
      summary: 'Delete workout plan',
      description: 'Trainer (own plans) or admin.',
      security: secured,
      parameters: [objectIdParam('id', 'Workout plan id')],
      responses: {
        200: successResponse('Plan deleted', { type: 'null', nullable: true }, 'Plan deleted')
      }
    }
  },
  '/workout-plans/{id}/status': {
    patch: {
      tags: ['Workout Plans'],
      summary: 'Update workout plan status',
      security: secured,
      parameters: [objectIdParam('id', 'Workout plan id')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['active', 'completed', 'archived'] }
              },
              required: ['status']
            }
          }
        }
      },
      responses: {
        200: successResponse('Status updated', { $ref: '#/components/schemas/WorkoutPlan' })
      }
    }
  },

  '/sessions': {
    post: {
      tags: ['Sessions'],
      summary: 'Book a session',
      description: 'Clients create new coaching sessions.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                trainerId: { type: 'string', minLength: 24, maxLength: 24 },
                date: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                type: { type: 'string', enum: ['online', 'presential'] },
                notes: { type: 'string' }
              },
              required: ['trainerId', 'date', 'startTime', 'endTime', 'type']
            }
          }
        }
      },
      responses: {
        201: successResponse('Session created', { $ref: '#/components/schemas/Session' })
      }
    },
    get: {
      tags: ['Sessions'],
      summary: 'List sessions',
      security: secured,
      parameters: [
        queryParam('trainerId', { type: 'string' }, 'Filter by trainer'),
        queryParam('clientId', { type: 'string' }, 'Filter by client'),
        queryParam('status', { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] }, 'Filter by status'),
        queryParam('from', { type: 'string', format: 'date' }, 'Start date ISO string'),
        queryParam('to', { type: 'string', format: 'date' }, 'End date ISO string')
      ],
      responses: {
        200: successResponse('Sessions', { type: 'array', items: { $ref: '#/components/schemas/Session' } })
      }
    }
  },
  '/sessions/{id}': {
    get: {
      tags: ['Sessions'],
      summary: 'Get session',
      security: secured,
      parameters: [objectIdParam('id', 'Session id')],
      responses: {
        200: successResponse('Session detail', { $ref: '#/components/schemas/Session' }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },
  '/sessions/{id}/status': {
    patch: {
      tags: ['Sessions'],
      summary: 'Update session status',
      security: secured,
      parameters: [objectIdParam('id', 'Session id')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] }
              },
              required: ['status']
            }
          }
        }
      },
      responses: {
        200: successResponse('Session updated', { $ref: '#/components/schemas/Session' })
      }
    }
  },
  '/progress-logs': {
    post: {
      tags: ['Progress Logs'],
      summary: 'Create progress log',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clientId: { type: 'string', minLength: 24, maxLength: 24 },
                trainerId: { type: 'string', minLength: 24, maxLength: 24 },
                date: { type: 'string', format: 'date-time' },
                weight: { type: 'number' },
                bodyFatPercent: { type: 'number', minimum: 0, maximum: 100 },
                measurements: { type: 'object', additionalProperties: { type: 'number' } },
                notes: { type: 'string' },
                workoutPlanId: { type: 'string', minLength: 24, maxLength: 24 }
              }
            }
          }
        }
      },
      responses: {
        201: successResponse('Progress log created', { $ref: '#/components/schemas/ProgressLog' })
      }
    },
    get: {
      tags: ['Progress Logs'],
      summary: 'List progress logs',
      security: secured,
      parameters: [
        queryParam('clientId', { type: 'string' }, 'Filter by client id'),
        queryParam('from', { type: 'string', format: 'date' }, 'Start date'),
        queryParam('to', { type: 'string', format: 'date' }, 'End date')
      ],
      responses: {
        200: successResponse('Progress logs', { type: 'array', items: { $ref: '#/components/schemas/ProgressLog' } })
      }
    }
  },
  '/progress-logs/{id}': {
    get: {
      tags: ['Progress Logs'],
      summary: 'Get progress log',
      security: secured,
      parameters: [objectIdParam('id', 'Progress log id')],
      responses: {
        200: successResponse('Progress log detail', { $ref: '#/components/schemas/ProgressLog' }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    put: {
      tags: ['Progress Logs'],
      summary: 'Update progress log',
      security: secured,
      parameters: [objectIdParam('id', 'Progress log id')],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                clientId: { type: 'string', minLength: 24, maxLength: 24 },
                trainerId: { type: 'string', minLength: 24, maxLength: 24 },
                date: { type: 'string', format: 'date-time' },
                weight: { type: 'number' },
                bodyFatPercent: { type: 'number', minimum: 0, maximum: 100 },
                measurements: { type: 'object', additionalProperties: { type: 'number' } },
                notes: { type: 'string' },
                workoutPlanId: { type: 'string', minLength: 24, maxLength: 24 }
              }
            }
          }
        }
      },
      responses: {
        200: successResponse('Progress log updated', { $ref: '#/components/schemas/ProgressLog' })
      }
    },
    delete: {
      tags: ['Progress Logs'],
      summary: 'Delete progress log',
      security: secured,
      parameters: [objectIdParam('id', 'Progress log id')],
      responses: {
        200: successResponse('Deleted', { type: 'null', nullable: true }, 'Deleted')
      }
    }
  },
  '/messages': {
    post: {
      tags: ['Messages'],
      summary: 'Send message',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                receiverId: { type: 'string', minLength: 24, maxLength: 24 },
                content: { type: 'string', minLength: 1 }
              },
              required: ['receiverId', 'content']
            }
          }
        }
      },
      responses: {
        201: successResponse('Message sent', { $ref: '#/components/schemas/Message' })
      }
    }
  },
  '/messages/conversations': {
    get: {
      tags: ['Messages'],
      summary: 'Conversation summaries',
      security: secured,
      responses: {
        200: successResponse('Conversations', { type: 'array', items: { $ref: '#/components/schemas/ConversationSummary' } })
      }
    }
  },
  '/messages/conversations/{userId}': {
    get: {
      tags: ['Messages'],
      summary: 'Conversation with user',
      security: secured,
      parameters: [objectIdParam('userId', 'Other user id')],
      responses: {
        200: successResponse('Conversation history', { type: 'array', items: { $ref: '#/components/schemas/Message' } })
      }
    }
  },
  '/messages/{id}/read': {
    patch: {
      tags: ['Messages'],
      summary: 'Mark message as read',
      security: secured,
      parameters: [objectIdParam('id', 'Message id')],
      responses: {
        200: successResponse('Message updated', { $ref: '#/components/schemas/Message' })
      }
    }
  },
  '/reviews': {
    post: {
      tags: ['Reviews'],
      summary: 'Create review',
      description: 'Clients only.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                trainerId: { type: 'string', minLength: 24, maxLength: 24 },
                workoutPlanId: { type: 'string', minLength: 24, maxLength: 24 },
                rating: { type: 'number', minimum: 1, maximum: 5 },
                comment: { type: 'string' }
              },
              required: ['trainerId', 'rating']
            }
          }
        }
      },
      responses: {
        201: successResponse('Review created', { $ref: '#/components/schemas/Review' })
      }
    },
    get: {
      tags: ['Reviews'],
      summary: 'List reviews',
      security: secured,
      parameters: [
        queryParam('trainerId', { type: 'string' }, 'Filter by trainer'),
        queryParam('authorId', { type: 'string' }, 'Filter by author')
      ],
      responses: {
        200: successResponse('Reviews', { type: 'array', items: { $ref: '#/components/schemas/Review' } })
      }
    }
  },
  '/reviews/{id}': {
    get: {
      tags: ['Reviews'],
      summary: 'Get review',
      security: secured,
      parameters: [objectIdParam('id', 'Review id')],
      responses: {
        200: successResponse('Review detail', { $ref: '#/components/schemas/Review' }),
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

};

const definition = {
  openapi: '3.1.0',
  info: {
    title: 'TrainMe API',
    version: '1.0.0',
    description:
      'REST API for the TrainMe personal trainer platform. Every response is wrapped in { message, data, pagination } for consistency.'
  },
  servers: [{ url: `http://localhost:${env.PORT}/api` }],
  tags,
  components,
  paths
};

export const swaggerSpec = swaggerJSDoc({ definition, apis: [] });
