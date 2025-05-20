import React from 'react';

function ActionHistorySection({ gameState, addActionToHistory, players, renderActionHistory }) {
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Action History ({gameState.street})</h2>
      {renderActionHistory()}
      
      <div className="action-history">
        <h3 className="mb-2">Add Action</h3>
        <div className="flex flex-wrap gap-2">
          <select id="actionPlayer" className="p-2">
            {players.map((player, idx) => (
              <option key={idx} value={idx}>
                {player.name}
              </option>
            ))}
          </select>
          
          <select id="actionType" className="p-2">
            <option value="fold">Fold</option>
            <option value="call">Call</option>
            <option value="check">Check</option>
            <option value="raise">Raise</option>
          </select>
          
          <input
            type="number"
            id="actionAmount"
            className="p-2"
            placeholder="Amount"
          />
          
          <button
            onClick={() => {
              const playerIdx = parseInt(document.getElementById('actionPlayer').value);
              const action = document.getElementById('actionType').value;
              const amount = parseInt(document.getElementById('actionAmount').value || 0);
              addActionToHistory(playerIdx, action, amount);
            }}
            className="btn btn-secondary"
          >
            Add Action
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionHistorySection;
