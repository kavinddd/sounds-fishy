use serde::Serialize;

use crate::server::models::player::{self};

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerMessage {
    AskName,
    Start,
    Kicked,
    Error {
        message: String,
    },
    Chat {
        message: String,
    },
    System {
        message: String,
    },
    RoomState {
        player_count: usize,
        players: Vec<player::Player>,
    },
}
