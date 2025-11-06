use axum::{
    extract::{
        ws::{self, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::{IntoResponse, Response},
    routing::get,
    Router,
};

use futures_util::{SinkExt, StreamExt};
use tokio::sync::mpsc;
use tracing::{debug, error, info};

use crate::server::models::{
    app::AppState,
    messages::{client_message::ClientMessage, server_message::ServerMessage},
    player::Player,
    room::{RoomCode, RoomOpCmd},
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/test", get(|| async { "Room!" }))
        .route("/create", get(create_room_handler))
        .route("/join/{roomCode}", get(join_room_handler))
        .route("/", get(list_room_handler))
        .route("/{roomCode}", get(|| async {}))
}

async fn list_room_handler(State(app_state): State<AppState>) -> Response {
    let rooms: Vec<RoomCode> = app_state
        .room_service
        .rooms
        .iter()
        .map(|e| e.value().clone().code)
        .collect();

    axum::Json(rooms).into_response()
}

// async fn get_room_handler(
//     State(app_state): State<AppState>,
//     Path(room_code): Path<RoomCode>,
// ) -> Response {
//     match app_state.room_service.get_room(&room_code) {
//         Some(_) => axum::Json(rooms).into_response(),
//         None => todo!(),
//     }
// }
//
async fn create_room_handler(ws: WebSocketUpgrade, State(app_state): State<AppState>) -> Response {
    // app_state.room_service.create_room(Player);
    let room_code = app_state.room_service.create_room();

    info!("Room is created code: {}", &room_code);

    ws.on_upgrade(|ws| async {
        ws_handler(ws, app_state, room_code).await;
    })
}

async fn join_room_handler(
    ws: WebSocketUpgrade,
    Path(room_code): Path<RoomCode>,
    State(app_state): State<AppState>,
) -> Response {
    if !app_state.room_service.is_room_exist(&room_code) {
        Response::builder()
            .status(404)
            .body("Room not available".into())
            .unwrap()
    } else {
        ws.on_upgrade(move |ws| ws_handler(ws, app_state, room_code))
    }
}

async fn ws_handler(ws: WebSocket, app_state: AppState, room_code: RoomCode) {
    // let room = app_state.room_service.rooms.get(&room_code).unwrap().into;
    let room = app_state.room_service.get_room(&room_code).unwrap();

    let (mut sink, mut stream) = ws.split();
    let (client_tx, mut client_rx) = mpsc::unbounded_channel();

    let _ = client_tx.send(ServerMessage::AskName).unwrap();

    let writer = tokio::spawn(async move {
        while let Some(msg) = client_rx.recv().await {
            let json = serde_json::to_string(&msg).unwrap();

            match sink.send(ws::Message::Text(json.clone().into())).await {
                Ok(_) => {
                    debug!("sent {:?}", json);
                }
                Err(_) => {
                    debug!("cannot sent {:?}, connections breaks", json);
                    break;
                }
            }
        }
    });

    // TODO: using room channel + client channel here depending on event
    let reader = tokio::spawn(async move {
        while let Some(Ok(msg)) = stream.next().await {
            match msg {
                ws::Message::Text(t) => {
                    let client_msg = serde_json::from_str::<ClientMessage>(&t);

                    debug!("client_msg {:?}", client_msg);

                    match client_msg {
                        Ok(client_msg) => match client_msg {
                            ClientMessage::Name { name } => {
                                let _ = room.tx.send(RoomOpCmd::Join {
                                    player: Player::new(name, client_tx.clone()),
                                });
                            }
                            // ClientMessage::Host => todo!(),
                            ClientMessage::Chat { text } => {
                                let _ = room.tx.send(RoomOpCmd::BroadcastSystem { message: text });
                            }
                        },
                        Err(_) => {
                            let _ = client_tx.send(ServerMessage::Error {
                                message: format!("Cannot parse the message."),
                            });
                        }
                    }
                }
                ws::Message::Close(_) => break,
                ws::Message::Ping(_) => {}
                ws::Message::Pong(_) => {}
                _ => {
                    error!("Server receieved upsupported type, disconnected");
                    break;
                }
            }
        }
    });

    tokio::try_join!(writer, reader).ok();
}
