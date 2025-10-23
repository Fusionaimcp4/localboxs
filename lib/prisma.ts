import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Skip database connection during Docker build
const shouldSkip = process.env.SKIP_DATABASE === 'true'

// Create a comprehensive mock Prisma client for build time
const mockPrisma = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $queryRaw: () => Promise.resolve([]),
  $executeRaw: () => Promise.resolve(0),
  $transaction: () => Promise.resolve(),
  // Add all Prisma models with mock methods
  demo: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  user: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  workflow: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    updateMany: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  systemMessage: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  systemMessageTemplate: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  systemMessageVersion: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    updateMany: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  knowledgeBase: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  document: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  documentChunk: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
  apiCall: {
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
  },
} as any

export const prisma = shouldSkip ? mockPrisma : (globalForPrisma.prisma ?? new PrismaClient())

if (process.env.NODE_ENV !== 'production' && !shouldSkip) globalForPrisma.prisma = prisma
