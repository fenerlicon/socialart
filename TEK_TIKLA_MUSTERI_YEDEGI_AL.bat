@echo off
chcp 65001 > nul
title Socialart Ajans - Tek Tıkla Müşteri Veritabanı Yedeği Al
echo ============================================================
echo      SOCIALART AJANS - OTOMATİK VERİTABANI YEDEKLEME
echo ============================================================
echo.
echo Supabase bulut veritabanındaki 189+ Müşteri, Marka ve Ödeme
echo verileri bilgisayarınıza (JSON + Excel CSV) olarak indiriliyor...
echo.

node scripts/backup-db.cjs

echo.
echo ============================================================
echo İşlem Tamamlandı! Tüm yedekler "backups" klasörüne kaydedildi.
echo ============================================================
echo.
pause
