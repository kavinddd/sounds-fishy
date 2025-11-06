use std::{
    net::{Ipv4Addr, SocketAddrV4},
    sync::Arc,
};

use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;
use tracing::info;

use crate::server::{
    config::Config,
    models::app::AppState,
    routes::room_routes,
    services::{game_service::GameService, room_service::RoomService},
};

pub struct Server {
    config: Config,
}

impl Server {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn run(&self) {
        let game_service = GameService::new();
        let room_service = RoomService::new();

        let app_state = AppState::new(
            Arc::new(room_service),
            Arc::new(game_service),
            Arc::new(self.config.clone()),
        );

        let app = Router::new()
            .route("/health", get(|| async { "OK" }))
            .nest("/rooms", room_routes::routes())
            .fallback(|| async { "No route found!" })
            .layer(TraceLayer::new_for_http())
            .with_state(app_state);

        let socket = SocketAddrV4::new(Ipv4Addr::new(0, 0, 0, 0), self.config.port);

        let listener = tokio::net::TcpListener::bind(socket)
            .await
            .expect("Cannot bind socket");

        info!("Server config {:?}", self.config);
        axum::serve(listener, app).await.unwrap()
    }
}
