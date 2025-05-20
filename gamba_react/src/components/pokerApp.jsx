import { useState, useEffect } from 'react';

export default function PokerApp() {
  // State to track game information
  const [players, setPlayers] = useState([
    { name: 'MyBot', uuid: '1', stack: 1000, state: 'participating' },
    { name: 'Opponent', uuid: '2', stack: 1000, state: 'participating' }
  ]);
  
  const [gameState, setGameState] = useState({
    holeCards: ['', ''],
    communityCards: ['', '', '', '', ''], // 5 cards max (flop, turn, river)
    street: 'preflop',
    pot: { main: 0, side: 0 },
    dealerPosition: 0,
    nextPlayer: 1,
    smallBlindPos: 0,
    bigBlindPos: 1,
    roundCount: 1,
    smallBlindAmount: 10,
    actionHistories: {
      preflop: [],
      flop: [],
      turn: [],
      river: []
    }
  });

  const [validActions, setValidActions] = useState([
    { action: 'fold', amount: 0 },
    { action: 'call', amount: 0 },
    { action: 'raise', amount: { min: 0, max: 0 } }
  ]);

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Card suits and values for dropdown selections
  const suits = ['H', 'D', 'C', 'S'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

  // Function to add a new player
  const addPlayer = () => {
    const newPlayerId = (players.length + 1).toString();
    setPlayers([
      ...players,
      { name: `Player ${newPlayerId}`, uuid: newPlayerId, stack: 1000, state: 'participating' }
    ]);
  };

  // Function to update player info
  const updatePlayer = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
  };

  // Function to update hole cards
  const updateHoleCard = (index, card) => {
    const newHoleCards = [...gameState.holeCards];
    newHoleCards[index] = card;
    setGameState({ ...gameState, holeCards: newHoleCards });
  };

  // Function to update community cards
  const updateCommunityCard = (index, card) => {
    const newCommunityCards = [...gameState.communityCards];
    newCommunityCards[index] = card;
    setGameState({ ...gameState, communityCards: newCommunityCards });
  };

  // Function to update game state field
  const updateGameState = (field, value) => {
    setGameState({ ...gameState, [field]: value });
  };

  // Function to update pot
  const updatePot = (type, value) => {
    setGameState({
      ...gameState,
      pot: { ...gameState.pot, [type]: parseInt(value) || 0 }
    });
  };

  // Function to update valid actions
  const updateValidAction = (actionType, field, value) => {
    const updatedActions = validActions.map(action => {
      if (action.action === actionType) {
        if (field === 'min' || field === 'max') {
          return {
            ...action,
            amount: { ...action.amount, [field]: parseInt(value) || 0 }
          };
        }
        return { ...action, amount: parseInt(value) || 0 };
      }
      return action;
    });
    setValidActions(updatedActions);
  };

  // Update valid actions based on the street and previous actions
  useEffect(() => {
    // Example: If we're in preflop and no actions yet, set the call amount to big blind
    if (gameState.street === 'preflop' && gameState.actionHistories.preflop.length === 0) {
      updateValidAction('call', 'amount', gameState.smallBlindAmount * 2);
      updateValidAction('raise', 'min', gameState.smallBlindAmount * 4);
      updateValidAction('raise', 'max', players[0].stack);
    }
  }, [gameState.street, gameState.actionHistories]);

  // Function to prepare the payload for the backend
  const preparePayload = () => {
    // Filter out empty community cards
    const filteredCommunityCards = gameState.communityCards.filter(card => card !== '');
    
    return {
      valid_actions: validActions,
      hole_card: gameState.holeCards,
      round_state: {
        community_card: filteredCommunityCards,
        street: gameState.street,
        pot: {
          main: { amount: gameState.pot.main },
          side: { amount: gameState.pot.side }
        },
        dealer_btn: gameState.dealerPosition,
        next_player: gameState.nextPlayer,
        small_blind_pos: gameState.smallBlindPos,
        big_blind_pos: gameState.bigBlindPos,
        round_count: gameState.roundCount,
        small_blind_amount: gameState.smallBlindAmount,
        seats: players,
        action_histories: gameState.actionHistories
      },
      is_bot_turn: true
    };
  };

  // Function to request decision from backend
  const requestDecision = async () => {
    try {
      setLoading(true);
      const payload = preparePayload();
      console.log("Sending payload to backend:", payload);
      
       const response = await fetch("http://localhost:8000/ai_decision/", {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
       });
      
      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockResponse = { action: 'raise', amount: 60 };
      
      // const data = await response.json();
      setRecommendation(mockResponse);
    } catch (error) {
      console.error("Error fetching decision:", error);
      setRecommendation({ error: "Failed to get recommendation" });
    } finally {
      setLoading(false);
    }
  };

  // Function to add action to history
  const addActionToHistory = (playerIndex, action, amount) => {
    const currentStreet = gameState.street;
    const newActionHistories = { ...gameState.actionHistories };
    
    newActionHistories[currentStreet] = [
      ...newActionHistories[currentStreet],
      { player: players[playerIndex].uuid, action, amount }
    ];
    
    setGameState({
      ...gameState,
      actionHistories: newActionHistories
    });
  };

  // Function to render action histories for the current street
  const renderActionHistory = () => {
    const currentStreet = gameState.street;
    const actions = gameState.actionHistories[currentStreet];
    
    if (!actions || actions.length === 0) {
      return <p>No actions in this street yet</p>;
    }
    
    return (
      <ul className="list-disc pl-5">
        {actions.map((action, index) => {
          const player = players.find(p => p.uuid === action.player);
          return (
            <li key={index}>
              {player ? player.name : 'Unknown'}: {action.action} {action.amount > 0 ? `${action.amount}` : ''}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Poker Decision Assistant</h1>
      
      {/* Players Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <div className="grid gap-4 mb-4">
          {players.map((player, index) => (
            <div key={index} className="flex flex-wrap gap-2 items-center p-2 border rounded">
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                className="border p-1 w-32"
                placeholder="Name"
              />
              <input
                type="number"
                value={player.stack}
                onChange={(e) => updatePlayer(index, 'stack', parseInt(e.target.value))}
                className="border p-1 w-24"
                placeholder="Stack"
              />
              <select
                value={player.state}
                onChange={(e) => updatePlayer(index, 'state', e.target.value)}
                className="border p-1"
              >
                <option value="participating">Active</option>
                <option value="folded">Folded</option>
                <option value="allin">All-in</option>
              </select>
              {index === 0 && (
                <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  MyBot
                </span>
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={addPlayer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Player
        </button>
      </div>
      
      {/* Game Info Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Game Info</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Street:</label>
            <select
              value={gameState.street}
              onChange={(e) => updateGameState('street', e.target.value)}
              className="border p-2 w-full"
            >
              <option value="preflop">Preflop</option>
              <option value="flop">Flop</option>
              <option value="turn">Turn</option>
              <option value="river">River</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Round Count:</label>
            <input
              type="number"
              value={gameState.roundCount}
              onChange={(e) => updateGameState('roundCount', parseInt(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1">Main Pot:</label>
            <input
              type="number"
              value={gameState.pot.main}
              onChange={(e) => updatePot('main', e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1">Side Pot:</label>
            <input
              type="number"
              value={gameState.pot.side}
              onChange={(e) => updatePot('side', e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1">Small Blind Amount:</label>
            <input
              type="number"
              value={gameState.smallBlindAmount}
              onChange={(e) => updateGameState('smallBlindAmount', parseInt(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1">Dealer Position:</label>
            <select
              value={gameState.dealerPosition}
              onChange={(e) => updateGameState('dealerPosition', parseInt(e.target.value))}
              className="border p-2 w-full"
            >
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name} (Seat {idx})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Small Blind Position:</label>
            <select
              value={gameState.smallBlindPos}
              onChange={(e) => updateGameState('smallBlindPos', parseInt(e.target.value))}
              className="border p-2 w-full"
            >
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name} (Seat {idx})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Big Blind Position:</label>
            <select
              value={gameState.bigBlindPos}
              onChange={(e) => updateGameState('bigBlindPos', parseInt(e.target.value))}
              className="border p-2 w-full"
            >
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name} (Seat {idx})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Next Player:</label>
            <select
              value={gameState.nextPlayer}
              onChange={(e) => updateGameState('nextPlayer', parseInt(e.target.value))}
              className="border p-2 w-full"
            >
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name} (Seat {idx})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Cards Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Cards</h2>
        
        {/* Hole Cards */}
        <div className="mb-4">
          <h3 className="font-medium mb-1">Your Hole Cards:</h3>
          <div className="flex gap-2">
            {[0, 1].map((index) => (
              <div key={index} className="flex border rounded">
                <select
                  value={gameState.holeCards[index].charAt(0) || ''}
                  onChange={(e) => updateHoleCard(index, e.target.value + (gameState.holeCards[index].charAt(1) || ''))}
                  className="border-r p-2"
                >
                  <option value="">Value</option>
                  {values.map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <select
                  value={gameState.holeCards[index].charAt(1) || ''}
                  onChange={(e) => updateHoleCard(index, (gameState.holeCards[index].charAt(0) || '') + e.target.value)}
                  className="p-2"
                >
                  <option value="">Suit</option>
                  {suits.map(suit => (
                    <option key={suit} value={suit}>{suit}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        
        {/* Community Cards */}
        <div>
          <h3 className="font-medium mb-1">Community Cards:</h3>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="flex border rounded">
                <select
                  value={gameState.communityCards[index].charAt(0) || ''}
                  onChange={(e) => updateCommunityCard(index, e.target.value + (gameState.communityCards[index].charAt(1) || ''))}
                  className="border-r p-2"
                >
                  <option value="">Value</option>
                  {values.map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <select
                  value={gameState.communityCards[index].charAt(1) || ''}
                  onChange={(e) => updateCommunityCard(index, (gameState.communityCards[index].charAt(0) || '') + e.target.value)}
                  className="p-2"
                >
                  <option value="">Suit</option>
                  {suits.map(suit => (
                    <option key={suit} value={suit}>{suit}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Valid Actions Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Valid Actions</h2>
        <div className="grid gap-4">
          <div className="p-2 border rounded">
            <div className="flex items-center">
              <span className="font-medium w-16">Fold</span>
              <span>(Amount: 0)</span>
            </div>
          </div>
          
          <div className="p-2 border rounded">
            <div className="flex items-center gap-2">
              <span className="font-medium w-16">Call</span>
              <input
                type="number"
                value={validActions.find(a => a.action === 'call')?.amount || 0}
                onChange={(e) => updateValidAction('call', 'amount', e.target.value)}
                className="border p-1 w-24"
              />
            </div>
          </div>
          
          <div className="p-2 border rounded">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium w-16">Raise</span>
              <div className="flex items-center gap-1">
                <span>Min:</span>
                <input
                  type="number"
                  value={validActions.find(a => a.action === 'raise')?.amount?.min || 0}
                  onChange={(e) => updateValidAction('raise', 'min', e.target.value)}
                  className="border p-1 w-24"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>Max:</span>
                <input
                  type="number"
                  value={validActions.find(a => a.action === 'raise')?.amount?.max || 0}
                  onChange={(e) => updateValidAction('raise', 'max', e.target.value)}
                  className="border p-1 w-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action History Section */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Action History ({gameState.street})</h2>
        {renderActionHistory()}
        
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-2">Add Action</h3>
          <div className="flex flex-wrap gap-2">
            <select id="actionPlayer" className="border p-2">
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name}
                </option>
              ))}
            </select>
            
            <select id="actionType" className="border p-2">
              <option value="fold">Fold</option>
              <option value="call">Call</option>
              <option value="check">Check</option>
              <option value="raise">Raise</option>
            </select>
            
            <input
              type="number"
              id="actionAmount"
              className="border p-2 w-24"
              placeholder="Amount"
            />
            
            <button
              onClick={() => {
                const playerIdx = parseInt(document.getElementById('actionPlayer').value);
                const action = document.getElementById('actionType').value;
                const amount = parseInt(document.getElementById('actionAmount').value || 0);
                addActionToHistory(playerIdx, action, amount);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Action
            </button>
          </div>
        </div>
      </div>
      
      {/* Get Decision Button */}
      <div className="mb-6 text-center">
        <button
          onClick={requestDecision}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Get Bot Decision'}
        </button>
      </div>
      
      {/* Recommendation Display */}
      {recommendation && (
        <div className="mb-6 bg-green-50 p-4 border border-green-200 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Recommended Action</h2>
          {recommendation.error ? (
            <p className="text-red-600">{recommendation.error}</p>
          ) : (
            <div className="text-center">
              <p className="text-3xl font-bold text-green-700 mb-2">
                {recommendation.action.toUpperCase()}
                {recommendation.amount > 0 && ` ${recommendation.amount}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}