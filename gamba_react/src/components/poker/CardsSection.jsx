import React from 'react';

function CardsSection({ gameState, updateHoleCard, updateCommunityCard, suits, values }) {
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Cards</h2>
      
      {/* Hole Cards */}
      <div className="mb-4">
        <h3 className="mb-1">Your Hole Cards:</h3>
        <div className="card-selection">
          {[0, 1].map((index) => (
            <div key={index} className="flex">
              <select
                value={gameState.holeCards[index].charAt(0) || ''}
                onChange={(e) => updateHoleCard(index, e.target.value + (gameState.holeCards[index].charAt(1) || ''))}
                className="p-2"
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
        <h3 className="mb-1">Community Cards:</h3>
        <div className="card-selection flex-wrap">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="flex">
              <select
                value={gameState.communityCards[index].charAt(0) || ''}
                onChange={(e) => updateCommunityCard(index, e.target.value + (gameState.communityCards[index].charAt(1) || ''))}
                className="p-2"
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
  );
}

export default CardsSection;
