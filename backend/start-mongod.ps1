$mongodPath = "C:\Users\USER\Desktop\CareerForge\backend\node_modules\.cache\mongodb-memory-server\mongod-x64-win32-8.2.6.exe"
Start-Process -FilePath $mongodPath -ArgumentList "--dbpath", "C:\data\db", "--port", "27017", "--bind_ip", "127.0.0.1" -WindowStyle Hidden
