// app/api/export-csv/route.ts
import { PassThrough } from 'stream';
import { createObjectCsvStringifier } from 'csv-writer';
import { NextResponse } from 'next/server';

// Define your response shape
interface SpendingApiResponse {
  page: number;
  pageSize: number;
  totalCount: string;
  totalPages: number | string;
  data: Array<{
    SpendingID: string;
    Amount: string;
    Description: string;
    SpendDate: string;
    Account?: {
      AccountID: string;
      AccountCode: string;
      AccountName: string;
      AccountType: string;
    };
  }>;
}

export async function GET() {
  const pageSize = 10000;
  let currentPage = 1;
  let totalPages = 0;

  // Create CSV stringifier
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'SpendingID', title: 'Spending ID' },
      { id: 'Amount', title: 'Amount' },
      { id: 'Description', title: 'Description' },
      { id: 'SpendDate', title: 'Spend Date' },
      { id: 'AccountCode', title: 'Account Code' },
      { id: 'AccountName', title: 'Account Name' },
      { id: 'AccountType', title: 'Account Type' },
    ],
  });

  // We will accumulate CSV rows as a string here
  let csvData = csvStringifier.getHeaderString();

  try {
    // Fetch first page to get totalPages
    const firstResponse = await fetch(`http://localhost:8080/spending/index?page=${currentPage}&pageSize=${pageSize}`);
    if (!firstResponse.ok) {
      throw new Error(`API error: ${firstResponse.status}`);
    }
    const firstJson = (await firstResponse.json()) as SpendingApiResponse;

    totalPages = typeof firstJson.totalPages === 'string'
      ? parseInt(firstJson.totalPages, 10)
      : firstJson.totalPages;

    // Add first page records
    const firstRecords = firstJson.data.map((item) => ({
      SpendingID: item.SpendingID,
      Amount: item.Amount,
      Description: item.Description,
      SpendDate: item.SpendDate,
      AccountCode: item.Account?.AccountCode || '',
      AccountName: item.Account?.AccountName || '',
      AccountType: item.Account?.AccountType || '',
    }));

    csvData += csvStringifier.stringifyRecords(firstRecords);

    currentPage++;

    // Loop through remaining pages
    while (currentPage <= totalPages) {
      const response = await fetch(`http://localhost:8080/spending/index?page=${currentPage}&pageSize=${pageSize}`);

      if (!response.ok) {
        throw new Error(`API error on page ${currentPage}: ${response.status}`);
      }

      const json = (await response.json()) as SpendingApiResponse;

      const records = json.data.map((item) => ({
        SpendingID: item.SpendingID,
        Amount: item.Amount,
        Description: item.Description,
        SpendDate: item.SpendDate,
        AccountCode: item.Account?.AccountCode || '',
        AccountName: item.Account?.AccountName || '',
        AccountType: item.Account?.AccountType || '',
      }));

      csvData += csvStringifier.stringifyRecords(records);

      currentPage++;
    }

    // Return CSV response
    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="spending-data.csv"',
      },
    });
  } catch (error) {
    console.error('CSV export failed:', error);
    return new Response('Error generating CSV', { status: 500 });
  }
}
