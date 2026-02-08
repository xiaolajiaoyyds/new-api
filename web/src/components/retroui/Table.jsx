import React from 'react';
import { cn } from '../../helpers/utils';
import { Loader2 } from 'lucide-react';
import { Empty } from './Empty';

const Table = ({
  columns,
  dataSource = [],
  rowKey = 'id',
  loading = false,
  className,
  emptyText = '暂无数据',
}) => {
  const getRowKey = (record, index) => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] ?? index;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!dataSource.length) {
    return <Empty description={emptyText} />;
  }

  return (
    <div className={cn('overflow-hidden rounded-xl bg-white dark:bg-zinc-900/50 shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || col.dataIndex || idx}
                  className="px-6 py-4 whitespace-nowrap bg-transparent"
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {dataSource.map((record, rowIndex) => (
              <tr
                key={getRowKey(record, rowIndex)}
                className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || col.dataIndex || colIndex}
                    className="px-6 py-4 text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"
                    style={{ width: col.width }}
                  >
                    {col.render
                      ? col.render(record[col.dataIndex], record, rowIndex)
                      : record[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Table };
