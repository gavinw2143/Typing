import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Initialize the state variable
  const [blockText, setBlockText] = useState(''); // Generating text
  const [currentIndex, setCurrentIndex] = useState(0); // Character tracking
  const [profile, setProfile] = useState({}) // Metrics for generating new text
  const [startTime, setStartTime] = useState(null); // For gathering WPM
  const [wpm, setWpm] = useState('N/A'); // WPM display
  const [prevKeyPressTime, setPrevKeyPressTime] = useState(null); //
  const [keyPressIntervals, setKeyPressIntervals] = useState([]);

  const generateBlock = (length = 100) => {
    console.log(profile);
    let chars = 'qwertyuiopasdfghjklzxvbnm ';
    let curProfile = { ...profile };
    
    if (Object.keys(profile).length === 0) {
      for (let char1 of chars) {
        curProfile[char1] = {};
        for (let char2 of chars) {
          curProfile[char1][char2] = 1000;
        }
      }
      setProfile(curProfile);
    }
    
    let block = '';
    let num_chars = 0;
    let char = chars[Math.floor(Math.random() * chars.length)];

    for (let i = 0; i < length; i++) {
      let probs = [];
    
      for (let sample_char in curProfile[char]) {
        probs.push(curProfile[char][sample_char]);
      }
    
      let sum = probs.reduce((a, b) => a + b, 0);
      let no_space_sum = sum - probs[probs.length - 1];
      probs[probs.length - 1] = (num_chars / 5) * no_space_sum;
      sum = probs.reduce((a, b) => a + b, 0);
    
      let idx = weightedRandom(probs, sum);
      while (i === length - 1 && chars[idx] === ' ') {
        idx = weightedRandom(probs, sum);
      }
      
      char = chars[idx];
    
      if (char === ' ') num_chars = -1;
    
      block += char;
      num_chars += 1;
    }
    setBlockText(block);
  }

  useEffect(() => {
    generateBlock();
  }, [profile]);

  useEffect(() => {
    if (wpm !== 'N/A') {
      setCurrentIndex(0);
      setStartTime(null);
      setPrevKeyPressTime(null);
    }
  }, [wpm])

  useEffect(() => {
    if (keyPressIntervals.length === blockText.length - 1) {
      const totalTime = (new Date().getTime() - startTime) / 1000 / 60;
      setWpm(parseFloat(blockText.length / 5 / totalTime).toFixed(1));
      
      let curProf = { ...profile };
      for (let i = 0; i < keyPressIntervals.length; i++) {
        if (curProf[blockText[i]][blockText[i + 1]] == 1000) {
          curProf[blockText[i]][blockText[i + 1]] = 1 / keyPressIntervals[i];
        } else {
          curProf[blockText[i]][blockText[i + 1]] = 
          (curProf[blockText[i]][blockText[i + 1]] + 1 / keyPressIntervals[i]) / 2;
        }
      }
      setProfile(curProf);
      setKeyPressIntervals([]);
    }
  }, [keyPressIntervals]);

  useEffect(() => {
    // Event listener for keypress
    function handleKeyPress(event) {
      const currentTime = new Date().getTime();

      if (startTime === null) {
        setStartTime(currentTime);
      }
      if (blockText[currentIndex] === event.key) {
        if (prevKeyPressTime !== null) {
          const interval = (currentTime - prevKeyPressTime) / 1000;
          setKeyPressIntervals((prevIntervals) => [...prevIntervals, interval]);
        }

        setCurrentIndex((prevIndex) => prevIndex + 1);
        setPrevKeyPressTime(currentTime);
      }
    }
    
    window.addEventListener('keypress', handleKeyPress);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [blockText, currentIndex]);

  // Helper function to get weighted random index
  function weightedRandom(probs, s) {
    probs = probs.map((x) => x/s);
    let sum = 0;
    let r = Math.random();
    for (let i = 0; i < probs.length; i++) {
      sum += probs[i];
      if (r <= sum) return Number(i);
    }
  }

  return (
    <div className="App">
      <h1 style={{"color":"white"}}>WPM: {wpm}</h1>
      <div className="Text">
        {blockText.split('').map((char, index) => (
          <span key={index} style={{ 
            color: index >= currentIndex ? 'white' : 'grey',
            backgroundColor: index === currentIndex ? 'rgb(100,100,100)' : 'transparent' }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
