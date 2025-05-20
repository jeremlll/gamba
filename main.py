from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from bots.randbot import setup_ai as rand_setup
from bots.gto3 import setup_ai as gto3_setup

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
ai_bot = gto3_setup()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input model to match PyPokerEngine-compatible input
class GameStateInput(BaseModel):
    valid_actions: List[Dict[str, Any]]
    hole_card: List[str]
    round_state: Dict[str, Any]
    is_bot_turn: bool


@app.post("/ai_decision/")
def get_ai_decision(game_state: GameStateInput):
    if not game_state.is_bot_turn:
        return {"message": "Not bot's turn. No action taken."}

    try:
        action, amount = ai_bot.declare_action(
            valid_actions=game_state.valid_actions,
            hole_card=game_state.hole_card,
            round_state=game_state.round_state
        )
        return {
            "action": action,
            "amount": amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI decision error: {str(e)}")
