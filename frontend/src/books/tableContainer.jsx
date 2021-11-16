// TableContainer.js
import React, { useEffect, useState } from "react"
import { useTable, usePagination, useSortBy, useAsyncDebounce, useGlobalFilter, useFilters } from "react-table"
import {Table} from 'react-bootstrap'
import Pagination from "@mui/material/Pagination"
import "bootstrap/dist/css/bootstrap.min.css"


function GlobalFilter({
  totalRecords,
  globalFilter,
  setGlobalFilter,
}) {
  const count = totalRecords
  const [search, setSearch] = useState(globalFilter)
  function onChange (event)  {
    setSearch(event.target.value);
    setGlobalFilter(event.target.value || undefined)
  }

  return (
    <span>
      <input
        value={search || ""}
        onChange={onChange}
        placeholder={`Search among ${count} records...`}
        style={{
          fontSize: '1.1rem',
          border: '0',
          width: '100%',
        }}
      />
    </span>
  )
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length

  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}


export function TableContainer ({
  columns,
  data,
  fetchData,
  loading,
  totalPageCount,
  filter_user,
  filter_category,
  pageCount: controlledPageCount,
}){
 

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  )
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    setGlobalFilter,
    visibleColumns,
    state: { pageIndex, pageSize, sortBy, globalFilter, filters},
  } = useTable({
    columns,
    data,
    defaultColumn,
    initialState: { pageIndex: 0 },
    manualPagination: true,
    manualSortBy: true,
    manualFilters: true,
    manualGlobalFilter: true,
    pageCount: controlledPageCount,
    autoResetPage: true,
    autoResetExpanded: true,
    autoResetGroupBy: true,
    autoResetSelectedRows: true,
    autoResetSortBy: true,
    autoResetFilters: true,
    autoResetRowState: true
  },
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination
);

const handleChange = (event, value) => {
  gotoPage(value-1);
};

const onFetchDataDebounced = useAsyncDebounce(fetchData, 200)

useEffect(() => {
  onFetchDataDebounced({ pageIndex, pageSize, sortBy, globalFilter, filters })
}, [ pageIndex, pageSize, sortBy, globalFilter, filter_user, filter_category, filters])


  return (
    <>
    <Table bordered hover {...getTableProps()}>
      <thead>
      <tr>
            <th
              colSpan={visibleColumns.length}
              style={{
                textAlign: 'left',
              }}
            >
              <GlobalFilter
                totalRecords={totalPageCount}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
              />
            </th>
          </tr>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th scope="col">
              <div {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                  {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}
                  </span>
              </div>
              <div>
                  {column.canFilter ? column.render("Filter") : null}
              </div>
          </th>
            ))}
          </tr>
        ))}
        
      </thead>

      <tbody {...getTableBodyProps()}>
        {page.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
              })}
            </tr>
          )
        })}
        <tr>
            {loading ? (
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000">
                Showing {page.length} of ~{totalPageCount}{' '}
                results
              </td>
            )}
          </tr>
      </tbody>
    </Table>
    <Pagination count={controlledPageCount} page={pageIndex+1} color="primary" onChange={handleChange}/>  
        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(event.target.value)
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
    </>
  )
}
