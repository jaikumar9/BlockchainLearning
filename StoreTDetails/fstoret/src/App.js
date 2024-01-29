import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000'); // Update with your server URL

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Listen for newTransactions event from the server
    socket.on('newTransactions', (newTransactions) => {
      setTransactions(newTransactions);
    });

    // Cleanup the socket connection when component unmounts
    return () => socket.disconnect();
  }, []);

  const checkTransactions = async () => {
    try {
      // Call the backend to check for new transactions
      const response = await axios.get('http://localhost:3000/checkTransactions');
      console.log(response.data);
    } catch (error) {
      console.error('Error checking transactions:', error.message);
    }
  };

  const startAutoCheck = () => {
    // Check transactions initially
    checkTransactions();

    // Set up interval to check transactions every 5 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      checkTransactions();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  };

  return (
    <div className="App">
      <h1>Transaction Monitor</h1>
      <button onClick={startAutoCheck}>Start Auto Check</button>

      <div id="transactions">
        {transactions.map((tx, index) => (
          <div key={index} className="transaction">
            <strong>To:</strong> {tx.to}<br />
            <strong>From:</strong> {tx.from}<br />
            <strong>Value:</strong> {tx.value}<br />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
