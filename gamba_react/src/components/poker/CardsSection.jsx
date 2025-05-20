import React, { useState } from 'react';

function CardsSection({ gameState, updateHoleCard, updateCommunityCard, suits, values }) {
  const [showDropdowns, setShowDropdowns] = useState(false);
  
  // Helper function to validate card input
  const validateCard = (card) => {
    if (card === '') return true;
    if (card.length !== 2) return false;
    
    const value = card.charAt(0).toUpperCase();
    const suit = card.charAt(1).toUpperCase();
    
    return values.includes(value) && suits.includes(suit);
  };
  
  // Function to handle direct card input
  const handleCardInput = (type, index, value) => {
    // Convert to uppercase
    value = value.toUpperCase();
    
    // Validate input
    if (value === '' || validateCard(value)) {
      if (type === 'hole') {
        updateHoleCard(index, value);
      } else {
        updateCommunityCard(index, value);
      }
    }
  };
  
  // Function to handle bulk community card input
  const handleBulkCommunityCards = (e) => {
    const input = e.target.value.toUpperCase().replace(/\s+/g, '');
    const cards = input.match(/.{1,2}/g) || [];
    
    // Clear existing community cards
    gameState.communityCards.forEach((_, index) => {
      updateCommunityCard(index, '');
    });
    
    // Set new community cards
    cards.slice(0, 5).forEach((card, index) => {
      if (validateCard(card)) {
        updateCommunityCard(index, card);
      }
    });
  };
  
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Cards</h2>
      
      <div className="mb-2">
        <button 
          onClick={() => setShowDropdowns(!showDropdowns)}
          className="btn btn-secondary btn-sm"
        >
          {showDropdowns ? 'Use Text Input' : 'Use Dropdowns'}
        </button>
        <span className="ml-2 text-sm">Format: Value (2-A) + Suit (H, D, C, S). Example: AH = Ace of Hearts</span>
      </div>
      
      {/* Hole Cards */}
      <div className="mb-4">
        <h3 className="mb-1">Your Hole Cards:</h3>
        
        {showDropdowns ? (
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
        ) : (
          <div className="flex gap-2">
            {[0, 1].map((index) => (
              <input
                key={index}
                type="text"
                value={gameState.holeCards[index]}
                onChange={(e) => handleCardInput('hole', index, e.target.value)}
                className="p-2 w-16 text-center uppercase"
                placeholder={`Card ${index+1}`}
                maxLength="2"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Community Cards */}
      <div>
        <h3 className="mb-1">Community Cards:</h3>
        
        {showDropdowns ? (
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
        ) : (
          <div>
            <div className="flex gap-2 mb-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={gameState.communityCards[index]}
                  onChange={(e) => handleCardInput('community', index, e.target.value)}
                  className="p-2 w-16 text-center uppercase"
                  placeholder={index < 3 ? 'Flop' : (index === 3 ? 'Turn' : 'River')}
                  maxLength="2"
                />
              ))}
            </div>
            
            <div className="mt-2">
              <label className="block mb-1 text-sm">Bulk Input (space separated: e.g. "AH KD QC"):</label>
              <input
                type="text"
                placeholder="Enter community cards (e.g. AH KD QC)"
                className="p-2 w-full"
                onChange={handleBulkCommunityCards}
                value={gameState.communityCards.filter(c => c !== '').join(' ')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardsSection;
