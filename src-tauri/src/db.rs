use sqlx::SqlitePool;
use std::path::PathBuf;

pub async fn init_db(path: PathBuf) -> SqlitePool {
    let uri = format!("sqlite://{}", path.display());

    let pool = SqlitePool::connect(&uri)
        .await
        .expect("DB connect failed");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL
        );
        "#,
    )
    .execute(&pool)
    .await
    .unwrap();

    pool
}