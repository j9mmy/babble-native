// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, hf_request])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

use reqwest::Client;
use serde_json::{json, Value};
use serde::Serialize;

#[derive(Serialize)]
struct HfResponse {
    model: String,
    generated_text: String,
}

#[tauri::command]
async fn hf_request(message: &str, model: &str, key: &str) -> Result<Value, String> {
    // Set your Hugging Face API token
    let hf_api_token = key;

    // Create a new HTTP client
    let client = Client::new();

    // Define the request payload
    let payload = json!({
        "inputs": message,
        "parameters": {
          "return_full_text": false,
          "max_new_tokens": 500
        },
        "options": {
          "use_cache": false
        }
    });

    // Send the POST request
    let response = client
        .post("https://api-inference.huggingface.co/models/".to_owned() + model)
        .bearer_auth(hf_api_token)
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Parse the response text as JSON
    let response_json: Value = response.json().await.map_err(|e| e.to_string())?;
    println!("{}", response_json);

    // Extract the generated text from the response
    let generated_text = response_json[0]["generated_text"]
        .as_str()
        .ok_or("Failed to extract generated text")?
        .to_string();

    // Create the response struct
    let hf_response = HfResponse {
        model: model.to_string(),
        generated_text,
    };

    // Serialize the response struct to JSON
    let response_value = serde_json::to_value(hf_response).map_err(|e| e.to_string())?;

    Ok(response_value)
}