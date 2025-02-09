'use client'
import { Send, MessageCircle, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Clock, Search, Facebook, Twitter, Instagram, Twitch, Youtube } from "lucide-react"
import Image from 'next/image'

export default function TransactionPage() {
  return (
    <div className="min-h-screen bg-[#1C2128] text-white flex flex-col font-exo2">

      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header section with transaction details and market info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold font-quantico">Transaction details</h2>
              <span className="text-[#F5B056] font-bold">JCO</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-400">JCO: $5,000,000 (+1.26%)</span>
              <span className="text-blue-400">Gas: 9.582 Gwei</span>
            </div>
          </div>
          {/* Empty div, possibly for future use */}
          <div className="relative w-full max-w-lg mx-auto">

          </div>

          {/* Navigation buttons */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base">
                Overview
              </Button>
              <Button variant="default" className="bg-[#F5B056] hover:bg-yellow-600 text-white">
                State
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
                Buy
              </Button>
              <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
                Exchange
              </Button>
            </div>
          </div>

          {/* Transaction details card */}
          <Card className="bg-[#F0F0F0] text-gray-800 rounded-lg overflow-hidden border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-300">
                  <span className="text-gray-600 text-sm sm:text-base">Transaction Hash:</span>
                  <span className="text-blue-600 break-all text-xs sm:text-sm">0x68ae22fdax5bxx8472axxxxxxxxxxxx281940506274569902182900xxa</span>
                </div>
                {/* Transaction Status */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Status:</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="mr-1" size={16} /> Success
                  </span>
                </div>
                {/* Block Number */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Block:</span>
                  <span className="text-blue-600">22102231</span>
                </div>
                {/* Timestamp */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="flex items-center">
                    <Clock className="mr-1" size={16} />
                    17 days 12 hours ago (Sep-04-2024 10:22:01 AM +UTC)
                  </span>
                </div>
                {/* From Address */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-300">
                  <span className="text-gray-600">From:</span>
                  <Link href="/wallet_address" className="text-blue-600 break-all">0x68ae22fdax5bxx050627456902182900xxa</Link>
                </div>
                {/* To Address */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Interacted with (to):</span>
                  <span className="text-blue-600 break-all">SwinContact (0x22ae1234fdax5bxx050627893217218290xxa)</span>
                </div>
                {/* Transaction Value */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Value:</span>
                  <span>0.05 &lt;coins' name&gt; ($110.78 USD)</span>
                </div>
                {/* Transaction Fee */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Transaction fee:</span>
                  <span>0.000001 &lt;coins' name&gt; ($0.67 USD)</span>
                </div>
                {/* Gas Fee */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Gas fee:</span>
                  <span>9.582 Gwei</span>
                </div>
                {/* Private Note */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600">Private note:</span>
                  <span className="italic text-gray-500">To access the Private Note feature, you must be Logged in.</span>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}