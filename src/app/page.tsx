"use client";
import { useEffect, useMemo, useState } from "react";
import CsvUploader from "./components/CsvUploader";
import { Line, Pie } from "react-chartjs-2";
import SpendingTable from "./SpendingTable";

export default function Home() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiDatatable,setApiDatatable] = useState('');
  const [apiData, setApiData] = useState<any[]>([]); // Assuming the API returns an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setApiData(data.data);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setApiData([]);
    } finally {
      if (!apiUrl.trim() || !apiDatatable.trim()) {
      setError("Both API URL and Datatable URL are required.");
      return;
    }
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getColor = (index?: number) => {
    if (typeof index !== "number" || isNaN(index)) {
    const randomHue = Math.floor(Math.random() * 360);
    return `hsl(${randomHue}, 70%, 50%)`;
  }


  const hue = (index * 137.5) % 360;
  return `hsl(${hue}, 70%, 50%)`;
  };

  const getColors = () => {
    const data = getTotalData();
    return data.map((_, index) => getColor(index));
  };

  const getLabels = () => {
    if (!apiData) return [];
    const labels = Array.from(new Set(apiData.map(row => row.AccountName).filter(Boolean)));
    return labels;
  }


  const getTotalData = () => {
    if (!apiData) return [];
    const amountTotal = Array.from(new Set(apiData.map(row => row.TotalAmount)))
    return amountTotal;
  }

  const getLineChartData = () => {
    if (!apiData) return { labels: [], datasets: [] };
    const accountMap: Record<string, number> = {};
    apiData.forEach(row => {
      const accountName = row.AccountName?.trim();
      const amount = parseFloat(row.TotalAmount);
      if (!accountName || isNaN(amount)) return;
      accountMap[accountName] = (accountMap[accountName] || 0) + amount;
    });
    
    const sortedaccountName = Object.keys(accountMap).sort();
    const amounts = sortedaccountName.map(AccountName => accountMap[AccountName]);
    
    return {
      labels: sortedaccountName,
      datasets: [
        {
          label: "Total Amount by Account Names",
          data: amounts,
          fill: false,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.3)",
          tension: 0.2,
        },
      ],
    };
  };

  return (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Upload Your CSV</h1>
    <CsvUploader />
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Fetch API Data</h2>
      <div className="flex items-center gap-4 mb-3">
  {apiData && apiData.length > 0 && (
    <button
      onClick={fetchData}
      className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:from-purple-500 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-all duration-300"
    >
      Refresh
    </button>
  )}
</div>


<div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Enter API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Enter Datatable URL"
          value={apiDatatable}
          onChange={(e) => setApiDatatable(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={fetchData}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold 
          px-6 py-3 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 
          transition-all duration-300"
        >
          Fetch
        </button>
      </div>

      {error && <p className="text-red-600 font-semibold">{error}</p>}
      
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {apiData && apiData.length > 0 && (
      <div className="mt-4">
        <h3 className="font-bold mb-2">Parsed CSV Preview:</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          
          {apiData.map(({ AccountName, TotalAmount }, index) => {
            const color = getColor(index);
            return (
              <div key={AccountName} className="bg-white shadow rounded border-l-4 border-green-500 p-6" style={{ borderColor: color }}>
                <h5 style={{ color }} className="text-green-600 text-sm font-semibold mb-2">{AccountName}</h5>
                <p id="today-count" className="text-xl font-bold text-gray-900">{formatCurrency(Number(TotalAmount))}</p>
              </div>
            );
          })}
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Expenses vs Income</h3>
              <div className="flex-1 flex items-center justify-center">
                <Pie data={{
                  labels: getLabels(),
                  datasets: [
                    {
                      data: getTotalData(),
                      backgroundColor: getColors(),
                      borderColor: getColors(),
                      borderWidth: 1,
                    },
                  ],
                }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Line Chart by Account</h3>
              <div className="flex-1 flex items-center justify-center">
                <Line data={getLineChartData()} />
              </div>
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Spending Table</h2>
            <SpendingTable accounts={apiData} apiUrl={apiDatatable} />
          </div>
          </div>
        )}

          


    </div>
  </div>
  );
}