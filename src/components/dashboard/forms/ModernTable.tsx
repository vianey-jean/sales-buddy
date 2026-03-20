import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ModernTableProps {
  children: React.ReactNode;
  className?: string;
}

const ModernTable: React.FC<ModernTableProps> = ({ children, className }) => {
  return (
    <div className="rounded-lg sm:rounded-xl border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-900 -mx-3 sm:mx-0">
      <Table className={cn("min-w-full", className)}>
        {children}
      </Table>
    </div>
  );
};

const ModernTableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
    {children}
  </TableHeader>
);

const ModernTableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ 
  children, 
  onClick, 
  className 
}) => (
  <TableRow 
    className={cn(
      "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20",
      "transition-all duration-200 border-gray-100 dark:border-gray-800",
      onClick && "cursor-pointer hover:shadow-md",
      className
    )}
    onClick={onClick}
  >
    {children}
  </TableRow>
);

const ModernTableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableHead className={cn(
    "font-bold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-transparent to-transparent text-xs sm:text-sm whitespace-nowrap",
    className
  )}>
    {children}
  </TableHead>
);

const ModernTableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableCell className={cn("text-gray-600 dark:text-gray-400 text-xs sm:text-sm whitespace-nowrap", className)}>
    {children}
  </TableCell>
);

export { 
  ModernTable, 
  ModernTableHeader, 
  ModernTableRow, 
  ModernTableHead, 
  ModernTableCell, 
  TableBody, 
  TableFooter 
};
