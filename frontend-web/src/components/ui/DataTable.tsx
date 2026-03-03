interface Column<T> {
  header: string
  accessor: keyof T
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
}

export default function DataTable<T>({
  columns,
  data,
}: Props<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            {columns.map((col) => (
              <th key={String(col.accessor)} className="p-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={String(col.accessor)} className="p-4">
                  {String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}