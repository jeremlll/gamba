import React, { useEffect } from 'react';

function ValidActionsSection({ validActions, updateValidAction, gameState, players }) {
  // Function to infer valid actions from game state
  useEffect(() => {
    inferValidActions();
  }, [gameState.street, gameState.actionHistories, gameState.pot, players]);

  const inferValidActions = () => {
    const currentStreet = gameState.street;
    const actions = gameState.actionHistories[currentStreet] || [];
    const activePlayers = players.filter(p => p.state === 'participating');
    const nextPlayerIdx = gameState.nextPlayer;
    const nextPlayer = players[nextPlayerIdx];
    
    // Default values
    let callAmount = 0;
    let minRaise = 0;
    let maxRaise = 0;
    
    // Calculate current bet amount for the street
    const currentBets = {};
    activePlayers.forEach(player => {
      currentBets[player.uuid] = 0;
    });
    
    // Calculate bets made by each player in current street
    actions.forEach(action => {
      const playerUuid = players[action.playerIdx].uuid;
      if (action.action === 'raise' || action.action === 'call') {
        currentBets[playerUuid] = (currentBets[playerUuid] || 0) + action.amount;
      }
    });
    
    // Find highest bet
    const highestBet = Math.max(...Object.values(currentBets), 0);
    
    // Calculate call amount (difference between highest bet and next player's current bet)
    const nextPlayerBet = currentBets[nextPlayer.uuid] || 0;
    callAmount = highestBet - nextPlayerBet;
    
    // Calculate min and max raise
    if (currentStreet === 'preflop' && actions.length === 0) {
      // Preflop with no actions - min raise is 2x big blind
      minRaise = gameState.smallBlindAmount * 4;
    } else if (actions.length > 0) {
      // Find last raise amount
      const raises = actions.filter(a => a.action === 'raise');
      if (raises.length > 0) {
        const lastRaise = raises[raises.length - 1];
        minRaise = lastRaise.amount * 2;
      } else {
        // No raises yet, min raise is 2x big blind
        minRaise = gameState.smallBlindAmount * 4;
      }
    } else {
      // Default min raise
      minRaise = gameState.smallBlindAmount * 2;
    }
    
    // Max raise is player's stack
    maxRaise = nextPlayer.stack;
    
    // Update valid actions
    updateValidAction('call', 'amount', callAmount);
    updateValidAction('raise', 'min', minRaise);
    updateValidAction('raise', 'max', maxRaise);
  };

  return (
    <div className="card mb-6">
      <h2 className="mb-2">Valid Actions</h2>
      <div className="flex flex-col gap-2">
        <div className="player-card">
          <div className="flex items-center">
            <span className="w-16">Fold</span>
            <span>(Amount: 0)</span>
          </div>
        </div>
        
        <div className="player-card">
          <div className="flex items-center gap-2">
            <span className="w-16">Call</span>
            <input
              type="number"
              value={validActions.find(a => a.action === 'call')?.amount || 0}
              onChange={(e) => updateValidAction('call', 'amount', e.target.value)}
              className="p-1"
            />
          </div>
        </div>
        
        <div className="player-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16">Raise</span>
            <div className="flex items-center gap-1">
              <span>Min:</span>
              <input
                type="number"
                value={validActions.find(a => a.action === 'raise')?.amount?.min || 0}
                onChange={(e) => updateValidAction('raise', 'min', e.target.value)}
                className="p-1"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>Max:</span>
              <input
                type="number"
                value={validActions.find(a => a.action === 'raise')?.amount?.max || 0}
                onChange={(e) => updateValidAction('raise', 'max', e.target.value)}
                className="p-1"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Valid actions are automatically inferred from the current game state.
            You can still manually adjust values if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ValidActionsSection;
