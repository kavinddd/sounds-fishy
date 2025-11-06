use std::process::Command;

use mini_proj_axum::server::config::Config;

fn main() {
    // Just call websocat via std::process::Command use std::process::Command;

    let config = Config::from_env();

    let url = format!("ws://localhost:{}/rooms/create", config.port);

    println!("Attempt to connect to: {}", url);

    let status = Command::new("websocat")
        .arg(url)
        .status()
        .expect("Failed to run websocat");

    if !status.success() {
        eprintln!("websocat exited with error");
        std::process::exit(1);
    }
}
