import { z } from 'zod';

export const dataKitSchemaZod = z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100, "Maximum limit is 100").optional(),
    query: z.record(z.string(), z.unknown()).optional(),
    filter: z.record(z.string(), z.unknown()).optional(),
    filterConfig: z.record(z.string(), z.object({
        type: z.enum(["regex", "exact"]),
        field: z.string().optional()
    })).optional(),
    sorts: z.array(z.object({
        path: z.string().max(100), // Limit path length to prevent abuse
        value: z.literal(-1).or(z.literal(1))
    })).max(5).optional(), // Limit to 5 sort fields
});

export type TDataKitSchemaZod = z.infer<typeof dataKitSchemaZod>;
