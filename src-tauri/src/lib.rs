// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod drizzle_proxy;
include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {epoch_ms}")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = load_migrations();
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:database.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![drizzle_proxy::run_sql, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}