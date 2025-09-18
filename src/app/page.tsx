"use client";
import { useEffect, useMemo, useState } from "react";
import CsvUploader from "./components/CsvUploader";
import { Line, Pie } from "react-chartjs-2";
import SpendingTable from "./components/SpendingTable";

export default function Home() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiDatatable,setApiDatatable] = useState('');
  const [apiData, setApiData] = useState<any[]>([]); // Assuming the API returns an array
  const [apitableData, setApitableData] = useState<any[]>([]); // Assuming the API returns an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl);
      const tabledata = await fetch(apiDatatable);
      if (!res.ok && !tabledata.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      const datatabledata = await tabledata.json();
      setApiData(data.data);
      setApitableData(datatabledata.data);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setApiData([]);
      setApitableData([]);
    } finally {
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
      <div className="flex gap-2 mb-2">
        <input type="text" placeholder="Enter API URL" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="border p-2 rounded w-full"/>
        <input type="text" placeholder="Enter Datatable URL" value={apiDatatable} onChange={(e) => setApiDatatable(e.target.value)} className="border p-2 rounded w-full"/>
        <button onClick={fetchData} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Fetch</button>
      </div>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      
      <div className="mt-4">
        <h3 className="font-bold mb-2">Parsed CSV Preview:</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          {apiData && apiData.length > 0 && (
            <button onClick={fetchData} className="bg-blue-500 hover:bg-blue-700 float-right text-white font-bold py-1 px-2 rounded text-sm">Refresh</button>
          )}
          
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
        {apiData && apiData.length > 0 && (
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
        )}
        {apitableData && apitableData.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Spending Table</h2>
            <SpendingTable data={apitableData}/>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}