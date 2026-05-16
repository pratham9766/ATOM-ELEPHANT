"""Repair the local PostgreSQL app role for ELEPHANT development."""

from __future__ import annotations

import psycopg


def main() -> None:
    conn = psycopg.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="pratham",
        dbname="elephant",
        autocommit=True,
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_roles WHERE rolname = 'elephant'")
            role_exists = cur.fetchone() is not None

            if role_exists:
                cur.execute("ALTER ROLE elephant WITH LOGIN PASSWORD 'pratham'")
            else:
                cur.execute("CREATE ROLE elephant LOGIN PASSWORD 'pratham'")

            cur.execute("GRANT ALL PRIVILEGES ON DATABASE elephant TO elephant")
            cur.execute("ALTER DATABASE elephant OWNER TO elephant")
            cur.execute("ALTER SCHEMA public OWNER TO elephant")
            cur.execute("GRANT ALL ON SCHEMA public TO elephant")
    finally:
        conn.close()

    print("OK: elephant role is ready for DATABASE_URL")


if __name__ == "__main__":
    main()
