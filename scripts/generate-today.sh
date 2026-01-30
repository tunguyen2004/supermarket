#!/bin/bash
# =====================================================
# GENERATE TODAY'S DATA
# =====================================================

echo "🚀 Supermarket Data Generator"
echo "=============================="

docker cp database/daily_runner.sql minimart_postgres:/tmp/
docker exec -i minimart_postgres psql -U admin -d minimart_db -f /tmp/daily_runner.sql

echo ""
echo "✅ Done!"
