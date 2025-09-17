"use client";
import { useEffect, useMemo, useState } from "react";
import CsvUploader from "./components/CsvUploader";
import Charts from "./components/Charts";

export default function Home() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiData, setApiData] = useState<any[]>([]); // Assuming the API returns an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("API response is not an array");
      }
      
      setApiData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

  const getAccountSums = () => {
    if (!Array.isArray(apiData)) return {};
    return apiData.reduce((acc: Record<string, number>, row) => {
      const accountName = row.Account?.AccountName;
      const amount = parseFloat(row.Amount);
      if (!accountName) return acc;
      if (!acc[accountName]) {
        acc[accountName] = 0;
      }
      
      acc[accountName] += isNaN(amount) ? 0 : amount;
      return acc;
    }, {});
  };
  
  const accountSums = getAccountSums();
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getColor = (index: number) => {
    const hue = (index * 137.5) % 360; 
    return `hsl(${hue}, 70%, 50%)`;
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    apiData.forEach((item) => {
      if (item.Account?.AccountName) cats.add(item.Account?.AccountName);
    });
    return Array.from(cats).sort();
  }, [apiData]);

  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    apiData.forEach((item) => {
      if (item.SpendDate) dates.add(item.SpendDate);
    });
    return Array.from(dates).sort();
  }, [apiData]);


  const filteredData = useMemo(() => {
    return apiData.filter((row) => {
      const categoryMatch = categoryFilter === "All" || row.Account?.AccountName === categoryFilter;
      const dateMatch = dateFilter === "All" || row.SpendDate === dateFilter;
      return categoryMatch && dateMatch;
    });
  }, [apiData, categoryFilter, dateFilter]);


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);


  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, dateFilter]);


  const getFilteredCategoryTotal = () => {
    return filteredData.reduce((sum, row) => {
      const amount = parseFloat(row.Amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  return (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Upload Your CSV</h1>
    <CsvUploader />
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Fetch API Data</h2>
      <div className="flex gap-2 mb-2">
        <input type="text" placeholder="Enter API URL" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="border p-2 rounded w-full"/>
        <button onClick={fetchData} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Fetch</button>
        </div>
        
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {Array.isArray(apiData) && apiData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Parsed CSV Preview:</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
                {Object.entries(accountSums).map(([accountName, total], index) => {
                  const color = getColor(index);
                  return (
                    <div key={accountName} className="bg-white shadow rounded border-l-4 border-green-500 p-6" style={{ borderColor: color }}>
                      <h5 style={{ color }} className="text-green-600 text-sm font-semibold mb-2">{accountName}</h5>
                      <p id="today-count" className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                  );
                })}
              </div>
              <Charts accountSums={accountSums} />
          </div>
        )}

        {apiData && apiData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown by Category</h3>
            <div className="flex flex-wrap gap-6 mb-6 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option className="bg-gray-900 text-white" value="All">
                    All
                  </option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} className="bg-gray-900 text-white" value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option className="bg-gray-900 text-white" value="All">
                    All
                  </option>
                  {uniqueDates.map((date) => (
                    <option key={date} className="bg-gray-900 text-white" value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 text-sm font-medium text-gray-300">
              Total Amount for{" "}
              <span className="font-semibold text-white">
                {categoryFilter === "All" ? "All Categories" : categoryFilter}
              </span>
              :{" "}
              <span className="text-blue-400 font-semibold">{formatCurrency(getFilteredCategoryTotal())}</span>
            </div>

            <div className="overflow-auto max-h-[28rem] border border-gray-700 rounded-lg shadow-sm">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-800 text-xs uppercase text-gray-400 sticky top-0 z-10">
                  <tr>
                    {apiData[0] &&
                      Object.keys(apiData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 border-b border-gray-700">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={apiData[0] ? Object.keys(apiData[0]).length : 1}
                        className="text-center py-6 text-gray-500"
                      >
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <tr key={idx} className="even:bg-gray-900 hover:bg-gray-700 transition-colors">
                        {Object.keys(row).map((key) => {
                          const value = row[key];
                          if (key === "Amount") {
                            return (
                              <td key={key} className="px-4 py-2 border-b border-gray-700">
                                {formatCurrency(parseFloat(value))}
                              </td>
                            );
                          } else if (typeof value === "object" && value !== null) {
                            if (key === "Account" && value.AccountName) {
                              return (
                                <td key={key} className="px-4 py-2 border-b border-gray-700">
                                  {value.AccountName}
                                </td>
                              );
                            }
                            return (
                              <td key={key} className="px-4 py-2 border-b border-gray-700">
                                {JSON.stringify(value)}
                              </td>
                            );
                          } else {
                            return (
                              <td key={key} className="px-4 py-2 border-b border-gray-700">
                                {value}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-2 text-gray-300 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 mr-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 ml-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}