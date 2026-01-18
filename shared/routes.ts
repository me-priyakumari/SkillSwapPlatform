import { z } from 'zod';
import { insertUserSchema, insertSkillSchema, insertRequestSchema, insertMessageSchema, insertReviewSchema, users, skills, swapRequests, messages, reviews } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.void(), // Not logged in
      },
    },
  },
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/users/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  skills: {
    list: {
      method: 'GET' as const,
      path: '/api/skills',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        type: z.enum(['teach', 'learn']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof skills.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/skills',
      input: insertSkillSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof skills.$inferSelect>(),
      },
    },
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests', // Returns both sent and received
      responses: {
        200: z.array(z.custom<typeof swapRequests.$inferSelect & { skill: typeof skills.$inferSelect, otherUser: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests',
      input: insertRequestSchema.omit({ senderId: true, status: true }),
      responses: {
        201: z.custom<typeof swapRequests.$inferSelect>(),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/requests/:id/status',
      input: z.object({ status: z.enum(['accepted', 'rejected']) }),
      responses: {
        200: z.custom<typeof swapRequests.$inferSelect>(),
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages/:userId', // Get messages with a specific user
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema.omit({ senderId: true }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/users/:userId/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { author: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema.omit({ authorId: true }),
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
