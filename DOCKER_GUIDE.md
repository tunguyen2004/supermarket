📋 Hướng dẫn cho team
🆕 Thành viên mới (Pull lần đầu)



git clone <repo-url>
cd supermarket
docker-compose up -d --build



# Xong! Không cần chạy gì thêm
🔄 Thành viên cũ (Đã có database)
Cách 1: Giữ dữ liệu cũ (Chỉ update backend/frontend)


git pull origin main
docker-compose up -d --build backend
# hoặc
docker-compose up -d --build frontend

Cách 2: Reset sạch (nhanh hơn)

git pull origin main
docker-compose down -v
docker-compose up -d --build