use std::{collections::HashMap, error::Error};

use tokio::sync::mpsc;

use crate::server::models::player::{Player, PlayerId};

pub type RoomCode = String;

#[derive(Debug)]
pub enum RoomOpCmd {
    Join { player: Player },
    Leave { player: Player },
    Kick { player: Player, target_id: PlayerId },
    BroadcastState {},
    BroadcastSystem { message: String },
    BroadcastChat { message: String },
}

#[derive(Debug, Clone)]
pub struct RoomSpawnHandle {
    pub code: RoomCode,
    pub tx: mpsc::UnboundedSender<RoomOpCmd>,
}

#[derive(Debug, Clone)]
pub struct RoomState {
    host_id: Option<PlayerId>, // player id
    pub players: HashMap<PlayerId, Player>,
}

impl RoomState {
    // region: associate
    pub fn new() -> Self {
        Self {
            host_id: None,
            players: HashMap::new(),
        }
    }
    // endregion

    // region: methods
    //
    pub fn get_player_num(&self) -> usize {
        self.players.len()
    }

    pub fn has_no_player(&self) -> bool {
        self.players.len() == 0
    }

    pub fn is_player_exist(&self, player_id: &PlayerId) -> bool {
        self.players.contains_key(player_id)
    }

    pub fn is_host(&self, player_id: &PlayerId) -> bool {
        self.host_id == Some(*player_id)
    }

    pub fn add_player(&mut self, player: &Player) -> Result<(), Box<dyn Error>> {
        if self.has_no_player() {
            self.host_id = Some(player.id)
        }

        let _ = self.players.insert(player.id, player.clone());
        Ok::<(), Box<dyn Error>>(())
    }

    pub fn remove_player(&mut self, player_id: &PlayerId) -> Result<Player, Box<dyn Error>> {
        if self.is_host(player_id) {
            match self.players.values().next() {
                Some(next_host) => self.host_id = Some(next_host.id),
                None => self.host_id = None,
            };
        }
        let kicked_player = self.players.remove(player_id).unwrap();
        Ok::<Player, Box<dyn Error>>(kicked_player)
    }

    // endregion
}
