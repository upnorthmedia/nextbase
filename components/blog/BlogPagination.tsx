'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function BlogPagination({ currentPage, totalPages, className }: BlogPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  // Helper to create URL with updated page param
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i === l + 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && typeof l === 'number' && i > l + 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i as number;
    });

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Blog pagination"
    >
      {/* First page */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'hidden sm:inline-flex',
          isFirstPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isFirstPage}
        disabled={isFirstPage}
      >
        {isFirstPage ? (
          <span>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </span>
        ) : (
          <Link href={createPageURL(1)}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Link>
        )}
      </Button>

      {/* Previous page */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          isFirstPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isFirstPage}
        disabled={isFirstPage}
      >
        {isFirstPage ? (
          <span>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </span>
        ) : (
          <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Link>
        )}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-9 w-9',
                isActive && 'pointer-events-none'
              )}
              asChild={!isActive}
            >
              {isActive ? (
                <span aria-current="page">{pageNumber}</span>
              ) : (
                <Link href={createPageURL(pageNumber)}>
                  <span>{pageNumber}</span>
                </Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next page */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          isLastPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isLastPage}
        disabled={isLastPage}
      >
        {isLastPage ? (
          <span>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </span>
        ) : (
          <Link href={createPageURL(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Link>
        )}
      </Button>

      {/* Last page */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'hidden sm:inline-flex',
          isLastPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isLastPage}
        disabled={isLastPage}
      >
        {isLastPage ? (
          <span>
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </span>
        ) : (
          <Link href={createPageURL(totalPages)}>
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Link>
        )}
      </Button>
    </nav>
  );
}

// Alternative simple pagination for mobile or compact spaces
export function SimplePagination({ currentPage, totalPages, className }: BlogPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          isFirstPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isFirstPage}
        disabled={isFirstPage}
      >
        {isFirstPage ? (
          <span>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </span>
        ) : (
          <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Link>
        )}
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        className={cn(
          isLastPage && 'pointer-events-none opacity-50'
        )}
        asChild={!isLastPage}
        disabled={isLastPage}
      >
        {isLastPage ? (
          <span>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </span>
        ) : (
          <Link href={createPageURL(currentPage + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}