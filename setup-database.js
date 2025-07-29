const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🗄️ Veritabanı kurulumu başlıyor...');

// Veritabanı dosyası oluştur
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ Veritabanı oluşturma hatası:', err);
    process.exit(1);
  }
  console.log('✅ Veritabanı dosyası oluşturuldu');
});

// Tabloları oluştur
const createTables = () => {
  return new Promise((resolve, reject) => {
    // Analiz sonuçları tablosu
    const analysisResultsTable = `
      CREATE TABLE IF NOT EXISTS analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_hash VARCHAR(64),
        image_data TEXT,
        prediction VARCHAR(10),
        confidence DECIMAL(5,2),
        analysis_mode VARCHAR(50),
        processing_time INTEGER,
        model_used VARCHAR(100),
        model_author VARCHAR(50),
        probabilities TEXT,
        raw_score DECIMAL(5,4),
        timestamp DATETIME,
        device_info TEXT,
        app_version VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Kullanıcı geri bildirimleri tablosu
    const userFeedbackTable = `
      CREATE TABLE IF NOT EXISTS user_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        analysis_id INTEGER,
        feedback VARCHAR(20),
        timestamp DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (analysis_id) REFERENCES analysis_results(id)
      )
    `;

    // Sistem logları tablosu
    const systemLogsTable = `
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level VARCHAR(10),
        message TEXT,
        timestamp DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Tabloları sırayla oluştur
    db.serialize(() => {
      db.run(analysisResultsTable, (err) => {
        if (err) {
          console.error('❌ analysis_results tablosu oluşturma hatası:', err);
          reject(err);
          return;
        }
        console.log('✅ analysis_results tablosu oluşturuldu');

        db.run(userFeedbackTable, (err) => {
          if (err) {
            console.error('❌ user_feedback tablosu oluşturma hatası:', err);
            reject(err);
            return;
          }
          console.log('✅ user_feedback tablosu oluşturuldu');

          db.run(systemLogsTable, (err) => {
            if (err) {
              console.error('❌ system_logs tablosu oluşturma hatası:', err);
              reject(err);
              return;
            }
            console.log('✅ system_logs tablosu oluşturuldu');
            resolve();
          });
        });
      });
    });
  });
};

// İndeksler oluştur
const createIndexes = () => {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON analysis_results(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_analysis_prediction ON analysis_results(prediction)',
      'CREATE INDEX IF NOT EXISTS idx_analysis_mode ON analysis_results(analysis_mode)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_analysis_id ON user_feedback(analysis_id)',
      'CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level)'
    ];

    let completed = 0;
    indexes.forEach((index, i) => {
      db.run(index, (err) => {
        if (err) {
          console.error(`❌ İndeks ${i + 1} oluşturma hatası:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === indexes.length) {
          console.log('✅ Tüm indeksler oluşturuldu');
          resolve();
        }
      });
    });
  });
};

// Örnek veri ekle (opsiyonel)
const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    const sampleAnalysis = {
      image_hash: 'sample_hash_123',
      image_data: 'https://picsum.photos/200/200?random=1',
      prediction: 'Gerçek',
      confidence: 85.5,
      analysis_mode: 'haywoodsloan',
      processing_time: 1500,
      model_used: 'haywoodsloan/ai-image-detector-deploy',
      model_author: 'haywoodsloan',
      probabilities: JSON.stringify({ real: 85.5, fake: 14.5 }),
      raw_score: 0.855,
      timestamp: new Date().toISOString(),
      device_info: JSON.stringify({ platform: 'android', version: '13' }),
      app_version: '2.0.0'
    };

    const sql = `
      INSERT INTO analysis_results (
        image_hash, image_data, prediction, confidence, analysis_mode, processing_time,
        model_used, model_author, probabilities, raw_score, timestamp,
        device_info, app_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      sampleAnalysis.image_hash, sampleAnalysis.image_data, sampleAnalysis.prediction, sampleAnalysis.confidence,
      sampleAnalysis.analysis_mode, sampleAnalysis.processing_time, sampleAnalysis.model_used,
      sampleAnalysis.model_author, sampleAnalysis.probabilities, sampleAnalysis.raw_score,
      sampleAnalysis.timestamp, sampleAnalysis.device_info, sampleAnalysis.app_version
    ];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Örnek veri ekleme hatası:', err);
        reject(err);
        return;
      }
      console.log('✅ Örnek analiz verisi eklendi (ID:', this.lastID, ')');
      resolve();
    });
  });
};

// Ana kurulum fonksiyonu
const setupDatabase = async () => {
  try {
    await createTables();
    await createIndexes();
    
    // Örnek veri eklemek ister misiniz?
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Örnek veri eklemek ister misiniz? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await insertSampleData();
      }
      
      console.log('\n🎉 Veritabanı kurulumu tamamlandı!');
      console.log('📁 Veritabanı dosyası: ./database.sqlite');
      console.log('🚀 Sunucuyu başlatmak için: npm start');
      
      db.close((err) => {
        if (err) {
          console.error('❌ Veritabanı kapatma hatası:', err);
        } else {
          console.log('✅ Veritabanı bağlantısı kapatıldı');
        }
        rl.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Veritabanı kurulum hatası:', error);
    db.close();
    process.exit(1);
  }
};

// Kurulumu başlat
setupDatabase(); 