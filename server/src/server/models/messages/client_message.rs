use serde::{Deserialize, Serialize};

use crate::server::models::room::RoomCode;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientMessage {
    // Join { room_code: RoomCode },
    Name { name: String },
    // Host,
    Chat { text: String },
}
