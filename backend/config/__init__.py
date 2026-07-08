# config package
import sys

if sys.platform == "win32":
    import pymysql
    pymysql.version_info = (1, 4, 3, "final", 0)
    pymysql.install_as_MySQLdb()
