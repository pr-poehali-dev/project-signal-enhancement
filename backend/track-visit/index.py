import json
import os
import socket
import struct
import hashlib
import hmac
import urllib.parse


def pg_simple_query(host, port, user, password, database, sql):
    """Выполняет Simple Query через PostgreSQL wire protocol."""
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

    # Startup message
    params = f'user\x00{user}\x00database\x00{database}\x00\x00'
    params_bytes = params.encode('utf-8')
    length = 4 + 4 + len(params_bytes)
    startup = struct.pack('!II', length, 196608) + params_bytes
    send(startup)

    # Handle auth
    while True:
        msg_type, body = recv_msg()
        if msg_type == b'R':  # Authentication
            auth_type = struct.unpack('!I', body[:4])[0]
            if auth_type == 0:
                break  # AuthenticationOk
            elif auth_type == 3:  # CleartextPassword
                pwd_msg = (password + '\x00').encode()
                msg = b'p' + struct.pack('!I', 4 + len(pwd_msg)) + pwd_msg
                send(msg)
            elif auth_type == 5:  # MD5
                salt = body[4:8]
                pw_hash = hashlib.md5((password + user).encode()).hexdigest().encode()
                md5_hash = 'md5' + hashlib.md5(pw_hash + salt).hexdigest()
                pwd_msg = (md5_hash + '\x00').encode()
                msg = b'p' + struct.pack('!I', 4 + len(pwd_msg)) + pwd_msg
                send(msg)
            elif auth_type == 10:  # SASL
                # SCRAM-SHA-256
                mechanisms = body[4:].split(b'\x00')
                nonce = 'rOprNGfwEbeRWgbNEkqO'
                client_first = f'n,,n=,r={nonce}'
                sasl_init = b'SCRAM-SHA-256\x00' + struct.pack('!I', len(client_first)) + client_first.encode()
                msg = b'p' + struct.pack('!I', 4 + len(sasl_init)) + sasl_init
                send(msg)

                msg_type2, body2 = recv_msg()  # AuthenticationSASLContinue
                server_first = body2[4:].decode()
                parts = dict(x.split('=', 1) for x in server_first.split(','))
                server_nonce = parts['r']
                salt_b64 = parts['s']
                iterations = int(parts['i'])

                import base64, hashlib, hmac
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

                msg_type3, body3 = recv_msg()  # AuthenticationSASLFinal or AuthenticationOk
                if msg_type3 == b'R':
                    auth_type3 = struct.unpack('!I', body3[:4])[0]
                    if auth_type3 == 12:  # SASLFinal
                        pass
                    elif auth_type3 == 0:
                        break
        elif msg_type == b'Z':  # ReadyForQuery
            break
        elif msg_type == b'E':  # Error
            raise Exception(f"PG Error during auth: {body}")

    # Wait for ReadyForQuery
    while True:
        msg_type, body = recv_msg()
        if msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"PG Startup Error: {body}")

    # Send Simple Query
    sql_bytes = (sql + '\x00').encode('utf-8')
    msg = b'Q' + struct.pack('!I', 4 + len(sql_bytes)) + sql_bytes
    send(msg)

    # Read response
    while True:
        msg_type, body = recv_msg()
        if msg_type == b'Z':  # ReadyForQuery
            break
        elif msg_type == b'E':  # Error
            raise Exception(f"PG Query Error: {body}")

    sock.close()


def handler(event: dict, context) -> dict:
    """Сохраняет UTM-метки и данные визита в базу данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')

    ip_address = (
        event.get('headers', {}).get('x-forwarded-for', '').split(',')[0].strip()
        or event.get('requestContext', {}).get('identity', {}).get('sourceIp')
    )

    def esc(v):
        if v is None:
            return 'NULL'
        return "'" + str(v).replace("'", "''") + "'"

    sql = (
        "INSERT INTO utm_visits "
        "(utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, page_url, user_agent, ip_address) "
        f"VALUES ({esc(body.get('utm_source'))}, {esc(body.get('utm_medium'))}, "
        f"{esc(body.get('utm_campaign'))}, {esc(body.get('utm_term'))}, "
        f"{esc(body.get('utm_content'))}, {esc(body.get('referrer'))}, "
        f"{esc(body.get('page_url'))}, {esc(body.get('user_agent'))}, {esc(ip_address)})"
    )

    dsn = os.environ['DATABASE_URL']
    r = urllib.parse.urlparse(dsn)

    pg_simple_query(
        host=r.hostname,
        port=r.port or 5432,
        user=urllib.parse.unquote(r.username),
        password=urllib.parse.unquote(r.password),
        database=r.path.lstrip('/'),
        sql=sql
    )

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }