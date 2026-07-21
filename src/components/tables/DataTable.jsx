/** Provides sorting, filtering, pagination, and selection for tabular data. */
import { useMemo, useState  } from 'react';
import { flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
 } from '@tanstack/react-table';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownloadIcon from '@mui/icons-material/Download';
import { SearchBar  } from '../common/SearchBar';
import { Button  } from '../ui/Button';
import { Checkbox  } from '../ui/Checkbox';
import { downloadCSV  } from '../../lib/utils';
import { cn  } from '../../lib/utils';

export function DataTable({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  enableSelection = false,
  enableExport = true,
  exportFilename = 'export.csv',
  onRowClick,
  toolbar,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState({});

  const allColumns = useMemo(() => {
    if (!enableSelection) return columns;
    return [
      {
        id: 'select',
        header: ({ table }) => {
          const allSelected = table.getRowModel().rows.every((r) => selected[r.id]);
          return (
            <Checkbox
              checked={allSelected && table.getRowModel().rows.length > 0}
              onCheckedChange={(v) => {
                const next = { ...selected };
                table.getRowModel().rows.forEach((r) => { next[r.id] = v; });
                setSelected(next);
              }}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={!!selected[row.id]}
           onCheckedChange={(v) => {
             setSelected((s) => ({
               ...s,
               [row.id]: v,
             }));
           }}
         />
        ),
        size: 32,
      },
      ...columns,
    ];
  }, [columns, enableSelection, selected]);

  const filteredData = useMemo(() => {
    if (!globalFilter || !searchKey) return data;
    const q = globalFilter.toLowerCase();
    return data.filter((row) => searchKey(row).toLowerCase().includes(q));
  }, [data, globalFilter, searchKey]);

  const table = useReactTable({
    data: filteredData,
    columns: allColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const handleExport = () => {
    const rows = table.getRowModel().rows.map((r) => {
      const obj = {};
      r.getAllCells().forEach((c) => {
        if (c.column.id !== 'select') obj[c.column.id] = c.getValue();
      });
      return obj;
    });
    downloadCSV(exportFilename, rows);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchKey && (
          <SearchBar value={globalFilter} onChange={setGlobalFilter} placeholder={searchPlaceholder} className="sm:w-72" />
        )}
        <div className="flex items-center gap-2">
          {toolbar}
          {enableExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon className="h-4 w-4" /> Export
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn('flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer hover:text-foreground')}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <KeyboardArrowUpIcon className="h-3.5 w-3.5" />}
                        {header.column.getIsSorted() === 'desc' && <KeyboardArrowDownIcon className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-10 text-center text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn('border-b border-border transition-colors hover:bg-muted/40', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <KeyboardArrowLeftIcon className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next <KeyboardArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
