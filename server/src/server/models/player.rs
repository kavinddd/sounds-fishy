use serde::Serialize;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::server::models::messages::server_message::ServerMessage;

pub type PlayerId = Uuid;

#[derive(Debug, Clone, Serialize)]
pub struct Player {
    pub id: Uuid,
    pub name: String,

    #[serde(skip)]
    pub tx: mpsc::UnboundedSender<ServerMessage>,
}

impl Player {
    pub fn new(name: String, tx: mpsc::UnboundedSender<ServerMessage>) -> Self {
        let id = Uuid::new_v4();
        Self { id, name, tx }
    }
}
