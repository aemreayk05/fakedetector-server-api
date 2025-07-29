# FakeDetector SQL Server

Bu, FakeDetector uygulaması için SQL sunucusudur. Analiz sonuçlarını, kullanıcı geri bildirimlerini ve istatistikleri saklar.

## 🚀 Hızlı Başlangıç

### 1. Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Veritabanını kur
npm run setup-db

# Sunucuyu başlat
npm start
```

### 2. Environment Ayarları
```bash
# .env dosyası oluştur
cp env.example .env

# API anahtarını güncelle
echo "API_KEY=your-secret-key" >> .env
```

### 3. Test Et
```bash
# Sunucu durumunu kontrol et
curl http://localhost:3000/api/health

# API dokümantasyonunu gör
curl http://localhost:3000/
```

## 📋 Özellikler

- ✅ Analiz sonuçları kaydetme
- ✅ Geçmiş getirme ve yönetimi
- ✅ Kullanıcı geri bildirimleri
- ✅ İstatistikler
- ✅ API Key authentication
- ✅ Rate limiting
- ✅ CORS desteği
- ✅ Güvenlik middleware'leri

## 🔌 API Endpoint'leri

### Analiz Sonuçları
- `POST /api/analysis-results` - Yeni analiz sonucu kaydet
- `GET /api/analysis-results` - Geçmişi getir
- `DELETE /api/analysis-results` - Tüm geçmişi temizle

### Geri Bildirimler
- `POST /api/feedback` - Kullanıcı geri bildirimi kaydet

### Sistem
- `GET /api/statistics` - İstatistikleri getir
- `GET /api/health` - Sunucu durumu

## 🗄️ Veritabanı

### SQLite Kullanımı
- Dosya tabanlı veritabanı
- Otomatik kurulum
- Yedekleme kolaylığı

### Tablolar
- `analysis_results` - Analiz sonuçları
- `user_feedback` - Kullanıcı geri bildirimleri
- `system_logs` - Sistem logları

## 🛡️ Güvenlik

### API Key Authentication
```bash
# Tüm isteklerde API key gerekli
Authorization: Bearer your-api-key
```

### Rate Limiting
- 15 dakikada maksimum 100 istek
- IP bazlı sınırlama

### CORS
- Cross-origin isteklere izin
- Güvenli header'lar

## 🚀 Deployment

### Railway (Önerilen)
```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Proje oluştur
railway login
railway init
railway up
```

### Render
1. render.com'da hesap aç
2. "New Web Service" seç
3. GitHub repo'yu bağla
4. Environment variables ayarla
5. Deploy et

### Heroku
```bash
# Heroku CLI kurulumu
npm install -g heroku

# Proje oluştur
heroku create fakedetector-server
heroku config:set API_KEY=your-api-key
git push heroku main
```

### Kendi Sunucunuzda
```bash
# PM2 ile production
npm install -g pm2
pm2 start server.js --name fakedetector-server
pm2 startup
pm2 save
```

## 📊 Monitoring

### Loglar
```bash
# Sunucu logları
tail -f logs/server.log

# PM2 logları
pm2 logs fakedetector-server
```

### Health Check
```bash
# Sunucu durumu
curl http://your-server.com/api/health
```

## 🔧 Geliştirme

### Development Mode
```bash
# Hot reload ile çalıştır
npm run dev
```

### Test
```bash
# Testleri çalıştır
npm test
```

### Database Reset
```bash
# Veritabanını sıfırla
rm database.sqlite
npm run setup-db
```

## 📝 Environment Variables

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `PORT` | Sunucu portu | `3000` |
| `NODE_ENV` | Ortam | `development` |
| `API_KEY` | API anahtarı | `your-api-key` |
| `DB_PATH` | Veritabanı yolu | `./database.sqlite` |

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **Port zaten kullanımda**
   ```bash
   # Farklı port kullan
   PORT=3001 npm start
   ```

2. **API Key hatası**
   ```bash
   # .env dosyasını kontrol et
   cat .env
   ```

3. **Veritabanı hatası**
   ```bash
   # Veritabanını yeniden kur
   npm run setup-db
   ```

### Loglar
```bash
# Detaylı loglar için
DEBUG=* npm start
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Logları kontrol edin
2. Environment variables'ları doğrulayın
3. Veritabanı bağlantısını test edin
4. GitHub issue açın

---

**Not:** Bu sunucu, FakeDetector uygulamasının SQL entegrasyonu için tasarlanmıştır. Production kullanımı için ek güvenlik önlemleri alınmalıdır. 