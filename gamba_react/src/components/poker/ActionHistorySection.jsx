import React, { useState } from 'react';

function ActionHistorySection({ gameState, addActionToHistory, updateActionHistory, removeActionFromHistory, players }) {
  const [newAction, setNewAction] = useState({
    playerIdx: 0,
    action: 'call',
    amount: 0
  });
  
  const [editingAction, setEditingAction] = useState(null);
  
  const handleAddAction = () => {
    addActionToHistory(newAction.playerIdx, newAction.action, newAction.amount);
    // Reset amount if it's not a check or fold
    if (newAction.action !== 'check' && newAction.action !== 'fold') {
      setNewAction({ ...newAction, amount: 0 });
    }
  };
  
  const handleUpdateAction = (index) => {
    if (editingAction) {
      updateActionHistory(gameState.street, index, editingAction);
      setEditingAction(null);
    }
  };
  
  const handleEditAction = (action, index) => {
    setEditingAction({ ...action, index });
  };
  
  const handleCancelEdit = () => {
    setEditingAction(null);
  };
  
  const renderActionHistories = () => {
    const street = gameState.street;
    const actions = gameState.actionHistories[street] || [];
    
    if (actions.length === 0) {
      return <p className="mb-4">No actions recorded for this street yet.</p>;
    }
    
    return (
      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, idx) => {
              const player = players[action.playerIdx];
              const isEditing = editingAction && editingAction.index === idx;
              
              return (
                <tr key={idx} className="border-b">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">
                    {isEditing ? (
                      <select 
                        value={editingAction.playerIdx}
                        onChange={(e) => setEditingAction({ ...editingAction, playerIdx: parseInt(e.target.value) })}
                        className="p-1"
                      >
                        {players.map((p, i) => (
                          <option key={i} value={i}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{player.name}</span>
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select 
                        value={editingAction.action}
                        onChange={(e) => setEditingAction({ ...editingAction, action: e.target.value })}
                        className="p-1"
                      >
                        <option value="fold">Fold</option>
                        <option value="call">Call</option>
                        <option value="check">Check</option>
                        <option value="raise">Raise</option>
                      </select>
                    ) : (
                      <span className="capitalize">{action.action}</span>
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editingAction.amount}
                        onChange={(e) => setEditingAction({ ...editingAction, amount: parseInt(e.target.value) || 0 })}
                        className="p-1 w-20"
                        disabled={editingAction.action === 'fold' || editingAction.action === 'check'}
                      />
                    ) : (
                      <span>{(action.action === 'raise' || action.action === 'call') ? action.amount : '-'}</span>
                    )}
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleUpdateAction(idx)}
                          className="btn btn-primary p-1 text-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn p-1 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditAction(action, idx)}
                          className="btn p-1 text-sm"
                          title="Edit action"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => removeActionFromHistory(street, idx)}
                          className="btn btn-danger p-1 text-sm"
                          title="Remove action"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Action History ({gameState.street})</h2>
      
      {renderActionHistories()}
      
      <div className="action-history">
        <h3 className="mb-2">Add Action</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-sm mb-1">Player:</label>
            <select 
              value={newAction.playerIdx}
              onChange={(e) => setNewAction({ ...newAction, playerIdx: parseInt(e.target.value) })}
              className="p-2"
            >
              {players.map((player, idx) => (
                <option key={idx} value={idx}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Action:</label>
            <select 
              value={newAction.action}
              onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
              className="p-2"
            >
              <option value="fold">Fold</option>
              <option value="call">Call</option>
              <option value="check">Check</option>
              <option value="raise">Raise</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Amount:</label>
            <input
              type="number"
              value={newAction.amount}
              onChange={(e) => setNewAction({ ...newAction, amount: parseInt(e.target.value) || 0 })}
              className="p-2"
              placeholder="Amount"
              disabled={newAction.action === 'fold' || newAction.action === 'check'}
            />
          </div>
          
          <button
            onClick={handleAddAction}
            className="btn btn-secondary"
          >
            Add Action
          </button>
          
          <button
            onClick={() => {
              // Clear all actions for current street
              if (confirm(`Are you sure you want to clear all actions for ${gameState.street}?`)) {
                updateActionHistory(gameState.street, null, []);
              }
            }}
            className="btn btn-danger ml-auto"
            disabled={!gameState.actionHistories[gameState.street] || gameState.actionHistories[gameState.street].length === 0}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionHistorySection;
