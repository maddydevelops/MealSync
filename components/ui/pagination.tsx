"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// -------------------- Pagination Container --------------------
interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Pagination = ({ className, ...props }: PaginationProps) => {
  return <div className={cn("inline-flex items-center", className)} {...props} />;
};

// -------------------- Pagination Content --------------------
interface PaginationContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const PaginationContent = ({ className, ...props }: PaginationContentProps) => {
  return <div className={cn("inline-flex items-center space-x-1", className)} {...props} />;
};

// -------------------- Pagination Item --------------------
interface PaginationItemProps extends React.HTMLAttributes<HTMLDivElement> {}
export const PaginationItem = ({ className, ...props }: PaginationItemProps) => {
  return <div className={cn("", className)} {...props} />;
};

// -------------------- Pagination Link --------------------
interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}
export const PaginationLink = ({
  children,
  isActive,
  className,
  ...props
}: PaginationLinkProps) => {
  return (
    <button
      className={cn(
        "px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/10",
        isActive && "bg-primary text-primary-foreground",
        className
      )}
      {...props} // accepts onClick, disabled, etc.
    >
      {children}
    </button>
  );
};

// -------------------- Pagination Next --------------------
interface PaginationNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export const PaginationNext = ({ children = "Next", className, ...props }: PaginationNextProps) => {
  return (
    <button
      className={cn(
        "px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// -------------------- Pagination Previous --------------------
interface PaginationPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export const PaginationPrevious = ({ children = "Previous", className, ...props }: PaginationPreviousProps) => {
  return (
    <button
      className={cn(
        "px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
