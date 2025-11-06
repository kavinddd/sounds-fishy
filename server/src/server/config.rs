use std::{env, str::FromStr};

use tracing::info;

#[derive(Debug)]
pub struct UnsupportedAppProfile;
impl std::fmt::Display for UnsupportedAppProfile {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Unsupported profile — use: dev, test, prod")
    }
}

impl std::error::Error for UnsupportedAppProfile {}

#[derive(Debug, Clone)]
pub enum AppProfile {
    DEV,
    TEST,
    PROD,
}

impl FromStr for AppProfile {
    type Err = UnsupportedAppProfile;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "dev" => Ok(AppProfile::DEV),
            "local" => Ok(AppProfile::DEV),
            "test" => Ok(AppProfile::TEST),
            "prod" => Ok(AppProfile::PROD),
            _ => Err(UnsupportedAppProfile),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub port: u16,
    pub profile: AppProfile,
}

impl Config {
    fn get_default() -> Self {
        Self {
            port: 8080,
            profile: AppProfile::PROD,
        }
    }

    pub fn from_env() -> Self {
        let default = Self::get_default();

        dotenvy::dotenv().ok();
        info!("Loading .env successfully");

        let port = match env::var("PORT") {
            Ok(p) => p.parse().unwrap(),
            Err(_) => {
                info!(
                    "No PORT found in .env, default is applied ({})",
                    default.port
                );
                default.port
            }
        };

        let profile = match env::var("PROFILE") {
            Ok(p) => p.parse().unwrap(),
            Err(_) => {
                info!(
                    "No PROFILE found in .env, default is applied ({:?})",
                    default.profile
                );
                default.profile
            }
        };

        Self { port, profile }
    }
}
