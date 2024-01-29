//  import React from'react';
//  import {web3} from './web3';
const Web3 = require("web3");

const apiBaseUrl = 'https://api.polygonscan.com/api';
const apiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG';
const txHash = '0xc6b081b28617b112b4e1b0d8bd4804c99a82d75264ef695b2b92c1b6be020a78';

const getTransactionDetails = async () => {
  const apiUrl = `${apiBaseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`;
//   console.log('API URL:', apiUrl);
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // console.log('Response:', data);

   
      const transaction = data.result;
      console.log('Transaction:', transaction);

      if (transaction && transaction.from && transaction.to && transaction.value) {
        const fromAddress = transaction.from;
        const toAddress = transaction.to;
        const amountWei = transaction.value;

        // Convert amount to ETH and format with 4 decimals
        const amountEth = Web3.utils.fromWei(amountWei, 'ether');
        const formattedAmount = parseFloat(amountEth).toFixed(4);

        console.log('From Address:', fromAddress);
        console.log('To Address:', toAddress);
        console.log('Amount:', formattedAmount, 'MATIC');
      } else {
        console.error('Error: Required transaction data is missing or undefined');
      }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

getTransactionDetails();
