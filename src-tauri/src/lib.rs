use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ScoreRecord {
    pub score: u64,
    pub distance: u64,
    pub coins: u64,
    pub timestamp: u64,
}

#[tauri::command]
fn save_game_record(record: ScoreRecord) -> Result<String, String> {
    println!("New Game Record Received in Rust: {:?}", record);
    Ok("Score saved successfully in Rust backend".to_string())
}

#[tauri::command]
fn ping_backend() -> String {
    "Cyber Runner 3D Rust Backend is online and responsive!".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_game_record,
            ping_backend
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
