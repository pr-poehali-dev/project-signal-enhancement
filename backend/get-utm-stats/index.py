import json
import os
import socket
import struct
import urllib.parse


def pg_query(host, port, user, password, database, sql):
    """Simple Query Protocol — возвращает список строк как список словарей."""
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
        elif msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"Auth error: {body}")

    while True:
        msg_type, body = recv_msg()
        if msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"Startup error: {body}")

    sql_bytes = (sql + '\x00').encode('utf-8')
    msg = b'Q' + struct.pack('!I', 4 + len(sql_bytes)) + sql_bytes
    send(msg)

    columns = []
    rows = []

    while True:
        msg_type, body = recv_msg()
        if msg_type == b'T':  # RowDescription
            col_count = struct.unpack('!H', body[:2])[0]
            offset = 2
            for _ in range(col_count):
                end = body.index(b'\x00', offset)
                col_name = body[offset:end].decode('utf-8')
                columns.append(col_name)
                offset = end + 1 + 18
        elif msg_type == b'D':  # DataRow
            col_count = struct.unpack('!H', body[:2])[0]
            offset = 2
            row = {}
            for i in range(col_count):
                col_len = struct.unpack('!i', body[offset:offset+4])[0]
                offset += 4
                if col_len == -1:
                    row[columns[i]] = None
                else:
                    row[columns[i]] = body[offset:offset+col_len].decode('utf-8')
                    offset += col_len
            rows.append(row)
        elif msg_type == b'Z':
            break
        elif msg_type == b'E':
            raise Exception(f"Query error: {body}")

    sock.close()
    return rows


def handler(event: dict, context) -> dict:
    """Возвращает статистику UTM-переходов для страницы аналитики."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    dsn = os.environ['DATABASE_URL']
    r = urllib.parse.urlparse(dsn)
    args = dict(
        host=r.hostname,
        port=r.port or 5432,
        user=urllib.parse.unquote(r.username),
        password=urllib.parse.unquote(r.password),
        database=r.path.lstrip('/')
    )

    total = pg_query(**args, sql="SELECT COUNT(*) AS total FROM utm_visits")
    by_source = pg_query(**args, sql="""
        SELECT COALESCE(utm_source, 'прямой переход') AS source,
               COUNT(*) AS visits
        FROM utm_visits
        GROUP BY utm_source
        ORDER BY visits DESC
        LIMIT 20
    """)
    by_medium = pg_query(**args, sql="""
        SELECT COALESCE(utm_medium, '—') AS medium,
               COUNT(*) AS visits
        FROM utm_visits
        GROUP BY utm_medium
        ORDER BY visits DESC
        LIMIT 20
    """)
    by_campaign = pg_query(**args, sql="""
        SELECT COALESCE(utm_campaign, '—') AS campaign,
               COUNT(*) AS visits
        FROM utm_visits
        GROUP BY utm_campaign
        ORDER BY visits DESC
        LIMIT 20
    """)
    by_day = pg_query(**args, sql="""
        SELECT TO_CHAR(created_at, 'DD.MM') AS day,
               COUNT(*) AS visits
        FROM utm_visits
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'DD.MM'), DATE_TRUNC('day', created_at)
        ORDER BY DATE_TRUNC('day', created_at)
    """)
    recent = pg_query(**args, sql="""
        SELECT utm_source, utm_medium, utm_campaign, utm_term,
               page_url, ip_address,
               TO_CHAR(created_at, 'DD.MM.YYYY HH24:MI') AS created_at
        FROM utm_visits
        ORDER BY created_at DESC
        LIMIT 50
    """)

    result = {
        'total': int(total[0]['total']) if total else 0,
        'by_source': by_source,
        'by_medium': by_medium,
        'by_campaign': by_campaign,
        'by_day': by_day,
        'recent': recent,
    }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result, ensure_ascii=False)
    }
