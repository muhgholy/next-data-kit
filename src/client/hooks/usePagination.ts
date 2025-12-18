/**
 * next-data-kit - usePagination Hook
 *
 * React hook for calculating pagination state.
 */

'use client';

import { useMemo } from 'react';
import type { TPaginationInfo } from '../../types';
import { calculatePagination } from '../../types';


export type TUsePaginationReturn = TPaginationInfo & {
     // ** Array of page numbers/ellipsis to display
     pages: (number | 'ellipsis')[];
     // ** First page number
     firstPage: number;
     // ** Last page number
     lastPage: number;
};


const range = (start: number, end: number): number[] =>
     Array.from({ length: end - start + 1 }, (_, idx) => idx + start);


export const usePagination = (props: Readonly<{
     page: number;
     limit: number;
     total: number;
     // ** Number of page buttons to show on each side of current page
     siblingCount?: number;
}>): TUsePaginationReturn => {
     // ** Deconstruct Props
     const { page, limit, total, siblingCount = 1 } = props;

     // ** Calculate pagination info
     const paginationInfo = useMemo(() => calculatePagination(page, limit, total), [page, limit, total]);

     // ** Calculate page numbers to display
     const pages = useMemo(() => {
          const { totalPages } = paginationInfo;

          // ** Total number of page buttons = siblings on both sides + first + last + current + 2 ellipsis
          const totalPageNumbers = siblingCount * 2 + 5;

          // ** If total pages is less than page numbers we want to show
          if (totalPageNumbers >= totalPages) return range(1, totalPages);

          const leftSiblingIndex = Math.max(page - siblingCount, 1);
          const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

          const shouldShowLeftEllipsis = leftSiblingIndex > 2;
          const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

          // ** No left ellipsis, but right ellipsis
          if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
               const leftRange = range(1, 3 + 2 * siblingCount);
               return [...leftRange, 'ellipsis' as const, totalPages];
          }

          // ** Left ellipsis, no right ellipsis
          if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
               const rightRange = range(totalPages - (3 + 2 * siblingCount) + 1, totalPages);
               return [1, 'ellipsis' as const, ...rightRange];
          }

          // ** Both ellipsis
          if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
               const middleRange = range(leftSiblingIndex, rightSiblingIndex);
               return [1, 'ellipsis' as const, ...middleRange, 'ellipsis' as const, totalPages];
          }

          return range(1, totalPages);
     }, [paginationInfo, page, siblingCount]);

     return {
          ...paginationInfo,
          pages,
          firstPage: 1,
          lastPage: paginationInfo.totalPages,
     };
};
