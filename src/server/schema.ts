import { z } from 'zod';

export const dataKitSchemaZod = z.object({
	action: z.literal('FETCH').optional(),
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().optional(),
	query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
	filter: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
	filterConfig: z
		.record(
			z.string(),
			z.object({
				type: z.enum(['REGEX', 'EXACT']),
				field: z.string().optional(),
			}),
		)
		.optional(),
	sorts: z
		.array(
			z.object({
				path: z.string().max(100), // Limit path length to prevent abuse
				value: z.literal(-1).or(z.literal(1)),
			}),
		)
		.max(5)
		.optional(), // Limit to 5 sort fields
	sort: z.record(z.string(), z.literal(1).or(z.literal(-1))).optional(),
});

export type TDataKitSchemaZod = z.infer<typeof dataKitSchemaZod>;
