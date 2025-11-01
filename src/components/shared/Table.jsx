import React from "react";

const Table = ({ columns, data, noDataMessage = "No se encontraron datos" }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm min-w-max table-fixed">
                <thead>
                    <tr className="bg-slate-100 text-left">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`${column.className || ""} px-4 py-3 font-bold text-slate-800 ${column.headerClassName || ""}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center py-8 text-slate-500"
                            >
                                {noDataMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                {columns.map((column, colIndex) => {
                                    const value = column.accessor ? row[column.accessor] : null;
                                    return (
                                        <td
                                            key={colIndex}
                                            className={`${column.className || ""} px-4 py-3 ${column.cellClassName || ""}`}
                                        >
                                            {column.cell ? column.cell(row) : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
