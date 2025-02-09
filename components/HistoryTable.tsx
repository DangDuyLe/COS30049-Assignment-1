'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight, Download, Copy } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { formatEther } from 'ethers'


interface Transaction {
  hash: string
  method: string
  block: string
  age: string
  from: string
  to: string
  amount: string
  fee: string
  timestamp: number
}

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY

const knownMethods: { [key: string]: string } = {
  '0xa9059cbb': 'Transfer',
  '0x23b872dd': 'TransferFrom',
  '0x095ea7b3': 'Approve',
  '0x70a08231': 'BalanceOf',
  '0x18160ddd': 'TotalSupply',
  '0x313ce567': 'Decimals',
  '0x06fdde03': 'Name',
  '0x95d89b41': 'Symbol',
  '0xd0e30db0': 'Deposit',
  '0x2e1a7d4d': 'Withdraw',
  '0x3593564c': 'Execute',
  '0x4a25d94a': 'SwapExactTokensForTokens',
  '0x7ff36ab5': 'SwapExactETHForTokens',
  '0x791ac947': 'SwapExactTokensForETH',
  '0xfb3bdb41': 'SwapETHForExactTokens',
  '0x5c11d795': 'SwapTokensForExactTokens',
  '0xb6f9de95': 'Claim',
  '0x6a627842': 'Mint',
  '0xa0712d68': 'Mint',
}

export default function TransactionExplorer() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const getTransactionMethod = (input: string): string => {
    if (input === '0x') return 'Transfer'
    const functionSelector = input.slice(0, 10).toLowerCase()
    return knownMethods[functionSelector] || 'Swap'
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp * 1000
    if (diff < 0) return "Just now"
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds} secs ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hrs ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const fetchLatestTransactions = useCallback(async () => {
    if (!ETHERSCAN_API_KEY) {
      console.error('Etherscan API key is not set')
      return
    }

    try {
      setIsLoading(true)
      const latestBlockResponse = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`
      )
      const latestBlockData = await latestBlockResponse.json()
      const latestBlock = parseInt(latestBlockData.result, 16)

      const response = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=true&apikey=${ETHERSCAN_API_KEY}`
      )
      const data = await response.json()

      if (data.result && data.result.transactions) {
        const formattedTransactions = await Promise.all(
          data.result.transactions.slice(0, 50).map(async (tx: any) => {
            const timestamp = parseInt(data.result.timestamp, 16)
            return {
              hash: tx.hash,
              method: getTransactionMethod(tx.input),
              block: parseInt(tx.blockNumber, 16).toString(),
              age: getRelativeTime(timestamp),
              from: tx.from,
              to: tx.to || 'Contract Creation',
              amount: formatEther(tx.value) + ' ETH',
              fee: formatEther(BigInt(tx.gas) * BigInt(tx.gasPrice)),
              timestamp: timestamp
            }
          })
        )
        setTransactions(formattedTransactions)
        setTotalPages(Math.ceil(formattedTransactions.length / 10))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: "Error fetching transactions",
        description: "Failed to fetch latest transactions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLatestTransactions()
    const interval = setInterval(fetchLatestTransactions, 150000) // Refresh every 2.5 minutes
    return () => clearInterval(interval)
  }, [fetchLatestTransactions])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: "Failed to copy",
        description: "An error occurred while copying the text.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const headers = ['Transaction Hash', 'Method', 'Block', 'Age', 'From', 'To', 'Amount', 'Txn Fee']
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx =>
        [
          tx.hash,
          tx.method,
          tx.block,
          tx.age,
          tx.from,
          tx.to,
          tx.amount,
          tx.fee,
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'ethereum_transactions.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMethodClick = (method: string) => {
    setSelectedMethod(method === selectedMethod ? null : method)
  }

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mb-4 md:mb-0">
            <p className="text-primary">Latest {transactions.length} transactions</p>
            <p className="text-muted-foreground text-sm">(Auto-updating)</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              {!isMobile && "Download Data"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center min-w-[120px] h-9 px-3 bg-muted text-muted-foreground rounded-md">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Txn Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : (
                transactions.slice((currentPage - 1) * 10, currentPage * 10).map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-0">
                      <div className="flex items-center justify-center h-full">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Link href={`/transaction/${tx.hash}`} className="hover:underline">
                          {truncateAddress(tx.hash)}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(tx.hash)}
                          className="h-5 w-5 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleMethodClick(tx.method)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedMethod === tx.method
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {tx.method}
                      </button>
                    </TableCell>
                    <TableCell>{tx.block}</TableCell>
                    <TableCell>{tx.age}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${tx.from}`} className="hover:underline">
                          {truncateAddress(tx.from)}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(tx.from)}
                          className="h-5 w-5 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link href={`/address/${tx.to}`} className="hover:underline">
                          {truncateAddress(tx.to)}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(tx.to)}
                          className="h-5 w-5 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx.fee}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          A transaction is a cryptographically signed instruction that changes the blockchain state.
          Block explorers track the details of all transactions in the network.
        </p>

        <Button
          variant="link"
          className="mt-4 text-primary hover:text-primary/80"
          onClick={scrollToTop}
        >
          Back to Top
        </Button>
      </div>
    </div>
  )
}
// Utility functions
const formatAmount = (amount: string) => {
  if (!amount) return '0 ETH';
  const value = parseFloat(amount);
  return `${value.toFixed(6)} ETH`;
};

const formatFee = (fee: string) => {
  if (!fee) return '0';
  const value = parseFloat(fee);
  return value.toFixed(6);
};
                      


                 