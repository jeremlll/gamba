import React from 'react';

function GameInfoSection({ gameState, updateGameState, updatePot, players }) {
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Game Info</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="mb-1">Street:</label>
          <select
            value={gameState.street}
            onChange={(e) => updateGameState('street', e.target.value)}
            className="p-2"
          >
            <option value="preflop">Preflop</option>
            <option value="flop">Flop</option>
            <option value="turn">Turn</option>
            <option value="river">River</option>
          </select>
        </div>
        
        <div>
          <label className="mb-1">Round Count:</label>
          <input
            type="number"
            value={gameState.roundCount}
            onChange={(e) => updateGameState('roundCount', parseInt(e.target.value))}
            className="p-2"
          />
        </div>
        
        <div>
          <label className="mb-1">Main Pot:</label>
          <input
            type="number"
            value={gameState.pot.main}
            onChange={(e) => updatePot('main', e.target.value)}
            className="p-2"
          />
        </div>
        
        <div>
          <label className="mb-1">Side Pot:</label>
          <input
            type="number"
            value={gameState.pot.side}
            onChange={(e) => updatePot('side', e.target.value)}
            className="p-2"
          />
        </div>
        
        <div>
          <label className="mb-1">Small Blind Amount:</label>
          <input
            type="number"
            value={gameState.smallBlindAmount}
            onChange={(e) => updateGameState('smallBlindAmount', parseInt(e.target.value))}
            className="p-2"
          />
        </div>
        
        <div>
          <label className="mb-1">Dealer Position:</label>
          <select
            value={gameState.dealerPosition}
            onChange={(e) => updateGameState('dealerPosition', parseInt(e.target.value))}
            className="p-2"
          >
            {players.map((player, idx) => (
              <option key={idx} value={idx}>
                {player.name} (Seat {idx})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="mb-1">Small Blind Position:</label>
          <select
            value={gameState.smallBlindPos}
            onChange={(e) => updateGameState('smallBlindPos', parseInt(e.target.value))}
            className="p-2"
          >
            {players.map((player, idx) => (
              <option key={idx} value={idx}>
                {player.name} (Seat {idx})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="mb-1">Big Blind Position:</label>
          <select
            value={gameState.bigBlindPos}
            onChange={(e) => updateGameState('bigBlindPos', parseInt(e.target.value))}
            className="p-2"
          >
            {players.map((player, idx) => (
              <option key={idx} value={idx}>
                {player.name} (Seat {idx})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="mb-1">Next Player:</label>
          <select
            value={gameState.nextPlayer}
            onChange={(e) => updateGameState('nextPlayer', parseInt(e.target.value))}
            className="p-2"
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
  );
}

export default GameInfoSection;
