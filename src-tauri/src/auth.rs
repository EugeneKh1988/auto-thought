use sqlx::{FromRow, SqlitePool};
use tauri::State;

use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use password_hash::{SaltString, PasswordHash};
use password_hash::rand_core::OsRng;
use uuid::Uuid;

// ==================== STATE ====================

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
}

// ==================== MODELS ====================

#[derive(FromRow)]
struct UserRow {
    id: i64,
    email: String,
    password: String,
}

#[derive(FromRow)]
struct SessionRow {
    user_id: i64,
}

// ==================== PASSWORD ====================

fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);

    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .unwrap()
        .to_string()
}

fn verify_password(hash: &str, password: &str) -> bool {
    let parsed = PasswordHash::new(hash).unwrap();

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

// ==================== COMMANDS ====================

#[tauri::command]
pub async fn register(
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<(), String> {
    let hash = hash_password(&password);

    sqlx::query(
        "INSERT INTO users (email, password) VALUES (?, ?)"
    )
    .bind(email)
    .bind(hash)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

// -------------------------------------------------

#[tauri::command]
pub async fn login(
    state: State<'_, AppState>,
    email: String,
    password: String,
) -> Result<String, String> {
    let user = sqlx::query_as::<_, UserRow>(
        "SELECT id, email, password FROM users WHERE email = ?"
    )
    .bind(email)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    let user = match user {
        Some(u) => u,
        None => return Err("User not found".into()),
    };

    if !verify_password(&user.password, &password) {
        return Err("Invalid password".into());
    }

    let token = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)"
    )
    .bind(&token)
    .bind(user.id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(token)
}

// -------------------------------------------------

#[tauri::command]
pub async fn logout(
    state: State<'_, AppState>,
    token: String,
) -> Result<(), String> {
    sqlx::query(
        "DELETE FROM sessions WHERE token = ?"
    )
    .bind(token)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

// -------------------------------------------------
#[tauri::command]
pub async fn get_user(
    state: State<'_, AppState>,
    token: String,
) -> Result<Option<i64>, String> {
    let res = sqlx::query_as::<_, SessionRow>(
        "SELECT user_id FROM sessions WHERE token = ?"
    )
    .bind(token)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(res.map(|r| r.user_id))
}