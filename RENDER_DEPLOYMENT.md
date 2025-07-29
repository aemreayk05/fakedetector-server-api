# 🚀 Render.com Deployment Rehberi

## 📋 Adımlar

### 1. Render.com'da Hesap Oluşturun
- [render.com](https://render.com) adresine gidin
- GitHub hesabınızla giriş yapın

### 2. Yeni Web Service Oluşturun
1. Dashboard'da "New +" butonuna tıklayın
2. "Web Service" seçin
3. GitHub repository'nizi bağlayın

### 3. Konfigürasyon
```
Name: fakedetector-api
Environment: Node
Region: Frankfurt (EU Central)
Branch: main
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### 4. Environment Variables
```
NODE_ENV=production
API_KEY=fakedetector-secret-key-2025
PORT=10000
```

### 5. Plan Seçimi
- **Free Plan** seçin (aylık 750 saat ücretsiz)

## 🔧 Otomatik Deployment

`render.yaml` dosyası sayesinde otomatik deployment yapılacak.

## 📱 Client Güncellemesi

Client uygulaması artık Render sunucusunu kullanacak:
- URL: `https://fakedetector-api.onrender.com/api`
- API Key: `fakedetector-secret-key-2025`

## 🧪 Test

Deployment tamamlandıktan sonra:
```bash
curl -X GET "https://fakedetector-api.onrender.com/api/health" \
  -H "Authorization: Bearer fakedetector-secret-key-2025"
```

## 📊 Monitoring

Render Dashboard'da:
- Logs
- Metrics
- Health checks
- Auto-scaling

## 🔄 Güncellemeler

GitHub'a push yaptığınızda otomatik olarak yeniden deploy edilir. 