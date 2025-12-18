'use client';

type ClassPrimitive = string | number | boolean | null | undefined;
type ClassDictionary = Record<string, boolean | undefined | null>;
type ClassArray = ClassValue[];
export type ClassValue = ClassPrimitive | ClassDictionary | ClassArray;

const toClassString = (input: ClassValue): string => {
    if (!input) return '';

    if (typeof input === 'string' || typeof input === 'number') return String(input);

    if (Array.isArray(input)) {
        return input.map(toClassString).filter(Boolean).join(' ');
    }

    if (typeof input === 'object') {
        return Object.entries(input)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key)
            .join(' ');
    }

    return '';
};

/**
 * Minimal `cn` helper (shadcn-style) without external deps.
 */
export const cn = (...inputs: ClassValue[]): string => inputs.map(toClassString).filter(Boolean).join(' ');
