import os
import getpass
import pymysql
from pathlib import Path

env_path = Path(__file__).parent / '.env'


def write_env(user, pwd):
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(
            f"DB_HOST=localhost\nDB_USER={user}\nDB_PASSWORD={pwd}\nDB_NAME=payroll\n")


# 获取MySQL账号和密码
mysql_user = input('Enter MySQL username: ')
mysql_password = getpass.getpass('Enter MySQL password: ')
write_env(mysql_user, mysql_password)

# 数据库连接参数
host = 'localhost'
db_name = 'payroll'

# 读取SQL文件
with open('create_db.sql', 'r', encoding='utf-8') as f:
    sql_script = f.read()

# 连接MySQL并执行SQL脚本
try:
    print('WARNING: This operation will erase all existing data in the database!')
    confirm = input('Are you sure you want to continue? (yes/[no]): ')
    if confirm.lower() != 'yes':
        print('Operation cancelled.')
        exit(0)

    print('Connecting to MySQL...')
    conn = pymysql.connect(host=host, user=mysql_user, password=mysql_password,
                           autocommit=True, charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
    with conn.cursor() as cursor:
        print('Sourcing create_db.sql...')
        delimiter = ';'
        statements = []
        statement = ''
        for line in sql_script.splitlines():
            line_strip = line.strip()
            if line_strip.upper().startswith('DELIMITER '):
                delimiter = line_strip.split()[1]
                continue
            if delimiter not in line:
                statement += line + '\n'
                continue
            # Split by delimiter, but keep possible multiple statements in one line
            parts = (statement + line).split(delimiter)
            for part in parts[:-1]:
                sql = part.strip()
                if sql:
                    cursor.execute(sql)
            statement = parts[-1]  # Remainder for next lines
        # Execute any remaining statement
        if statement.strip():
            cursor.execute(statement.strip())
    print('Database initialized successfully!')
except Exception as e:
    print('Error initializing database:', e)
finally:
    if 'conn' in locals():
        conn.close()
