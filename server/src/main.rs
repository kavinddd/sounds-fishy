use mini_proj_axum::server::{config::Config, game_server::Server};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or(EnvFilter::new("info,tower_http=trace,axum=trace"));

    tracing_subscriber::fmt().with_env_filter(env_filter).init();

    let config = Config::from_env();
    let server = Server::new(config);

    server.run().await
}
