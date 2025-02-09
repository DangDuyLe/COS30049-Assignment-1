"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import axios from 'axios'

interface FilterPanelProps {
  address: string;
  onFilterChange: (filters: FilterValues) => void;
  onAnalysisAction: (action: 'selectAll' | 'copyAddresses') => void;
}

interface FilterValues {
  txType: string;
  addressType: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
}

interface AnalysisData {
  sender: string;
  txn: string;
  eth: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  method: string;
  block: string;
  fee: string;
}

export default function FilterPanel({ address, onFilterChange, onAnalysisAction }: FilterPanelProps) {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    txType: 'all',
    addressType: 'all',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  })

  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 3

  useEffect(() => {
    fetchAnalysisData()
  }, [address, filterValues])

  const fetchAnalysisData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/address/${address}/transactions`, { params: filterValues })
      const transactions = response.data.data
      const analysisData = processTransactionsForAnalysis(transactions)
      setAnalysisData(analysisData)
    } catch (error) {
      console.error('Error fetching analysis data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processTransactionsForAnalysis = (transactions: Transaction[]): AnalysisData[] => {
    const senderMap = new Map<string, { txn: number; eth: number }>()
    
    transactions.forEach(tx => {
      if (tx.from !== address.toLowerCase()) {
        const sender = senderMap.get(tx.from) || { txn: 0, eth: 0 }
        sender.txn += 1
        sender.eth += parseFloat(tx.value)
        senderMap.set(tx.from, sender)
      }
    })

    return Array.from(senderMap, ([sender, data]) => ({
      sender,
      txn: data.txn.toString(),
      eth: data.eth.toFixed(4)
    }))
  }

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filterValues, [key]: value }
    setFilterValues(newFilters)
    onFilterChange(newFilters)
  }

  const handleViewTransactions = async (sender: string) => {
    try {
      const response = await axios.get(`/api/address/${address}/transactions`, {
        params: { ...filterValues, sender }
      })
      setSelectedTransactions(response.data.data)
      setShowTransactionDetails(true)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching transaction details:', error)
    }
  }

  const totalPages = Math.ceil(selectedTransactions.length / transactionsPerPage)

  const paginatedTransactions = selectedTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  )

  return (
    <div className="w-full lg:w-80 h-full overflow-hidden bg-[#1a2b4b] text-white">
      <div className="h-full overflow-y-auto p-4 space-y-4">
        <Card className="bg-[#1a2b4b] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Select
                onValueChange={(value) => handleFilterChange("txType", value)}
                value={filterValues.txType}
              >
                <SelectTrigger className="bg-[#2c3e50] border-gray-600 text-white">
                  <SelectValue placeholder="All txs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All txs</SelectItem>
                  <SelectItem value="in">IN</SelectItem>
                  <SelectItem value="out">OUT</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => handleFilterChange("addressType", value)}
                value={filterValues.addressType}
              >
                <SelectTrigger className="bg-[#2c3e50] border-gray-600 text-white">
                  <SelectValue placeholder="All addresses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All addresses</SelectItem>
                  <SelectItem value="eoa">EOA</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min amount"
                value={filterValues.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                className="bg-[#2c3e50] border-gray-600 text-white"
              />
              <Input
                placeholder="Max amount"
                value={filterValues.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                className="bg-[#2c3e50] border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filterValues.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-[#2c3e50] border-gray-600 text-white"
              />
              <Input
                type="date"
                value={filterValues.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-[#2c3e50] border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2b4b] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by address/label"
                className="pl-8 bg-[#2c3e50] border-gray-600 text-white"
              />
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-700">
                      <TableHead className="text-gray-400">Show</TableHead>
                      <TableHead className="text-gray-400">Sender</TableHead>
                      <TableHead className="text-gray-400">Txn</TableHead>
                      <TableHead className="text-gray-400">ETH</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisData.map((item, index) => (
                      <TableRow key={index} className="border-b border-gray-700">
                        <TableCell>
                          <input type="checkbox" className="accent-blue-500" />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-mono text-sm text-blue-400 hover:text-blue-300"
                            onClick={() => handleViewTransactions(item.sender)}
                          >
                            {item.sender.slice(0, 6)}...{item.sender.slice(-4)}
                          </Button>
                        </TableCell>
                        <TableCell>{item.txn}</TableCell>
                        <TableCell>{item.eth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-700"
                onClick={() => onAnalysisAction('selectAll')}
              >
                Select all rows
              </Button>
              <Button 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onAnalysisAction('copyAddresses')}
              >
                Copy all addresses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="bg-[#1a2b4b] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction details</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-700">
                <TableHead className="text-gray-400">Time (UTC)</TableHead>
                <TableHead className="text-gray-400">Sender</TableHead>
                <TableHead className="text-gray-400">Recipient</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">TXID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((tx, index) => (
                <TableRow key={index} className="border-b border-gray-700">
                  <TableCell>{new Date(tx.timestamp * 1000).toUTCString()}</TableCell>
                  <TableCell className="font-mono text-sm">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</TableCell>
                  <TableCell className="font-mono text-sm">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</TableCell>
                  <TableCell>{tx.value} ETH</TableCell>
                  <TableCell className="font-mono text-sm">{tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Previous
            </Button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}