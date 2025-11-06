use crate::server::models::{
    messages::server_message::ServerMessage,
    room::{RoomCode, RoomOpCmd, RoomSpawnHandle, RoomState},
};
use rand::Rng;
use tokio::sync::mpsc;
use tracing::debug;

pub struct RoomService {
    pub rooms: dashmap::DashMap<RoomCode, RoomSpawnHandle>,
}

impl RoomService {
    // region: associate method
    //
    pub fn new() -> Self {
        Self {
            rooms: dashmap::DashMap::new(),
        }
    }

    fn gen_room_code() -> RoomCode {
        let mut rng = rand::rng();
        let start_char = b'a';
        let end_char = b'z';
        (0..4)
            .map(|_| rng.random_range(start_char..=end_char) as char)
            .collect()
    }

    // endregion

    // region: method instance

    fn gen_new_room_code(&self) -> RoomCode {
        loop {
            let room_code = Self::gen_room_code();
            if !self.rooms.contains_key(&room_code) {
                return room_code;
            }
        }
    }
    pub fn create_room(&self) -> RoomCode {
        let new_room_code = Self::gen_new_room_code(&self);
        let room_tx = Self::spawn_room();
        // let room = Room::new(new_room_code.clone());
        self.rooms.insert(
            new_room_code.clone(),
            RoomSpawnHandle {
                code: new_room_code.clone(),
                tx: room_tx,
            },
        );
        new_room_code
    }

    pub fn is_room_exist(&self, room_code: &RoomCode) -> bool {
        self.rooms.contains_key(room_code)
    }

    pub fn get_room(&self, room_code: &RoomCode) -> Option<RoomSpawnHandle> {
        Some(self.rooms.get(room_code)?.clone())
    }

    // pub fn get_room_state(&self, room_code: &RoomCode) -> Option<RoomState> {
    //     Some(self.rooms.get(room_code))
    // }

    // endregion

    // region: event loop
    fn spawn_room() -> mpsc::UnboundedSender<RoomOpCmd> {
        let (tx, mut rx) = mpsc::unbounded_channel::<RoomOpCmd>();
        let result = tx.clone();

        tokio::spawn(async move {
            let mut state = RoomState::new();

            while let Some(cmd) = rx.recv().await {
                match cmd {
                    RoomOpCmd::BroadcastState {} => {
                        state.players.values().for_each(|p| {
                            p.tx.send(ServerMessage::RoomState {
                                player_count: state.get_player_num(),
                                players: state.players.values().cloned().collect(),
                            })
                            .unwrap()
                        });
                    }
                    RoomOpCmd::BroadcastSystem { message } => {
                        state.players.values().for_each(|p| {
                            p.tx.send(ServerMessage::System {
                                message: message.clone(),
                            })
                            .unwrap()
                        })
                    }

                    RoomOpCmd::BroadcastChat { message } => state.players.values().for_each(|p| {
                        p.tx.send(ServerMessage::Chat {
                            message: message.clone(),
                        })
                        .unwrap()
                    }),

                    RoomOpCmd::Join { player } => match state.add_player(&player) {
                        Ok(_) => {
                            debug!("RoomOpCmd Join {:?}", player);
                            let _ = tx.clone().send(RoomOpCmd::BroadcastState {});
                            let _ = tx.clone().send(RoomOpCmd::BroadcastSystem {
                                message: format!("{} is joined", &player.name),
                            });
                        }
                        Err(_) => {
                            let _ = player.tx.send(ServerMessage::Error {
                                message: format!("You are cooked"),
                            });
                        }
                    },
                    RoomOpCmd::Leave { player } => {
                        if state.is_player_exist(&player.id) {
                            let _ = state.remove_player(&player.id);
                        };

                        if state.has_no_player() {
                            break;
                        }

                        let _ = tx.send(RoomOpCmd::BroadcastSystem {
                            message: format!("{} is left", &player.name),
                        });
                    }
                    RoomOpCmd::Kick { player, target_id } => {
                        if state.is_host(&player.id) {
                            let _ = player
                                .tx
                                .send(ServerMessage::Error {
                                    message: format!("You are not host!"),
                                })
                                .unwrap();
                            return;
                        }

                        if player.id == target_id {
                            let _ = player
                                .tx
                                .send(ServerMessage::Error {
                                    message: format!(
                                        "Why are you kicking yourself? Are you crazy?"
                                    ),
                                })
                                .unwrap();
                            return;
                        }

                        if state.is_player_exist(&target_id) {
                            let _ = player
                                .tx
                                .send(ServerMessage::Error {
                                    message: format!("Player ({}) not in the room.", &target_id),
                                })
                                .unwrap();
                            return;
                        }

                        let kick_player = state.remove_player(&target_id).unwrap();

                        let _ = kick_player.tx.send(ServerMessage::Kicked).unwrap();
                    }
                }
            }
        });

        result
    }

    // endregion
}

//

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn should_gen_room_code() {
        let room_code = RoomService::gen_room_code();
        assert_eq!(room_code.len(), 4);
    }
}

// #[test]
// fn should_gen_new_room_code() {
//     let room_service = RoomService::new();
//     room_service.create_room(host)
//     room_service.gen_new_room_code()
// }

//     #[test]
//     fn should_create_room() {
//         let (tx, _) = mpsc::unbounded_channel();
//         let mock_host_player = Player {
//             id: 2,
//             name: "TEST".to_string(),
//             tx: tx,
//         };
//
//         let mut room_service = RoomService::new();
//         room_service.create_room(mock_host_player);
//
//         assert_eq!(room_service.rooms.len(), 1);
//
//         let (code, room) = room_service.rooms.iter().next().unwrap();
//
//         assert_eq!(code.len(), 4);
//         assert_eq!(room.players.len(), 1);
//
//         let player = room.players.iter().next().unwrap();
//         assert_eq!(player.id, 2);
//         assert_eq!(player.name, "TEST".to_string());
//     }
// }
