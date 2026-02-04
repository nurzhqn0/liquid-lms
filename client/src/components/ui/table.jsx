import React from "react";
import { cn } from "../../lib/utils.js";

const Table = ({ className, ...props }) => (
  <div className={cn("w-full overflow-x-auto", className)}>
    <table className="w-full text-left text-sm" {...props} />
  </div>
);

const TableHead = ({ className, ...props }) => (
  <th className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink/60", className)} {...props} />
);

const TableRow = ({ className, ...props }) => (
  <tr className={cn("border-b border-ink/10", className)} {...props} />
);

const TableCell = ({ className, ...props }) => (
  <td className={cn("px-4 py-3", className)} {...props} />
);

export { Table, TableHead, TableRow, TableCell };
