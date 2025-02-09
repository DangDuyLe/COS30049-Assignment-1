'use client'

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams } from 'next/navigation'
import Link from "next/link"
import dynamic from "next/dynamic"
import axios from "axios"
import { ChevronDown, Copy, Eye, Download, ChevronLeft, ChevronRight, MessageCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { Background, Controls, NodeProps, EdgeProps, Handle, Position, MarkerType, Node, Edge, Connection, NodeChange, EdgeChange, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge } from "reactflow"
import "reactflow/dist/style.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import HistoryTable from '@/components/HistoryTable'
import FilterPanel from "@/components/FilterPanel"

const ReactFlow = dynamic(() => import("reactflow"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

const CircleNode: React.FC<NodeProps> = ({ data }) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary" />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
  </div>
)

const StarNode: React.FC<NodeProps> = ({ data }) => (
  <div className="flex items-center justify-center w-28 h-28 cursor-pointer">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary" />
    <svg viewBox="0 0 24 24" className="w-full h-full fill-yellow-400 stroke-yellow-600">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
  </div>
)

const CustomEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`
  
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path cursor-pointer"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
          className="fill-foreground"
        >
          {data?.label}
        </textPath>
      </text>
    </>
  )
}

const nodeTypes = { circle: CircleNode, star: StarNode }
const edgeTypes = { custom: CustomEdge }


interface ApiTransaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  hash?: string;
  block?: string;
  fee?: string;
}

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
  value: string
  id: string
}

interface AddressInfo {
  address: string;
  balance: string;
  totalSent: string;
  totalReceived: string;
  value: string;
  tokenHoldings: { token_symbol: string; amount: string }[];
  privateNameTag?: string;
  firstSeen?: string;
  lastSeen?: string;
  fundedBy?: string;
  gas: string;
  multichainInfo?: string;
}

interface TokenHolding {
  token_name: string
  token_symbol: string
  amount: string
  value: string
}

interface FilterValues {
  txType: string
  addressType: string
  minAmount: string
  maxAmount: string
  startDate: string
  endDate: string
}

interface AnalysisData {
  sender: string
  txn: string
  eth: string
  selected?: boolean
}

export default function WalletAddressPage() {
  const [address, setAddress] = useState("")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: "",
    gas: "",
    balance: "",
    totalSent: "",
    totalReceived: "",
    value: "",
    tokenHoldings: [],
    multichainInfo: "",
  });
  const [txType, setTxType] = useState("all")
  const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
  const [addressType, setAddressType] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"transaction" | "graph">("graph")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Transaction[] | null>(null)
  const [transactionPage, setTransactionPage] = useState(1)
  const [isTokenHoldingsExpanded, setIsTokenHoldingsExpanded] = useState(false)
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<string[]>([])
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([])
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const newAddress = searchParams?.get('address') ?? ''
    if (newAddress) {
      setAddress(newAddress)
      fetchAddressData(newAddress)
      fetchTransactions(newAddress)
    }
  }, [searchParams])

  const fetchTransactions = async (addressToFetch: string, page = 1) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/address/${addressToFetch}/transactions`, {
        params: {
          txType,
          addressType,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          startDate,
          endDate,
          page,
          limit: itemsPerPage
        }
      })

      if (response.data?.success && Array.isArray(response.data.data)) {
        setTransactions(response.data.data)
        setTotalPages(Math.ceil(response.data.total / itemsPerPage))
        setCurrentPage(page)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError("No transactions found for this address.")
          setTransactions([])
        } else if (error.response?.status === 429) {
          setError("Rate limit exceeded. Please try again later.")
        } else if (error.response?.status === 400) {
          setError(error.response.data?.error || "Invalid request parameters.")
        } else {
          setError(error.response?.data?.error || "Failed to fetch transactions. Please try again later.")
        }
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  
  const fetchTransactionData = async (address: string, updateSearched: boolean = false, parentPosition: { x: number, y: number } = { x: 0, y: 0 }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions?address=${address}`);
      const data = await response.json();

      if (data.success) {
        setApiTransactions(data.transactions);
        setCurrentAddress(address.toLowerCase());
        if (updateSearched) {
          setSearchedAddress(address.toLowerCase());
        }

        const newFromNodes: Node[] = [];
        const newToNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const addedFromNodes = new Set(nodes.map((node) => node.id));
        const addedToNodes = new Set(nodes.map((node) => node.id));

        const edgeMap = new Map();

        data.transactions.forEach((tx) => {
          const txFrom = tx.from.toLowerCase();
          const txTo = tx.to.toLowerCase();
          const edgeId = `${txFrom}-${txTo}`;

          if (!addedFromNodes.has(txFrom)) {
            newFromNodes.push({
              id: txFrom,
              type: txFrom === address ? "star" : "circle",
              position: txFrom === address.toLowerCase() ? parentPosition : { x: parentPosition.x - 200, y: parentPosition.y + Math.random() * 500 },
              data: { label: `${txFrom.slice(0, 6)}...${txFrom.slice(-4)}` }
            });
            addedFromNodes.add(txFrom);
          }

          if (!addedToNodes.has(txTo)) {
            newToNodes.push({
              id: txTo,
              type: txTo === address ? "star" : "circle",
              position: txTo === address.toLowerCase() ? parentPosition : { x: parentPosition.x + 200, y: parentPosition.y + Math.random() * 500 },
              data: { label: `${txTo.slice(0, 6)}...${txTo.slice(-4)}` }
            });
            addedToNodes.add(txTo);
          }

          if (edgeMap.has(edgeId)) {
            edgeMap.get(edgeId).totalAmount += tx.amount;
            edgeMap.get(edgeId).transactions.push(tx);
          } else {
            edgeMap.set(edgeId, {
              source: txFrom,
              target: txTo,
              totalAmount: tx.amount,
              transactions: [tx]
            });
          }
        });

        edgeMap.forEach((edgeData, edgeId) => {
          newEdges.push({
            id: `e${edgeId}`,
            source: edgeData.source,
            target: edgeData.target,
            type: "custom",
            data: { label: `${edgeData.totalAmount.toFixed(4)} ETH` },
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#60a5fa", strokeWidth: 3 }
          });
        });

        setNodes((prevNodes) => [...prevNodes, ...newFromNodes, ...newToNodes]);
        setEdges((prevEdges) => [...prevEdges, ...newEdges]);

        const ITEMS_PER_PAGE = 10;
        setTotalPages(Math.ceil(data.transactions.length / ITEMS_PER_PAGE));
      } else {
        setError("Failed to fetch transaction data");
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGraphData = async (addressToFetch: string) => {
    if (!addressToFetch) return
    setIsLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/neo4j-graph-data`, {
        params: { address: addressToFetch }
      })
      if (response.data && response.data.success) {
        const transformedNodes = response.data.nodes.map((node: any) => ({
          id: node.id,
          type: 'circle',
          position: { x: node.x * 100, y: node.y * 100 },
          data: { label: node.label }
        }))
        const transformedEdges = response.data.relationships.map((rel: any) => ({
          id: rel.id,
          source: rel.startNode,
          target: rel.endNode,
          type: 'custom',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#60a5fa", strokeWidth: 3 },
          data: { label: rel.type }
        }))
        setNodes(transformedNodes)
        setEdges(transformedEdges)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error("Error fetching graph data:", error)
      setError("Failed to fetch graph data")
      toast({
        title: "Error",
        description: "Failed to fetch graph data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddressData = async (addressToFetch: string) => {
    if (!addressToFetch) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/address/${addressToFetch}`)
      if (response.data.success && response.data.data) {
        setAddressInfo(response.data.data)
        setTokenHoldings(response.data.data.tokenHoldings || [])
      } else {
        throw new Error(response.data.error || 'Failed to fetch address data')
      }
    } catch (err) {
      let errorMessage = "Failed to fetch address data."
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.error("Error fetching address:", errorMessage)
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleViewChange = (view: "transaction" | "graph") => {
    setActiveView(view)
    setShowFilterPanel(view === "graph")
    if (view === "graph" && nodes.length === 0) {
      fetchGraphData(address)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleMethodClick = (method: string) => {
    setSelectedMethod(method === selectedMethod ? null : method)
  }

  const handleDownload = () => {
    const headers = ["Transaction Hash", "Method", "Block", "Age", "From", "To", "Amount", "Txn Fee"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.hash,
          tx.method,
          tx.block,
          tx.age,
          tx.from,
          tx.to,
          formatAmount(tx.amount),
          formatFee(tx.fee),
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "transaction_data.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatAmount = (amount: string) => {
    const [value, currency] = amount.split(" ")
    const formattedValue = Number(value.replace(/,/g, "")).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formattedValue} ${currency}`
  }

  const formatFee = (fee: string) => {
    return Number(parseFloat(fee).toFixed(6)).toString()
  }

  const handleFilterChange = async (newFilters: FilterValues) => {
    setIsLoading(true)
    try {
      const filtered = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp * 1000)
        const startDate = newFilters.startDate ? new Date(newFilters.startDate) : null
        const endDate = newFilters.endDate ? new Date(newFilters.endDate) : null
        const txValue = parseFloat(tx.value)

        return (
          (newFilters.txType === 'all' || (newFilters.txType === 'in' && tx.to === address) || (newFilters.txType === 'out' && tx.from === address)) &&
          (newFilters.addressType === 'all' || (newFilters.addressType === 'from' && tx.from === address) || (newFilters.addressType === 'to' && tx.to === address)) &&
          (!newFilters.minAmount || txValue >= parseFloat(newFilters.minAmount)) &&
          (!newFilters.maxAmount || txValue <= parseFloat(newFilters.maxAmount)) &&
          (!startDate || txDate >= startDate) &&
          (!endDate || txDate <= endDate)
        )
      })

      setFilteredTransactions(filtered)
      toast({
        title: "Filters Applied",
        description: `Showing ${filtered.length} transactions based on your filters.`,
      })
    } catch (error) {
      console.error("Error applying filters:", error)
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalysisAction = useCallback((action: 'selectAll' | 'copyAddresses') => {
    switch (action) {
      case 'selectAll':
        setAnalysisData(prevData => {
          const allSelected = prevData.every(item => item.selected)
          return prevData.map(item => ({ ...item, selected: !allSelected }))
        })
        toast({
          title: "Selection Updated",
          description: "All rows have been toggled.",
        })
        break
      case 'copyAddresses':
        const uniqueAddresses = [...new Set(analysisData.map(item => item.sender))]
        const addressText = uniqueAddresses.join('\n')
        navigator.clipboard.writeText(addressText)
          .then(() => {
            toast({
              title: "Addresses Copied",
              description: `${uniqueAddresses.length} unique addresses copied to clipboard.`,
            })
          })
          .catch(err => {
            console.error('Failed to copy addresses:', err)
            handleError(err)
          })
        break
      default:
        console.error(`Unknown analysis action: ${action}`)
    }
  }, [analysisData, toast])

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    fetchTransactions(node.id)
  }, [])

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    const relatedTransactions = transactions.filter(
      (tx) => (tx.from === edge.source && tx.to === edge.target) || (tx.from === edge.target && tx.to === edge.source)
    )
  
    if (relatedTransactions.length > 0) {
      setSelectedEdge(relatedTransactions)
      setIsOpen(true)
    }
  }, [transactions])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    setSelectedNode(node)
    if (expandedNodes.includes(node.id)) {
      setNodes((nds) => nds.filter((n) => !n.id.startsWith(`${node.id}-`)))
      setEdges((eds) => eds.filter((e) => !e.source.startsWith(`${node.id}-`) && !e.target.startsWith(`${node.id}-`)))
      setExpandedNodes(expandedNodes.filter((id) => id !== node.id))
    } else {
      const newNodes = [
        {
          id: `${node.id}-1`,
          type: 'circle',
          position: { x: node.position.x + 100, y: node.position.y },
          data: { label: "New Node 1" },
        },
        {
          id: `${node.id}-2`,
          type: 'circle',
          position: { x: node.position.x + 100, y: node.position.y + 100 },
          data: { label: "New Node 2" },
        },
      ]
      const newEdges = [
        { 
          id: `e-${node.id}-1`, 
          source: node.id, 
          target: `${node.id}-1`, 
          type: "custom",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#60a5fa", strokeWidth: 3 }
        },
        { 
          id: `e-${node.id}-2`, 
          source: node.id, 
          target: `${node.id}-2`, 
          type: "custom",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#60a5fa", strokeWidth: 3 }
        },
      ]
      setNodes((nds) => [...nds, ...newNodes])
      setEdges((eds) => [...eds, ...newEdges])
      setExpandedNodes([...expandedNodes, node.id])
    }
  }, [expandedNodes])

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#1a1b1e] text-gray-100">
      {/* Header Section */}
      <div className="bg-[#25262b] p-4 sm:p-6 sm:px-8 lg:px-20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-medium">Address Information</h1>
            <div className="text-sm text-gray-400">
              Gas: <span className="text-white font-medium">{addressInfo.gas} Gwei</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-700" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Address</span>
                <code className="text-sm text-gray-300">{addressInfo.address}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(addressInfo.address)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">Buy</Button>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">Exchange</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-black mb-1">Balance:</p>
                  <p className="text-gray-900">{addressInfo.balance} ETH</p>
                </div>
                <div>
                  <p className="text-black mb-1">Total Sent:</p>
                  <p className="text-gray-900">{addressInfo.totalSent} ETH</p>
                </div>
                <div>
                  <p className="text-black mb-1">Total Received:</p>
                  <p className="text-gray-900">{addressInfo.totalReceived} ETH</p>
                </div>
                <div>
                  <p className="text-black mb-1">Value:</p>
                  <p className="text-gray-900">${addressInfo.value} USD</p>
                </div>
              </div>

              <div>
                <p className="text-black mb-2">TOKEN HOLDINGS:</p>
                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-300 text-gray-700"
                  onClick={() => setIsTokenHoldingsExpanded(!isTokenHoldingsExpanded)}
                >
                  <span>
                    {addressInfo.tokenHoldings.length
                      ? `$${addressInfo.tokenHoldings.reduce((acc, token) => acc + parseFloat(token.amount), 0).toFixed(2)} (${
                          addressInfo.tokenHoldings.length
                        } tokens)`
                      : "No tokens found"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {isTokenHoldingsExpanded && (
                  <div className="mt-2 space-y-2">
                    {addressInfo.tokenHoldings.map((token, index) => (
                      <div key={index} className="flex justify-between text-gray-700">
                        <span>{token.token_symbol}</span>
                        <span>{token.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900">More Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-black">Private name tag:</span>
                <span className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded">
                  {addressInfo.privateNameTag || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">First seen:</span>
                <span className="text-gray-900">{addressInfo.firstSeen || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Last seen:</span>
                <span className="text-gray-900">{addressInfo.lastSeen || "N/A"}</span>
              </div>
              <div>
                <span className="text-black">Funded by:</span>
                <Link href={`/wallet_address?address=${addressInfo.fundedBy}`} className="ml-2 text-blue-400 hover:underline">
                  {addressInfo.fundedBy || "N/A"}
                </Link>
              </div>
              {addressInfo.multichainInfo && (
                <div>
                  <span className="text-black">Multichain info:</span>
                  <span className="ml-2 bg-orange-600/20 text-orange-400 px-3 py-1 rounded">
                    {addressInfo.multichainInfo}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="bg-[#25262b]">
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-blue-600">
              Transaction Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <div className="bg-white rounded-lg overflow-hidden">
              <HistoryTable
                transactions={transactions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onMethodClick={setSelectedMethod}
                selectedMethod={selectedMethod}
                copyToClipboard={copyToClipboard}
                handleDownload={() => {}}
                isMobile={isMobile}
              />
            </div>
          </TabsContent>

          <TabsContent value="graph" className="mt-6">
            <div className="flex gap-6">
              <div className="flex-1 h-[600px] bg-white rounded-lg overflow-hidden">
                <ReactFlow
                  nodes={[]}
                  edges={[]}
                  fitView
                >
                  <Background />
                </ReactFlow>
              </div>
              
              <div className="w-80">
                <FilterPanel
                  address={addressInfo.address}
                  onFilterChange={() => {}}
                  onAnalysisAction={() => {}}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}