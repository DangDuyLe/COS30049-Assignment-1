'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'sgd' | 'web3'>('sgd');

  const switchContent = (tab: 'sgd' | 'web3') => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-black text-white font-sans">
      {/* Header */}
      <header className="flex justify-center items-center bg-black h-16 px-4">
        <div className="text-white mr-auto ml-4 text-2xl font-bold">
          <h1>
            CryptoPath<sub>&copy;</sub>
          </h1>
        </div>
        <nav className="hidden md:flex justify-center items-center space-x-6">
          <Link href="/" className="text-white text-sm uppercase hover:text-blue-500 transition">
            Home
          </Link>
          <Link href="/transactions" className="text-white text-sm uppercase hover:text-blue-500 transition">
            Transactions
          </Link>
          <Link href="/about" className="text-white text-sm uppercase hover:text-blue-500 transition">
            About Us
          </Link>
          <a href="mailto:cryptopath@gmail.com" className="text-white text-sm uppercase hover:text-blue-500 transition">
            Support
          </a>
        </nav>
      </header>

      {/* Description Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Join the all-in-one crypto app in Vietnam
            </h1>
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Email address"
                className="px-4 py-3 w-full md:w-64 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none"
              />
              <button className="bg-white text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-200 transition">
                Try CryptoPath
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
            <video className="max-w-[250px] mx-auto" autoPlay loop muted>
              <source src="/Img/Videos/TradingVideo.webm" type="video/webm" />
              <source src="/Img/Videos/TradingVideo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

 {/* Trade Like a Pro Section */}
 <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Trade like a pro</h1>
        <p className="text-lg mb-12">
          Get the lowest fees, fastest transactions, powerful APIs, and more
        </p>
        <div className="flex justify-center">
          <video className="max-w-full" autoPlay loop muted>
            <source src="/Img/Videos/Trade.mp4" type="video/mp4" />
            <track kind="captions" />
          </video>
        </div>
      </div>


      {/* Dynamic Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="max-w-[250px] mx-auto">
            <Image
              src={activeTab === 'sgd' ? '/Img/Exchange.webp' : '/Img/Web3.webp'}
              width={250}
              height={250}
              alt="CryptoPath Content"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-4xl font-bold mb-4">One Application. Infinite Potential.</h1>
            <p className="text-lg mb-6">
              {activeTab === 'sgd'
                ? "Explore the world's best NFT marketplace, DEX, and wallets supporting all your favorite chains."
                : 'Explore decentralized applications and experience cutting-edge blockchain technology.'}
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <button
                className={`px-4 py-2 rounded-md font-semibold ${
                  activeTab === 'sgd' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
                onClick={() => switchContent('sgd')}
              >
                Exchange
              </button>
              <button
                className={`px-4 py-2 rounded-md font-semibold ${
                  activeTab === 'web3' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
                onClick={() => switchContent('web3')}
              >
                Web3
              </button>
            </div>
          </div>
        </div>
      </div>

     
      {/* Evolution Illustration Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Accompanying You Every Step of the Way</h1>
        <p className="text-lg mb-12">
          From cryptocurrency transactions to your first NFT purchase, CryptoPath will guide you through the entire process.
          <br />
          Believe in yourself and never stop learning.
        </p>
        <div className="flex justify-center">
          <video className="max-w-full" autoPlay loop muted>
            <source src="/Img/Videos/Evolution.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* CryptoPath Introduction and Trusted Leaders Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">What is CryptoPath?</h1>
          <p className="text-lg mb-6">
            Hear from top industry leaders to understand
            <br />
            why CryptoPath is everyone's favorite application.
          </p>
          <button
            id="btn-learnmore"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Learn More
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Video 1: YouTube Embed */}
          <div className="video-container">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/erzVdnTaBKk"
              title="Coach Pep Guardiola"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="p-4">
              <h2 className="text-xl font-bold">What is Cryptocurrency?</h2>
              <p className="text-sm text-gray-400">Explaining the "new currency of the world"</p>
            </div>
          </div>

          {/* Video 2: YouTube Embed */}
          <div className="video-container">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/oD98Jshj1QE"
              title="Redefining the system"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="p-4">
              <h2 className="text-xl font-bold">Redefining the system</h2>
              <p className="text-sm text-gray-400">Welcome to Web3</p>
            </div>
          </div>

          {/* Video 3: YouTube Embed */}
          <div className="video-container">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/sTFZras-1Lo"
              title="What is Blockchain?"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="p-4">
              <h2 className="text-xl font-bold">What is Blockchain?</h2>
              <p className="text-sm text-gray-400">Understand how Blockchain works</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Leaders Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">
            <span>Trusted</span> by industry leaders
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16 text-center">
          <div className="trusted-logo">
            <img
              src="/Img/Trusted Leader/facebook-better.svg"
              alt="Facebook"
              className="mx-auto mb-4 w-12"
            />
            <p className="text-black">Facebook</p>
          </div>
          <div className="trusted-logo">
            <img
              src="/Img/Trusted Leader/apple-better.svg"
              alt="Apple"
              className="mx-auto mb-4 w-12"
            />
            <p className="text-black">Apple</p>
          </div>
          <div className="trusted-logo">
            <img
              src="/Img/Trusted Leader/amazon-better.svg"
              alt="Amazon"
              className="mx-auto mb-4 w-12"
            />
            <p className="text-black">Amazon</p>
          </div>
          <div className="trusted-logo">
            <img
              src="/Img/Trusted Leader/netflix-better.svg"
              alt="Netflix"
              className="mx-auto mb-4 w-12"
            />
            <p className="text-black">Netflix</p>
          </div>
          <div className="trusted-logo">
            <img
              src="/Img/Trusted Leader/google-better.svg"
              alt="Google"
              className="mx-auto mb-4 w-12"
            />
            <p className="text-black">Google</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
          <div>
            <img
              src="/path-to-Minhduy-image.png"
              alt="Minh Duy Nguyen"
              className="w-32 h-32 rounded-full mx-auto"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-lg italic mb-4">
              "CryptoPath is an amazing platform for tracking transactions. I can't even picture what the world would be like without it"
            </p>
            <p className="font-bold text-green-500">Nguyen Minh Duy</p>
            <p>Founder of CryptoPath</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-sm">&copy; 2025 CryptoPath. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="#" className="hover:text-gray-400">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gray-400">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-gray-400">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
