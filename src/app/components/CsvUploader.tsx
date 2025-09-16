"use client";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Line,Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
import HalfDoughnutChart from "./HalfDoughnutChart";
import { useMemo } from "react";


export default function CsvUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [csvText, setCsvText] = useState<string | null>(null);
    const [csvData, setCsvData] = useState<any[] | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [dateFilter, setDateFilter] = useState<string>("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    const pageSize = 10;
    useEffect(() => { setCurrentPage(1); }, [categoryFilter, dateFilter]);
        
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        if (selectedFile.type !== "text/csv") {
            alert("Please upload a CSV file.");
            return;
        }
        
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target?.result;
            if (typeof text === "string") {
                setCsvText(text);
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const normalized = results.data.map((row: any) => {
                            const newRow: any = {};
                            Object.keys(row).forEach(key => {
                                newRow[key.trim()] = row[key];
                            });
                            return newRow;
                        });
                        setCsvData(normalized);
                    },
                });
            }
        };
        reader.readAsText(selectedFile);
    };
    
    const uniqueCategories = useMemo(() => {
        if (!csvData) return [];
        const cats = Array.from(new Set(csvData.map(row => row.Category).filter(Boolean)));
        return cats;
    }, [csvData]);

    const uniqueDates = useMemo(() => {
        if (!csvData) return [];
        const dates = Array.from(new Set(csvData.map(row => row.Date).filter(Boolean)));
        return dates.sort();
    }, [csvData]);

    const filteredData = useMemo(() => {
        if (!csvData) return [];
        return csvData.filter(row => {
            const catMatch = categoryFilter === "All" || row.Category === categoryFilter;
            const dateMatch = dateFilter === "All" || row.Date === dateFilter;
            return catMatch && dateMatch;
        });
    }, [csvData, categoryFilter, dateFilter]);

    const getLineChartData = () => {
        if (!csvData) return { labels: [], datasets: [] };
        const dateMap: Record<string, number> = {};
        csvData.forEach(row => {
            const date = row.Date?.trim();
            const amount = parseFloat(row.Amount);
            if (!date || isNaN(amount)) return;
            dateMap[date] = (dateMap[date] || 0) + amount;
        });
        
        const sortedDates = Object.keys(dateMap).sort();
        const amounts = sortedDates.map(date => dateMap[date]);
        
        return {
            labels: sortedDates,
            datasets: [
                {
                    label: "Total Amount by Date",
                    data: amounts,
                    fill: false,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.3)",
                    tension: 0.2,
                },
            ],
        };
    };

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    const getAmountIncome = () => {
        if (!csvData) return 0;
        return csvData.reduce((sumincome, row) => {
            const value = parseFloat(row.Amount);
            if (row.Category === "Salary" || row.Category === "Bonus" || row.Category === "Side Income") sumincome += (isNaN(value) ? 0 : value);
            return sumincome;
        }, 0);
    };
    
    
    const getAmountExpenses = () => {
        if (!csvData) return 0;
        return csvData.reduce((sumexpenses, row) => {
            const value = parseFloat(row.Amount);
            if (row.Category === "Expense") sumexpenses += (isNaN(value) ? 0 : value);
            return sumexpenses;
        }, 0);
    };

    const getLabels = () => {
        if (!csvData) return [];
        const labels = Array.from(new Set(csvData.map(row => row.Category).filter(Boolean)));
        return labels;
    }

    const getAmountLoans  = () => {
        if (!csvData) return 0;
        return csvData.reduce((sumloans, row) => {
            const value = parseFloat(row.Amount);
            if (row.Category === "Loans") sumloans += (isNaN(value) ? 0 : value);
            return sumloans;
        }, 0);
    };

    const getAmountInvestments  = () => {
        if (!csvData) return 0;
        return csvData.reduce((suminvestments, row) => {
            const value = parseFloat(row.Amount);
            if (row.Category === "Investments") suminvestments += (isNaN(value) ? 0 : value);
            return suminvestments;
        }, 0);
    };
    

    const getFilteredCategoryTotal = () => {
        if (!filteredData || filteredData.length === 0) return 0;
        return filteredData.reduce((sum, row) => {
            const value = parseFloat(row.Amount);
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    };

    const getFinancialScore = () => {
        if (!csvData) return 0;
        const expenses = getAmountExpenses();
        const income = getAmountIncome();
        const financialScore = (expenses / income) * 100;
        return financialScore;
    }

    const score = getFinancialScore();
    const getScoreColor = (score: number) => {
        if (score < 50) return "#dc2626"; 
        if (score < 70) return "#eab308"; 
        return "#16a34a"; 
    };
    
    const chartData = {
        labels: ["Score", "Remaining"],
        datasets: [
            {
                data: [score, 100 - score],
                backgroundColor: [getScoreColor(score), "#E0E0E0"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        rotation: -90,
        circumference: 180,
        cutout: "70%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
    };

    const getSavings = () => {
        if (!csvData) return 0;
        const expenses = getAmountExpenses();
        const income = getAmountIncome();
        const savings = income - expenses;
        return savings;
    }

    return (
    <div>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2"/>
        {csvData && ( 
            <div className="mt-4">
                <h3 className="font-bold mb-2">Parsed CSV Preview:</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <div className="bg-white shadow rounded border-l-4 border-green-500 p-6">
                        <h5 className="text-green-600 text-lg font-semibold mb-2">Total Expenses</h5>
                        <p id="today-count" className="text-5xl font-bold text-gray-900">{getAmountExpenses()}</p>
                    </div>
                    <div className="bg-white shadow rounded border-l-4 border-yellow-500 p-6">
                        <h5 className="text-yellow-600 text-lg font-semibold mb-2">Total Income</h5>
                        <p id="week-count" className="text-5xl font-bold text-gray-900">{getAmountIncome()}</p>
                    </div>
                    <div className="bg-white shadow rounded border-l-4 border-blue-500 p-6">
                        <h5 className="text-blue-600 text-lg font-semibold mb-2">Financial Score</h5>
                        <p id="month-count" className="text-5xl font-bold text-gray-900">{Math.round(getFinancialScore() * 100) / 100}</p>
                    </div>
                    <div className="bg-white shadow rounded border-l-4 border-blue-500 p-6">
                        <h5 className="text-blue-600 text-lg font-semibold mb-2">Savings</h5>
                        <p id="completed-count" className="text-5xl font-bold text-gray-900">{getSavings()}</p>
                    </div>
                    <div className="bg-white shadow rounded border-l-4 border-purple-500 p-6">
                        <h5 className="text-purple-600 text-lg font-semibold mb-2">Total Investments</h5>
                        <p id="total-count" className="text-5xl font-bold text-gray-900">{getAmountInvestments()}</p>
                    </div>
                    <div className="bg-white shadow rounded border-l-4 border-red-500 p-6">
                        <h5 className="text-red-600 text-lg font-semibold mb-2">Total Loans</h5>
                        <p id="total-count" className="text-5xl font-bold text-gray-900">{getAmountLoans()}</p>
                    </div>  
                </div>
                
            </div>
        )}
        
        {csvData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div className="bg-white shadow rounded p-6 flex flex-col items-center">
                    <h5 className="text-blue-600 text-lg font-semibold mb-2">Financial Score</h5>
                    <HalfDoughnutChart data={chartData} options={chartOptions} width={200} height={100} />
                    <p className={`text-3xl font-bold mt-2 ${score < 50 ? "text-red-600" : score < 70 ? "text-yellow-500" : "text-green-600"}`}>
                        {score.toFixed(2)}%
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Expenses vs Income</h3>
                    <div className="flex-1 flex items-center justify-center">
                        <Pie data={{
                            labels: getLabels(),
                            datasets: [
                                {
                                    data: [getAmountExpenses(), getAmountIncome(),getAmountInvestments(),getAmountLoans(),getSavings()],
                                    backgroundColor: [
                                        "rgba(255, 99, 132, 0.7)",
                                        "rgba(54, 162, 235, 0.7)",
                                        "rgba(255, 206, 86, 0.7)",
                                        "rgba(75, 192, 192, 0.7)",
                                        "rgba(165, 159, 75, 0.7)",
                                    ],
                                    borderColor: [
                                        "rgba(255, 99, 132, 1)",
                                        "rgba(54, 162, 235, 1)",
                                        "rgba(255, 206, 86, 0.7)",
                                        "rgba(75, 192, 192, 0.7)",
                                        "rgba(165, 159, 75, 0.7)",
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        }} />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Line Chart by Date
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                        <Line data={getLineChartData()} />
                    </div>
                </div>
            </div>
        )}
        
        
        {csvData && ( 
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown by Category</h3>
                <div className="flex flex-wrap gap-6 mb-6 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option className="bg-gray-900 text-white" value="All">All</option>
                            {uniqueCategories.map((cat) => (
                                <option key={cat} className="bg-gray-900 text-white" value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option className="bg-gray-900 text-white" value="All">All</option>
                            {uniqueDates.map((date) => (
                                <option key={date} className="bg-gray-900 text-white" value={date}>{date}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="mb-4 text-sm font-medium text-gray-300">Total Amount for{" "}
                    <span className="font-semibold text-white">
                        {categoryFilter === "All" ? "All Categories" : categoryFilter}
                    </span>
                    :{" "}
                    <span className="text-blue-400 font-semibold">
                        {getFilteredCategoryTotal()}
                    </span>
                </div>
                
                <div className="overflow-auto max-h-[28rem] border border-gray-700 rounded-lg shadow-sm">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-800 text-xs uppercase text-gray-400 sticky top-0 z-10">
                            <tr>
                                {csvData[0] &&
                                Object.keys(csvData[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 border-b border-gray-700">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                            <td colSpan={csvData[0] ? Object.keys(csvData[0]).length : 1} className="text-center py-6 text-gray-500">No data found.</td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                            <tr key={idx} className="even:bg-gray-900 hover:bg-gray-700 transition-colors">
                                {Object.keys(row).map((key) => (
                                <td key={key} className="px-4 py-2 border-b border-gray-700">{row[key]}</td>
                                ))}
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-2 text-gray-300 text-xs">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} 
                    className="px-3 py-1 rounded bg-gray-800 border border-gray-700 mr-2 disabled:opacity-50">
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} 
                    className="px-3 py-1 rounded bg-gray-800 border border-gray-700 ml-2 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        )}
    </div>
    );
}