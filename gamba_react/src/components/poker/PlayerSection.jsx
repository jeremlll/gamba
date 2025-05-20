import React from 'react';

function PlayerSection({ players, updatePlayer, addPlayer }) {
  return (
    <div className="card mb-6">
      <h2 className="mb-2">Players</h2>
      <div className="mb-4">
        {players.map((player, index) => (
          <div key={index} className="player-card flex flex-wrap gap-2 items-center p-2">
            <input
              type="text"
              value={player.name}
              onChange={(e) => updatePlayer(index, 'name', e.target.value)}
              className="p-1"
              placeholder="Name"
            />
            <input
              type="number"
              value={player.stack}
              onChange={(e) => updatePlayer(index, 'stack', parseInt(e.target.value))}
              className="p-1"
              placeholder="Stack"
            />
            <select
              value={player.state}
              onChange={(e) => updatePlayer(index, 'state', e.target.value)}
              className="p-1"
            >
              <option value="participating">Active</option>
              <option value="folded">Folded</option>
              <option value="allin">All-in</option>
            </select>
            {index === 0 && (
              <span className="ml-auto p-1">
                MyBot
              </span>
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={addPlayer}
        className="btn btn-primary"
      >
        Add Player
      </button>
    </div>
  );
}

export default PlayerSection;
