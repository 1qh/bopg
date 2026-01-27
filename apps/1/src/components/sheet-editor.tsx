/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: x */
'use client'

import 'react-data-grid/lib/styles.css'
import { useTheme } from 'next-themes'
import { parse, unparse } from 'papaparse'
import { memo, useEffect, useMemo, useState } from 'react'
import { DataGrid, renderTextEditor } from 'react-data-grid'

interface SheetEditorProps {
  content: string
  saveContent: (content: string, isCurrentVersion: boolean) => void
}

const MIN_ROWS = 50,
  MIN_COLS = 26,
  PureSpreadsheetEditor = ({ content, saveContent }: SheetEditorProps) => {
    const { resolvedTheme } = useTheme(),
      parseData = useMemo(() => {
        if (!content) return Array.from({ length: MIN_ROWS }).fill(Array.from({ length: MIN_COLS }).fill('')) as string[][]
        const result = parse<string[]>(content, { skipEmptyLines: true }),
          paddedData = result.data.map(row => {
            const paddedRow = [...row]
            while (paddedRow.length < MIN_COLS) paddedRow.push('')
            return paddedRow
          })
        while (paddedData.length < MIN_ROWS) paddedData.push(Array.from({ length: MIN_COLS }).fill('') as string[])
        return paddedData
      }, [content]),
      columns = useMemo(() => {
        const rowNumberColumn = {
            cellClass: 'bg-background! shadow-none!',
            frozen: true,
            headerCellClass: 'shadow-none!',
            key: 'rowNumber',
            name: '',
            renderCell: ({ rowIdx }: { rowIdx: number }) => rowIdx + 1,
            width: 50
          },
          dataColumns = Array.from({ length: MIN_COLS }, (_, i) => ({
            cellClass: 'border',
            key: i.toString(),
            name: String.fromCodePoint(65 + i),
            renderEditCell: renderTextEditor,
            width: 120
          }))
        return [rowNumberColumn, ...dataColumns]
      }, []),
      initialRows = useMemo(
        () =>
          parseData.map((row, i) => {
            const rowData: {
              [key: string]: number | string
              id: number
              rowNumber: number
            } = {
              id: i,
              rowNumber: i + 1
            }
            for (const [ci, col] of columns.slice(1).entries()) rowData[col.key] = row[ci] ?? ''
            return rowData
          }),
        [parseData, columns]
      ),
      [localRows, setLocalRows] = useState(initialRows)

    useEffect(() => {
      setLocalRows(initialRows)
    }, [initialRows])

    const generateCsv = (data: any[][]) => unparse(data),
      handleRowsChange = (newRows: any[]) => {
        setLocalRows(newRows)
        const updatedData = newRows.map(row => columns.slice(1).map(col => row[col.key] ?? '')),
          newCsvContent = generateCsv(updatedData)
        saveContent(newCsvContent, true)
      }
    return (
      <DataGrid
        className={resolvedTheme === 'dark' ? 'rdg-dark' : 'rdg-light'}
        columns={columns}
        defaultColumnOptions={{ resizable: true, sortable: true }}
        enableVirtualization
        onCellClick={args => {
          if (args.column.key !== 'rowNumber') args.selectCell(true)
        }}
        onRowsChange={handleRowsChange}
        rows={localRows}
        style={{ height: '100%' }}
      />
    )
  },
  areEqual = (prevProps: SheetEditorProps, nextProps: SheetEditorProps) =>
    prevProps.content === nextProps.content && prevProps.saveContent === nextProps.saveContent

export const SpreadsheetEditor = memo(PureSpreadsheetEditor, areEqual)
