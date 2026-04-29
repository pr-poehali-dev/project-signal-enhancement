import json
import os
import socket
import struct
import hashlib
import hmac
import urllib.parse


def pg_query(dsn, sql):
    """Выполняет Simple Query через PostgreSQL wire protocol, возвращает строки."""
    r = urllib.parse.urlparse(dsn)
    host = r.hostname
    port = r.port or 5432
    user = urllib.parse.unquote(r.username)
    password = urllib.parse.unquote(r.password)
    database = r.path.lstrip('/')

    sock = socket.create_connection((host, port), timeout=10)

    def send(data):
        sock.sendall(data)

    def recv_msg():
        header = b''
        while len(header) < 5:
            header += sock.recv(5 - len(header))
        msg_type = header[0:1]
        length = struct.unpack('!I', header[1:5])[0]
        body = b''
        remaining = length - 4
        while remaining > 0:
            chunk = sock.recv(remaining)
            body += chunk
            remaining -= len(chunk)
        return msg_type, body

    params = f'user\x00{user}\x00database\x00{database}\x00\x00'
    params_bytes = params.encode('utf-8')
    length = 4 + 4 + len(params_bytes)
    startup = struct.pack('!II', length, 196608) + params_bytes
    send(startup)

    while True:
        msg_type, body = recv_msg()
        if msg_type == b'R':
            auth_type = struct.unpack('!I', body[:4])[0]
            if auth_type == 0:
                break
            elif auth_type == 3:
                pwd_msg = (password + '\x00').encode()
                msg = b'p' + struct.pack('!I', 4 + len(pwd_msg)) + pwd_msg
                send(msg)
            elif auth_type == 5:
                salt = body[4:8]
                pw_hash = hashlib.md5((password + user).encode()).hexdigest().encode()
                md5_hash = 'md5' + hashlib.md5(pw_hash + salt).hexdigest()
                pwd_msg = (md5_hash + '\x00').encode()
                msg = b'p' + struct.pack('!I', 4 + len(pwd_msg)) + pwd_msg
                send(msg)
            elif auth_type == 10:
                nonce = 'rOprNGfwEbeRWgbNEkqO'
                client_first = f'n,,n=,r={nonce}'
                sasl_init = b'SCRAM-SHA-256\x00' + struct.pack('!I', len(client_first)) + client_first.encode()
                msg = b'p' + struct.pack('!I', 4 + len(sasl_init)) + sasl_init
                send(msg)
                msg_type2, body2 = recv_msg()
                server_first = body2[4:].decode()
                parts = dict(x.split('=', 1) for x in server_first.split(','))
                server_nonce = parts['r']
                salt_b64 = parts['s']
                iterations = int(parts['i'])
                import base64
                salt_bytes = base64.b64decode(salt_b64)
                salted_pw = hashlib.pbkdf2_hmac('sha256', password.encode(), salt_bytes, iterations)
                client_key = hmac.new(salted_pw, b'Client Key', 'sha256').digest()
                stored_key = hashlib.sha256(client_key).digest()
                client_final_no_proof = f'c=biws,r={server_nonce}'
                auth_msg = f'n=,r={nonce},{server_first},{client_final_no_proof}'.encode()
                client_sig = hmac.new(stored_key, auth_msg, 'sha256').digest()
                client_proof = base64.b64encode(bytes(a ^ b for a, b in zip(client_key, client_sig))).decode()
                client_final = f'{client_final_no_proof},p={client_proof}'.encode()
                msg = b'p' + struct.pack('!I', 4 + len(client_final)) + client_final
                send(msg)
                msg_type3, body3 = recv_msg()
                if msg_type3 == b'R':
                    auth_type3 = struct.unpack('!I', body3[:4])[0]
                    if auth_type3 == 0:
                        break
        elif msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"PG auth error: {body}")

    while True:
        msg_type, body = recv_msg()
        if msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"PG startup error: {body}")

    sql_bytes = (sql + '\x00').encode('utf-8')
    msg = b'Q' + struct.pack('!I', 4 + len(sql_bytes)) + sql_bytes
    send(msg)

    rows = []
    while True:
        msg_type, body = recv_msg()
        if msg_type == b'D':
            col_count = struct.unpack('!H', body[:2])[0]
            offset = 2
            row = []
            for _ in range(col_count):
                col_len = struct.unpack('!i', body[offset:offset+4])[0]
                offset += 4
                if col_len == -1:
                    row.append(None)
                else:
                    row.append(body[offset:offset+col_len].decode('utf-8'))
                    offset += col_len
            rows.append(row)
        elif msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"PG query error: {body}")

    sock.close()
    return rows


def esc(v):
    if v is None:
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def handler(event: dict, context) -> dict:
    """Приём нового отзыва от клиента. Сохраняет со статусом pending (на модерацию)."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    author = (body.get("author") or "").strip()
    text = (body.get("text") or "").strip()
    stars = body.get("stars", 5)

    if not author or not text:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "author and text are required"})}

    if not isinstance(stars, int) or not (1 <= stars <= 5):
        stars = 5

    schema = os.environ["MAIN_DB_SCHEMA"]
    dsn = os.environ["DATABASE_URL"]

    sql = (
        f"INSERT INTO {schema}.reviews (author, text, stars, status) "
        f"VALUES ({esc(author)}, {esc(text)}, {esc(stars)}, 'pending') RETURNING id"
    )
    rows = pg_query(dsn, sql)
    review_id = int(rows[0][0]) if rows else None

    return {
        "statusCode": 201,
        "headers": cors,
        "body": json.dumps({"ok": True, "id": review_id}),
    }
