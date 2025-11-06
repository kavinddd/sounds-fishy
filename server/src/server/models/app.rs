use std::sync::Arc;

use crate::server::{
    config::Config,
    services::{game_service::GameService, room_service::RoomService},
};

#[derive(Clone)]
pub struct AppState {
    pub room_service: Arc<RoomService>,
    pub game_service: Arc<GameService>,
    pub config: Arc<Config>,
}
impl AppState {
    pub fn new(
        room_service: Arc<RoomService>,
        game_service: Arc<GameService>,
        config: Arc<Config>,
    ) -> Self {
        Self {
            room_service,
            game_service,
            config,
        }
    }
}
