import React from 'react';

function PlayerSection({ players, updatePlayer, addPlayer, removePlayer, reorderPlayers }) {
  const movePlayer = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === players.length - 1)) {
      return; // Can't move first player up or last player down
    }
    reorderPlayers(index, index + direction);
  };

  return (
    <div className="card mb-6">
      <h2 className="mb-2">Players</h2>
      <div className="mb-4">
        {players.map((player, index) => (
          <div key={index} className="player-card flex flex-wrap gap-2 items-center p-2">
            <div className="flex items-center gap-1">
              <span className="font-bold">{index}:</span>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                className="p-1"
                placeholder="Name"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <span>Stack:</span>
              <input
                type="number"
                value={player.stack}
                onChange={(e) => updatePlayer(index, 'stack', parseInt(e.target.value))}
                className="p-1 w-20"
                placeholder="Stack"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <span>State:</span>
              <select
                value={player.state}
                onChange={(e) => updatePlayer(index, 'state', e.target.value)}
                className="p-1"
              >
                <option value="participating">Active</option>
                <option value="folded">Folded</option>
                <option value="allin">All-in</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1 ml-auto">
              <button 
                onClick={() => movePlayer(index, -1)}
                disabled={index === 0}
                className="btn p-1"
                title="Move up"
              >
                ↑
              </button>
              <button 
                onClick={() => movePlayer(index, 1)}
                disabled={index === players.length - 1}
                className="btn p-1"
                title="Move down"
              >
                ↓
              </button>
              <button 
                onClick={() => removePlayer(index)}
                className="btn btn-danger p-1"
                title="Remove player"
                disabled={players.length <= 2}
              >
                ×
              </button>
              {index === 0 && (
                <span className="ml-1 p-1 bg-blue-100 text-blue-800 rounded">
                  MyBot
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={addPlayer}
          className="btn btn-primary"
        >
          Add Player
        </button>
        <button 
          onClick={() => {
            // Rotate player positions (useful for moving dealer button)
            const newPlayers = [...players];
            const firstPlayer = newPlayers.shift();
            newPlayers.push(firstPlayer);
            reorderPlayers(0, players.length - 1, newPlayers);
          }}
          className="btn btn-secondary"
          title="Rotate player positions (move dealer)"
        >
          Rotate Positions
        </button>
      </div>
    </div>
  );
}

export default PlayerSection;
