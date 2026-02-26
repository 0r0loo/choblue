#!/bin/bash
set -e

# ============================================================
# 로컬 개발용 DB 초기화 스크립트
# - PostgreSQL 컨테이너 최초 생성 시 1회만 실행됨
# - 새 프로젝트 DB가 필요하면 아래 배열에 추가하면 됨
# ============================================================

DATABASES=(
  "lunch"
  # "pos"
  # "admin"
)

for db in "${DATABASES[@]}"; do
  echo "Creating database: $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE "$db"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
done

echo "All databases created successfully."