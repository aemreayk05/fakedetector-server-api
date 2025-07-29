const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // IP başına maksimum 100 istek
});
app.use(limiter);

// Veritabanı bağlantısı
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err);
  } else {
    console.log('✅ SQLite veritabanına bağlandı');
  }
});

// API Key middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY || 'fakedetector-secret-key-2025';
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Geçersiz API anahtarı' });
  }
  
  next();
};

// ===== ANALİZ SONUÇLARI ENDPOINT'LERİ =====

// Analiz sonucu kaydet
app.post('/api/analysis-results', authenticateApiKey, (req, res) => {
  const {
    image_hash,
    prediction,
    confidence,
    analysis_mode,
    processing_time,
    model_used,
    model_author,
    probabilities,
    raw_score,
    timestamp,
    device_info,
    app_version
  } = req.body;

  const sql = `
    INSERT INTO analysis_results (
      image_hash, prediction, confidence, analysis_mode, processing_time,
      model_used, model_author, probabilities, raw_score, timestamp,
      device_info, app_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    image_hash, prediction, confidence, analysis_mode, processing_time,
    model_used, model_author, probabilities, raw_score, timestamp,
    JSON.stringify(device_info), app_version
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('❌ Analiz sonucu kaydetme hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    
    res.json({
      id: this.lastID,
      message: 'Analiz sonucu başarıyla kaydedildi'
    });
  });
});

// Analiz geçmişini getir
app.get('/api/analysis-results', authenticateApiKey, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT * FROM analysis_results 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(sql, [limit, offset], (err, rows) => {
    if (err) {
      console.error('❌ Geçmiş getirme hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    
    res.json({
      results: rows,
      total: rows.length,
      limit,
      offset
    });
  });
});

// Tüm geçmişi temizle
app.delete('/api/analysis-results', authenticateApiKey, (req, res) => {
  const sql = 'DELETE FROM analysis_results';
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Geçmiş temizleme hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    
    res.json({ message: 'Tüm geçmiş temizlendi' });
  });
});

// ===== GERİ BİLDİRİM ENDPOINT'LERİ =====

// Kullanıcı geri bildirimi kaydet
app.post('/api/feedback', authenticateApiKey, (req, res) => {
  const { analysis_id, feedback, timestamp } = req.body;

  const sql = `
    INSERT INTO user_feedback (analysis_id, feedback, timestamp)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [analysis_id, feedback, timestamp], function(err) {
    if (err) {
      console.error('❌ Geri bildirim kaydetme hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    
    res.json({
      id: this.lastID,
      message: 'Geri bildirim başarıyla kaydedildi'
    });
  });
});

// ===== İSTATİSTİK ENDPOINT'LERİ =====

// İstatistikleri getir
app.get('/api/statistics', authenticateApiKey, (req, res) => {
  const stats = {};
  
  // Toplam analiz sayısı
  db.get('SELECT COUNT(*) as total FROM analysis_results', (err, row) => {
    if (err) {
      console.error('❌ İstatistik hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    
    stats.totalAnalyses = row.total;
    
    // Gerçek/Sahte dağılımı
    db.get(`
      SELECT 
        SUM(CASE WHEN prediction = 'Gerçek' THEN 1 ELSE 0 END) as real_count,
        SUM(CASE WHEN prediction = 'Sahte' THEN 1 ELSE 0 END) as fake_count
      FROM analysis_results
    `, (err, row) => {
      if (err) {
        console.error('❌ İstatistik hatası:', err);
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }
      
      stats.realCount = row.real_count || 0;
      stats.fakeCount = row.fake_count || 0;
      
      // Ortalama güven oranı
      db.get('SELECT AVG(confidence) as avg_confidence FROM analysis_results', (err, row) => {
        if (err) {
          console.error('❌ İstatistik hatası:', err);
          return res.status(500).json({ error: 'Veritabanı hatası' });
        }
        
        stats.averageConfidence = Math.round((row.avg_confidence || 0) * 100) / 100;
        
        res.json(stats);
      });
    });
  });
});

// ===== SİSTEM ENDPOINT'LERİ =====

// Sunucu sağlık durumu
app.get('/api/health', authenticateApiKey, (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected'
  });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.json({
    message: 'FakeDetector SQL Server API',
    version: '1.0.0',
    endpoints: {
      'POST /api/analysis-results': 'Analiz sonucu kaydet',
      'GET /api/analysis-results': 'Geçmiş getir',
      'DELETE /api/analysis-results': 'Geçmiş temizle',
      'POST /api/feedback': 'Geri bildirim kaydet',
      'GET /api/statistics': 'İstatistikleri getir',
      'GET /api/health': 'Sunucu durumu'
    }
  });
});

// Sunucuyu başlat
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FakeDetector SQL Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📊 API Dokümantasyonu: http://localhost:${PORT}`);
  console.log(`🌐 Render Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Key: ${process.env.API_KEY || 'fakedetector-secret-key-2025'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Sunucu kapatılıyor...');
  db.close((err) => {
    if (err) {
      console.error('❌ Veritabanı kapatma hatası:', err);
    } else {
      console.log('✅ Veritabanı bağlantısı kapatıldı');
    }
    process.exit(0);
  });
}); 