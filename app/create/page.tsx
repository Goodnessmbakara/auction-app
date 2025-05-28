// app/create/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Upload, Sparkles, Loader2 } from "lucide-react";
import { useAccount, useChainId, useWalletClient, usePublicClient, useContractWrite, useContractRead } from "wagmi";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { compressImage } from "@/lib/image-compression";
import { raleway, poppins } from "@/lib/fonts";
import { useRouter } from "next/navigation";
import { parseEther, formatEther, keccak256, toBytes } from "viem";

// Define the form data interface
interface AuctionFormData {
  title: string;
  description: string;
  category: string;
  startingBid: number;
  duration: number;
  image: File | null;
  imageUrl?: string;
  sellerName?: string;
}

// Import the ABI from artifacts
const AuctionFactoryABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "auction",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "AuctionCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_ipfsImageHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_startingBid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_duration",
        "type": "uint256"
      }
    ],
    "name": "createAuction",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Auction ABI (aligned with Auction.sol)
const AuctionABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_cid",
        type: "string",
      },
    ],
    name: "setMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bid",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "endAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuctionDetails",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "NewHighestBid",
    type: "event",
  },
];

export default function CreateAuctionPage() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const router = useRouter();
  const AUCTION_FACTORY_ADDRESS = "0xa931521EaE3C20ed274e8158ebAAB2b990E33D3C";

  // Prepare contract write
  const { writeContractAsync } = useContractWrite();

  // Add contract verification
  useEffect(() => {
    let mounted = true;

    const verifyContract = async () => {
      if (!publicClient || !AUCTION_FACTORY_ADDRESS || !mounted) return;
      
      try {
        const code = await publicClient.getBytecode({
          address: AUCTION_FACTORY_ADDRESS as `0x${string}`
        });
        if (mounted) {
          console.log('Contract Verification:', {
            hasCode: !!code,
            codeLength: code?.length,
            address: AUCTION_FACTORY_ADDRESS,
            chainId: await publicClient.getChainId()
          });
        }
      } catch (error) {
        if (mounted) {
          console.error('Contract Verification Error:', error);
        }
      }
    };

    verifyContract();

    return () => {
      mounted = false;
    };
  }, [publicClient, AUCTION_FACTORY_ADDRESS]);

  // Add event listener for ValueDetails
  useEffect(() => {
    let mounted = true;
    let unwatch: (() => void) | undefined;

    const setupEventListener = async () => {
      if (!publicClient || !AUCTION_FACTORY_ADDRESS || !mounted) return;

      try {
        unwatch = publicClient.watchEvent({
          address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'AuctionCreated',
            inputs: [
              { type: 'address', name: 'auction', indexed: true },
              { type: 'address', name: 'seller', indexed: true }
            ]
          },
          onLogs: (logs) => {
            if (mounted) {
              console.log('Auction Created Event:', {
                auction: logs[0].args.auction,
                seller: logs[0].args.seller
              });
            }
          }
        });
      } catch (error) {
        if (mounted) {
          console.error('Error setting up event listener:', error);
        }
      }
    };

    setupEventListener();

    return () => {
      mounted = false;
      if (unwatch) {
        unwatch();
      }
    };
  }, [publicClient, AUCTION_FACTORY_ADDRESS]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    step: "uploading" | "creating" | "complete" | null;
    message: string;
    hash?: string;
  }>({ step: null, message: "" });


  useEffect(() => {
    if (!AUCTION_FACTORY_ADDRESS) {
      console.error("Auction Factory address is not configured");
      toast({
        title: "Configuration Error",
        description: "Auction Factory address is not configured. Please check your environment variables.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const [formData, setFormData] = useState<AuctionFormData>({
    title: "",
    description: "",
    category: "",
    startingBid: 0.1,
    duration: 1,
    image: null,
    imageUrl: "",
    sellerName: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "startingBid" ? Math.max(0, Number(value) || 0) : value,
    }));
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setFormData((prev) => ({ ...prev, image: compressedFile }));

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setImagePreview(base64Data);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await handleImageChange(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop an image file.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = () => {
    console.log('Form validation:', {
      title: formData.title.trim() !== "",
      description: formData.description.trim() !== "",
      category: formData.category !== "",
      startingBid: formData.startingBid >= 0.1,
      duration: formData.duration >= 1,
      image: formData.image instanceof File,
      formData: formData
    });
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.category !== "" &&
      formData.startingBid >= 0.1 &&
      formData.duration >= 1 &&
      formData.image instanceof File
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting auction creation...', {
      isConnected,
      address,
      hasWalletClient: !!walletClient,
      hasPublicClient: !!publicClient,
      contractAddress: AUCTION_FACTORY_ADDRESS,
      chainId: await publicClient?.getChainId()
    });

    if (!isConnected || !address || !walletClient) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create an auction",
        variant: "destructive",
      });
      return;
    }

    // Wait for wallet client to be fully initialized
    if (!walletClient) {
      console.log('Waiting for wallet client to initialize...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!walletClient) {
        toast({
          title: "Wallet Error",
          description: "Wallet client not initialized. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!AUCTION_FACTORY_ADDRESS) {
      toast({
        title: "Configuration Error",
        description: "Auction Factory address is not configured",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Invalid Form",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setTransactionStatus({ step: 'uploading', message: 'Uploading image to IPFS...' });

      // 1. First upload the image to IPFS
      let imageCid = '';
      if (formData.image) {
        const formDataImage = new FormData();
        formDataImage.append('image', formData.image);
        const imageResponse = await fetch('/api/ipfs/upload-image', {
          method: 'POST',
          body: formDataImage,
        });
        if (!imageResponse.ok) {
          throw new Error('Failed to upload image to IPFS');
        }
        const imageData = await imageResponse.json();
        imageCid = imageData.cid;
        setTransactionStatus({ step: 'creating', message: 'Image uploaded successfully. Please sign the transaction to create auction...' });
      }

      if (!publicClient || !walletClient) {
        throw new Error('Client not initialized');
      }

      const balance = await publicClient.getBalance({ address });
      const startingBid = parseEther(formData.startingBid.toString());
      const durationInSeconds = BigInt(formData.duration * 24 * 60 * 60);

      console.log('Transaction Values:', {
        formDataStartingBid: formData.startingBid,
        parsedStartingBid: startingBid.toString(),
        startingBidInWei: startingBid.toString(),
        balance: formatEther(balance),
        hasEnoughBalance: balance >= startingBid,
        contractAddress: AUCTION_FACTORY_ADDRESS
      });

      // Get gas price using the correct method
      const gasPrice = await publicClient.getGasPrice();
      const maxPriorityFeePerGas = await publicClient.estimateMaxPriorityFeePerGas();

      // Ensure minimum gas price
      const minGasPrice = 25n; // 25 gwei
      const minPriorityFee = 1n; // 1 gwei
      
      let adjustedGasPrice = gasPrice < minGasPrice ? minGasPrice : gasPrice;
      let adjustedPriorityFee = maxPriorityFeePerGas < minPriorityFee ? minPriorityFee : maxPriorityFeePerGas;

      console.log('Gas Parameters:', {
        originalGasPrice: gasPrice.toString(),
        originalPriorityFee: maxPriorityFeePerGas.toString(),
        adjustedGasPrice: adjustedGasPrice.toString(),
        adjustedPriorityFee: adjustedPriorityFee.toString(),
        minGasPrice: minGasPrice.toString(),
        minPriorityFee: minPriorityFee.toString()
      });

      // Validate parameters before sending
      if (!formData.title || !imageCid) {
        throw new Error('Missing required parameters: title or image CID');
      }

      // Log the exact parameters being sent to the contract
      const contractParams = {
        title: formData.title,
        imageCid,
        startingBid: startingBid.toString(),
        duration: durationInSeconds.toString(),
        value: startingBid.toString(),
        contractAddress: AUCTION_FACTORY_ADDRESS,
        sender: address
      };
      console.log('Contract Parameters:', contractParams);

      // Add balance check before transaction
      console.log('Balance Check:', {
        balance: formatEther(balance),
        startingBid: formatEther(startingBid),
        hasEnoughBalance: balance >= startingBid
      });

      if (balance < startingBid) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${formData.startingBid} AVAX to create this auction. Your current balance is ${formatEther(balance)} AVAX.`,
          variant: "destructive",
        });
        return;
      }

      // Add retry logic for transaction
      const maxRetries = 3;
      let retryCount = 0;
      let hash;

      while (retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1} to send transaction...`);
          
          // First, estimate gas
          const gasEstimate = await publicClient.estimateContractGas({
            address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
            abi: AuctionFactoryABI,
            functionName: 'createAuction',
            args: [
              formData.title,
              imageCid,
              startingBid,
              durationInSeconds
            ],
            value: startingBid,
            account: address
          });

          console.log('Gas estimate:', {
            estimate: gasEstimate.toString(),
            adjusted: (gasEstimate * 120n / 100n).toString() // Add 20% buffer
          });

          // Send transaction with estimated gas
          hash = await writeContractAsync({
            address: AUCTION_FACTORY_ADDRESS as `0x${string}`,
            abi: AuctionFactoryABI,
            functionName: 'createAuction',
            args: [
              formData.title,
              imageCid,
              startingBid,
              durationInSeconds
            ],
            value: startingBid,
            gas: gasEstimate * 120n / 100n, // Add 20% buffer to gas estimate
            maxFeePerGas: adjustedGasPrice + adjustedPriorityFee,
            maxPriorityFeePerGas: adjustedPriorityFee
          });

          console.log('Transaction hash received:', hash);
          break;
        } catch (error: any) {
          console.error(`Transaction attempt ${retryCount + 1} failed:`, {
            error: error.message,
            code: error.code,
            data: error.data,
            transaction: error.transaction
          });
          
          // Check for specific error types
          if (error.message?.includes('insufficient funds')) {
            throw new Error('Insufficient funds to cover gas costs');
          } else if (error.message?.includes('user rejected')) {
            throw new Error('Transaction was rejected by user');
          } else if (error.message?.includes('network changed')) {
            console.log('Network changed, retrying...');
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          } else if (error.message?.includes('Failed to transfer starting bid')) {
            console.log('Transfer failed, retrying with higher gas...');
            // Increase gas price for next attempt
            adjustedGasPrice = adjustedGasPrice * 2n;
            adjustedPriorityFee = adjustedPriorityFee * 2n;
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          retryCount++;
          
          if (retryCount === maxRetries) {
            throw new Error(`Failed to send transaction after ${maxRetries} attempts: ${error.message}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      setTransactionStatus(prev => ({
        ...prev,
        message: `Transaction submitted! Hash: ${hash}`,
        hash
      }));

      // Poll for transaction confirmation with better error handling
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes total (5 seconds * 60 attempts)
      
      while (!receipt && attempts < maxAttempts) {
        try {
          console.log(`Checking transaction status (attempt ${attempts + 1}/${maxAttempts})...`);
          receipt = await publicClient.getTransactionReceipt({ hash });
          
          if (!receipt) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            setTransactionStatus(prev => ({
              ...prev,
              message: `Waiting for confirmation... (Attempt ${attempts}/${maxAttempts})`,
              hash
            }));
          } else {
            console.log('Transaction receipt received:', {
              status: receipt.status,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice?.toString()
            });
          }
        } catch (error: any) {
          console.error('Error checking transaction status:', {
            error: error.message,
            code: error.code,
            data: error.data
          });
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      if (!receipt) {
        throw new Error('Transaction confirmation timed out. Please check your wallet for the transaction status.');
      }

      console.log('Transaction receipt:', receipt);
      
      // Check if transaction was reverted
      if (receipt.status === 'reverted') {
        console.error('Transaction was reverted. Full receipt:', receipt);
        throw new Error('Transaction was reverted by the contract. This usually means there was an error in the contract execution.');
      }

      setTransactionStatus(prev => ({
        ...prev,
        message: `Transaction confirmed! Creating metadata...`,
        hash: receipt.transactionHash
      }));

      // Get the auction address from the event
      console.log('Looking for AuctionCreated event in logs:', receipt.logs);
      
      // First, let's log all event topics to see what we're getting
      receipt.logs.forEach((log, index) => {
        console.log(`Log ${index}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        });
      });

      // Calculate the event signature hash
      const eventSignature = 'AuctionCreated(address,address)';
      const eventHash = keccak256(toBytes(eventSignature));
      console.log('Looking for event hash:', eventHash);

      const auctionCreatedEvent = receipt.logs.find(
        log => {
          console.log('Checking log:', {
            logTopic: log.topics[0],
            eventHash,
            matches: log.topics[0] === eventHash
          });
          return log.topics[0] === eventHash;
        }
      );
      
      if (!auctionCreatedEvent) {
        console.error('Event logs:', receipt.logs);
        throw new Error('AuctionCreated event not found in transaction logs. Please check the contract implementation.');
      }

      // The auction address is the first indexed parameter in the event
      const auctionAddress = auctionCreatedEvent.topics[1];
      console.log('Auction address from event:', auctionAddress);

      // 3. Upload final metadata to IPFS
      setTransactionStatus({
        step: "uploading",
        message: "Uploading metadata to IPFS...",
        hash: receipt.transactionHash,
      });

      const metadata = {
        name: formData.title,
        description: formData.description,
        image: `ipfs://${imageCid}`,
        attributes: {
          category: formData.category,
          startingBid: formData.startingBid,
          currentBid: formData.startingBid,
          endTime: new Date(
            Date.now() + formData.duration * 24 * 60 * 60 * 1000
          ).toISOString(),
          created: new Date().toISOString(),
          sellerAddress: address,
          sellerName: formData.sellerName,
          sellerVerified: false,
          auctionAddress: auctionAddress,
          transactionHash: receipt.transactionHash,
          bids: [],
        },
      };

      const metadataResponse = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      const { cid: metadataCid } = await metadataResponse.json();

      // Update auction metadata using contract write
      const updateHash = await writeContractAsync({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        functionName: 'setMetadata',
        args: [metadataCid],
      });

      // Poll for metadata update confirmation
      let updateReceipt = null;
      attempts = 0;
      
      while (!updateReceipt && attempts < maxAttempts) {
        try {
          updateReceipt = await publicClient.getTransactionReceipt({ hash: updateHash });
          if (!updateReceipt) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            setTransactionStatus(prev => ({
              ...prev,
              message: `Waiting for metadata update confirmation... (Attempt ${attempts}/${maxAttempts})`,
              hash: updateHash
            }));
          }
        } catch (error) {
          console.log('Error checking metadata update status:', error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      if (!updateReceipt) {
        throw new Error('Metadata update confirmation timed out. Please check your wallet for the transaction status.');
      }

      // Transfer ownership
      const ownershipHash = await writeContractAsync({
        address: auctionAddress as `0x${string}`,
        abi: AuctionABI,
        functionName: 'transferOwnership',
        args: [address],
      });

      // Poll for ownership transfer confirmation
      let ownershipReceipt = null;
      attempts = 0;
      
      while (!ownershipReceipt && attempts < maxAttempts) {
        try {
          ownershipReceipt = await publicClient.getTransactionReceipt({ hash: ownershipHash });
          if (!ownershipReceipt) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            setTransactionStatus(prev => ({
              ...prev,
              message: `Waiting for ownership transfer confirmation... (Attempt ${attempts}/${maxAttempts})`,
              hash: ownershipHash
            }));
          }
        } catch (error) {
          console.log('Error checking ownership transfer status:', error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      if (!ownershipReceipt) {
        throw new Error('Ownership transfer confirmation timed out. Please check your wallet for the transaction status.');
      }

      setTransactionStatus({
        step: "complete",
        message: "Auction created successfully!",
        hash: receipt.transactionHash,
      });

      toast({
        title: "Success",
        description: `Auction created successfully! Transaction Hash: ${receipt.transactionHash}`,
      });

      router.push(`/auction/${metadataCid}`);
    } catch (error: any) {
      console.error("Error creating auction:", error);
      if (error.transaction) {
        console.error("Transaction:", error.transaction);
      }
      if (error.data) {
        console.error("Error data:", error.data);
      }
      let errorMessage = "Failed to create auction";

      // Handle specific error cases
      if (error.message?.includes("Extension context invalidated")) {
        errorMessage =
          "Wallet connection lost. Please refresh the page and try again.";
      } else if (error.message?.includes("Provider not initialized")) {
        errorMessage =
          "Wallet not properly initialized. Please refresh the page and try again.";
      } else if (error.message?.includes("Insufficient balance")) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = `Contract error: ${error.reason}`;
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message?.includes("reverted")) {
        errorMessage =
          "Contract reverted. This usually means there was an error in the contract execution. Please check your input parameters and try again.";
      } else if (error.message?.includes("gas required exceeds allowance")) {
        errorMessage = "Transaction would exceed gas limit. Please try again.";
      } else if (error.message?.includes("insufficient funds for gas")) {
        errorMessage =
          "Insufficient funds to cover gas costs. Please add more AVAX to your wallet.";
      } else if (error.message?.includes("timed out")) {
        errorMessage = "Transaction is taking longer than expected. Please check your wallet for the transaction status.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setTransactionStatus({ step: null, message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="container py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[#EC38BC] hover:text-[#FF3CAC] mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to auctions
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-[#EC38BC]" />
          <h1
            className={`${raleway.className} text-3xl font-bold text-[#1C043C]`}
          >
            Create New Auction
          </h1>
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-white mb-4">
              Please connect your wallet to create an auction
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardHeader>
                <CardTitle className={`${raleway.className} text-white`}>
                  Auction Details
                </CardTitle>
                <CardDescription
                  className={`${poppins.className} text-[#EC38BC]`}
                >
                  Fill in the details for your new auction item.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className={`${poppins.className} text-white`}
                  >
                    Item Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a title for your item"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className={`${poppins.className} text-white`}
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your item in detail"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="min-h-[120px] bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className={`${poppins.className} text-white`}
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    required
                  >
                    <SelectTrigger
                      id="category"
                      name="category"
                      className="bg-[#090214]/50 border-[#EC38BC]/20 text-white focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C043C] border-[#EC38BC]/20">
                      <SelectItem
                        value="digital-art"
                        className="text-white hover:bg-[#EC38BC]/20"
                      >
                        Digital Art
                      </SelectItem>
                      <SelectItem
                        value="collectible"
                        className="text-white hover:bg-[#EC38BC]/20"
                      >
                        Collectible
                      </SelectItem>
                      <SelectItem
                        value="virtual-land"
                        className="text-white hover:bg-[#EC38BC]/20"
                      >
                        Virtual Land
                      </SelectItem>
                      <SelectItem
                        value="avatar"
                        className="text-white hover:bg-[#EC38BC]/20"
                      >
                        Avatar
                      </SelectItem>
                      <SelectItem
                        value="game-asset"
                        className="text-white hover:bg-[#EC38BC]/20"
                      >
                        Game Asset
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="starting-bid"
                    className={`${poppins.className} text-white`}
                  >
                    Starting Bid (AVAX)
                  </Label>
                  <Input
                    id="starting-bid"
                    name="startingBid"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.startingBid}
                    onChange={handleInputChange}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label
                      htmlFor="duration"
                      className={`${poppins.className} text-white`}
                    >
                      Auction Duration
                    </Label>
                    <span
                      className={`${poppins.className} text-sm text-[#EC38BC]`}
                    >
                      {formData.duration} days
                    </span>
                  </div>
                  <Slider
                    id="duration"
                    min={1}
                    max={30}
                    step={1}
                    value={[formData.duration]}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: value[0],
                      }))
                    }
                    className="[&_[role=slider]]:bg-[#EC38BC] [&_[role=track]]:bg-[#EC38BC]/20"
                  />
                  <div className="flex justify-between text-xs text-[#EC38BC]">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="image"
                    className={`${poppins.className} text-white`}
                  >
                    Item Image
                  </Label>
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                        imagePreview
                          ? "border-[#EC38BC]"
                          : "border-[#EC38BC]/20"
                      } ${
                        isDragging
                          ? "bg-[#090214] border-[#EC38BC]"
                          : "bg-[#090214]/50"
                      } px-6 py-10 text-center transition-all duration-300 hover:bg-[#090214]`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) =>
                          handleImageChange(e.target.files?.[0] || null)
                        }
                        required={!imagePreview}
                      />
                      {imagePreview ? (
                        <div className="absolute inset-0 flex items-center justify-center group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-contain p-2"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-sm text-white">
                              Click or drag to change image
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-[#EC38BC]" />
                          <div className="text-sm text-[#EC38BC]">
                            {isDragging
                              ? "Drop image here"
                              : "Click to upload or drag and drop"}
                          </div>
                          <div className="text-xs text-[#EC38BC]/70">
                            PNG, JPG, GIF up to 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Auction...
                </>
              ) : (
                "Create Auction"
              )}
            </Button>
          </form>
        )}
      </div>

      {transactionStatus.step && (
        <div className="mt-4 p-4 bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20 rounded-lg">
          <p className="text-[#EC38BC] mb-2">{transactionStatus.message}</p>
          {transactionStatus.hash && (
            <div className="text-sm text-white/70 break-all">
              Transaction Hash: {transactionStatus.hash}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
