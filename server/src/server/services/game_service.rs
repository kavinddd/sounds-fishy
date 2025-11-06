use crate::server::services::room_service::RoomService;

pub struct GameService {
    room_service: RoomService,
}

impl GameService {
    pub fn new() -> Self {
        Self {
            room_service: RoomService::new(),
        }
    }
}
