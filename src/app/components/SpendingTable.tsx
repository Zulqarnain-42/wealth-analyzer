'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  data: Spending[]
}

export default function SpendingTable({ data }: SpendingTableProps) {
  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p>No data found.</p>
      ) : (
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
      )}
    </div>
  )
}
