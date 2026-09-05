'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  // Calculate range items shown
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : undefined;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800/80 ${className}`}
    >
      {/* Information text */}
      <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left font-medium">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Menampilkan <strong className="text-stone-800 dark:text-stone-200">{startItem}</strong> -{' '}
            <strong className="text-stone-800 dark:text-stone-200">{endItem}</strong> dari{' '}
            <strong className="text-stone-800 dark:text-stone-200">{totalItems}</strong> data
          </span>
        ) : (
          <span>
            Halaman <strong className="text-stone-800 dark:text-stone-200">{currentPage}</strong> dari{' '}
            <strong className="text-stone-800 dark:text-stone-200">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Pagination navigation controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 self-center sm:self-auto">
          {/* Previous page button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Numbered page buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-stone-400 select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-forest-600 dark:bg-forest-500 text-white shadow-sm shadow-forest-600/30'
                      : 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            aria-label="Halaman Selanjutnya"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
