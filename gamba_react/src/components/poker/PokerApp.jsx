import { useState, useEffect } from 'react';
import PlayerSection from './PlayerSection';
import GameInfoSection from './GameInfoSection';
import CardsSection from './CardsSection';
import ValidActionsSection from './ValidActionsSection';
import ActionHistorySection from './ActionHistorySection';
import RecommendationSection from './RecommendationSection';

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
  
  // Function to remove a player
  const removePlayer = (index) => {
    if (players.length <= 2) return; // Maintain at least 2 players
    
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    
    // Update game state positions if needed
    const updatedGameState = { ...gameState };
    
    // Adjust positions if the removed player was in a special position
    if (gameState.dealerPosition >= index) {
      updatedGameState.dealerPosition = Math.max(0, gameState.dealerPosition - 1);
    }
    if (gameState.smallBlindPos >= index) {
      updatedGameState.smallBlindPos = Math.max(0, gameState.smallBlindPos - 1);
    }
    if (gameState.bigBlindPos >= index) {
      updatedGameState.bigBlindPos = Math.max(0, gameState.bigBlindPos - 1);
    }
    if (gameState.nextPlayer >= index) {
      updatedGameState.nextPlayer = Math.max(0, gameState.nextPlayer - 1);
    }
    
    setPlayers(updatedPlayers);
    setGameState(updatedGameState);
  };
  
  // Function to reorder players
  const reorderPlayers = (fromIndex, toIndex, customOrder = null) => {
    let updatedPlayers;
    
    if (customOrder) {
      // Use custom order if provided
      updatedPlayers = customOrder;
    } else {
      // Move player from fromIndex to toIndex
      updatedPlayers = [...players];
      const [movedPlayer] = updatedPlayers.splice(fromIndex, 1);
      updatedPlayers.splice(toIndex, 0, movedPlayer);
    }
    
    // Update player UUIDs to match their new positions
    updatedPlayers = updatedPlayers.map((player, idx) => ({
      ...player,
      uuid: (idx + 1).toString()
    }));
    
    // Update game state positions
    const positionMap = {};
    players.forEach((player, idx) => {
      positionMap[player.uuid] = updatedPlayers.findIndex(p => p.name === player.name);
    });
    
    const updatedGameState = { ...gameState };
    
    // Map old positions to new positions
    const mapPosition = (oldPosition) => {
      const oldUuid = players[oldPosition]?.uuid;
      if (!oldUuid) return 0;
      return positionMap[oldUuid] !== undefined ? positionMap[oldUuid] : 0;
    };
    
    updatedGameState.dealerPosition = mapPosition(gameState.dealerPosition);
    updatedGameState.smallBlindPos = mapPosition(gameState.smallBlindPos);
    updatedGameState.bigBlindPos = mapPosition(gameState.bigBlindPos);
    updatedGameState.nextPlayer = mapPosition(gameState.nextPlayer);
    
    setPlayers(updatedPlayers);
    setGameState(updatedGameState);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a response
      const mockResponse = {
        action: gameState.street === 'preflop' ? 'raise' : 'call',
        amount: gameState.street === 'preflop' ? 50 : 20
      };
      
      setRecommendation(mockResponse);
    } catch (error) {
      console.error("Error requesting decision:", error);
      setRecommendation({ error: "Failed to get decision. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Function to add action to history
  const addActionToHistory = (playerIndex, action, amount) => {
    const street = gameState.street;
    const newAction = {
      playerIdx: playerIndex,
      action: action,
      amount: amount,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistories = {
      ...gameState.actionHistories,
      [street]: [...(gameState.actionHistories[street] || []), newAction]
    };
    
    setGameState({
      ...gameState,
      actionHistories: updatedHistories
    });
  };
  
  // Function to update an action in history
  const updateActionHistory = (street, index, updatedAction) => {
    let updatedActions;
    
    // If index is null, we're replacing the entire array
    if (index === null) {
      updatedActions = updatedAction; // This should be an empty array or a new array
    } else {
      // We're updating a specific action
      updatedActions = [...(gameState.actionHistories[street] || [])];
      // Remove index property if it exists
      const { index: _, ...actionWithoutIndex } = updatedAction;
      updatedActions[index] = actionWithoutIndex;
    }
    
    const updatedHistories = {
      ...gameState.actionHistories,
      [street]: updatedActions
    };
    
    setGameState({
      ...gameState,
      actionHistories: updatedHistories
    });
  };
  
  // Function to remove an action from history
  const removeActionFromHistory = (street, index) => {
    const updatedActions = [...(gameState.actionHistories[street] || [])];
    updatedActions.splice(index, 1);
    
    const updatedHistories = {
      ...gameState.actionHistories,
      [street]: updatedActions
    };
    
    setGameState({
      ...gameState,
      actionHistories: updatedHistories
    });
  };



  return (
    <div className="poker-app">
      <h1 className="mb-4">Poker Decision Assistant</h1>
      
      <PlayerSection 
        players={players} 
        updatePlayer={updatePlayer} 
        addPlayer={addPlayer}
        removePlayer={removePlayer}
        reorderPlayers={reorderPlayers}
      />
      
      <GameInfoSection 
        gameState={gameState} 
        updateGameState={updateGameState} 
        updatePot={updatePot} 
        players={players} 
      />
      
      <CardsSection 
        gameState={gameState} 
        updateHoleCard={updateHoleCard} 
        updateCommunityCard={updateCommunityCard} 
        suits={suits} 
        values={values} 
      />
      
      <ValidActionsSection 
        validActions={validActions} 
        updateValidAction={updateValidAction} 
        gameState={gameState} 
        players={players} 
      />
      
      <ActionHistorySection 
        gameState={gameState} 
        addActionToHistory={addActionToHistory}
        updateActionHistory={updateActionHistory}
        removeActionFromHistory={removeActionFromHistory}
        players={players} 
      />
      
      <RecommendationSection 
        recommendation={recommendation} 
        loading={loading} 
        requestDecision={requestDecision} 
      />
    </div>
  );
}
