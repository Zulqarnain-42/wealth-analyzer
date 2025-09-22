'use client'
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react";

interface SpendingApiResponse {
  data: Spending[];
  totalCount: number; 
}

interface AccountSummary {
  AccountName: string;
  TotalAmount: string;
}

interface Spending {
  SpendingID: string
  Amount: string
  Description: string
  SpendDate: string
  Account: {
    AccountName: string
    AccountType: string
    AccountCode: string
  }
}

interface SpendingTableProps {
  accounts: AccountSummary[];
  apiUrl: string;
}

export default function SpendingTable({ accounts,apiUrl  }: SpendingTableProps) {
  const [data, setData] = useState<Spending[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / pageSize);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1); 
  }, [selectedAccount]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, selectedAccount]);

const handleExport = () => {
  window.open('/api/export-csv', '_blank');
};


  const fetchData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!apiUrl) return;
    const url = new URL(apiUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    url.searchParams.set("AccountName", selectedAccount);
    try {
      const res = await fetch(url.toString());
      const json: SpendingApiResponse = await res.json();
      setData(json.data);
      setTotal(Number(json.totalCount));
    } catch (err) {
      console.error("Failed to fetch spending data:", err);
    }finally{
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = [
      "ID",
      "Description",
      "Amount",
      "Date",
      "Account",
      "Type"
    ];

    const rows = data.map(spend => [
      spend.SpendingID,
      spend.Description,
      spend.Amount,
      spend.SpendDate,
      spend.Account.AccountName,
      spend.Account.AccountType
    ]);
    
    const csvContent =
    [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `spending_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      {data.length === 0 ? 
        (
          <p>No data found.</p>
        ) : (
      <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700 font-medium">Rows per page:</label>
            <select id="pageSize" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {[25, 100, 1000, 5000,10000].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="accountFilter" className="text-sm text-gray-700 font-medium">Filter by Account:</label>
            <select id="accountFilter" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} 
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px] transition"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => ( 
                <option key={acc.AccountName} value={acc.AccountName}>{acc.AccountName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-1 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
            Export CSV
          </button>
          <button onClick={handleExport} className="px-4 py-1 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-shadow shadow-sm hover:shadow-md">
  Export All CSV
</button>

          <button
      onClick={fetchData}
      disabled={loading}
      className={`relative flex items-center justify-center ${
        loading ? 'w-10 h-10 rounded-full' : 'px-4 py-1 rounded'
      } bg-gradient-to-r from-purple-500 to-purple-700 text-white text-sm font-semibold shadow-md hover:from-purple-600 hover:to-purple-800 transition-all`}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : (
        'Refresh'
      )}
    </button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((spend) => (
            <TableRow key={spend.SpendingID}>
              <TableCell>{spend.SpendingID}</TableCell>
              <TableCell>{spend.Description}</TableCell>
              <TableCell>${spend.Amount}</TableCell>
              <TableCell>{spend.SpendDate}</TableCell>
              <TableCell>{spend.Account.AccountName}</TableCell>
              <TableCell>{spend.Account.AccountType}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end items-center gap-4 mt-4 text-sm font-medium">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-sm border border-gray-600 hover:from-gray-600 hover:to-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <span className="text-gray-700 dark:text-gray-300">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
        </span>
        
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-sm border border-gray-600 hover:from-gray-600 hover:to-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
      </>
      )}
    </div>
  )
}