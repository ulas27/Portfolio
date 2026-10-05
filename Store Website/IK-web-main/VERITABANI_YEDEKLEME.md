# Veritabanı Yedekleme ve Geri Yükleme Kılavuzu

## 🚨 Önemli Uyarı
`init_db.py` çalıştırıldığında **TÜM VERİLER SİLİNİR** ve varsayılan veriler yüklenir!

## 📋 Yedekleme Komutları

### 1. Manuel Yedekleme
```bash
python backup_db.py backup
```

### 2. Yedekleri Listeleme
```bash
python backup_db.py list
```

### 3. Son Yedekten Geri Yükleme
```bash
python backup_db.py restore
```

## 🔄 init_db.py Çalıştırma

### Güvenli Çalıştırma (Otomatik Yedekleme)
```bash
python init_db.py
```
- Mevcut veritabanı otomatik olarak yedeklenir
- Yedek dosyası: `backups/kuyumcu_backup_before_init_YYYYMMDD_HHMMSS.db`

### Yedekten Geri Yükleme
```bash
python backup_db.py restore
```

## 📁 Yedek Dosyaları

### Konum
- **Yedek Dizini**: `backups/`
- **Manuel Yedekler**: `kuyumcu_backup_YYYYMMDD_HHMMSS.db`
- **init_db Yedekleri**: `kuyumcu_backup_before_init_YYYYMMDD_HHMMSS.db`

### Dosya Adı Formatı
- `kuyumcu_backup_20251016_141414.db` - Manuel yedek
- `kuyumcu_backup_before_init_20251016_141414.db` - init_db öncesi yedek

## ⚠️ Dikkat Edilecekler

1. **init_db.py çalıştırmadan önce** mutlaka yedek alın
2. **Ürün ekleme** işlemlerinden sonra yedek alın
3. **Kategori resimleri** yedeklenmez, sadece veritabanı yedeklenir
4. **Upload edilen resimler** `static/uploads/` klasöründe kalır

## 🛠️ Sorun Giderme

### Veritabanı Bozuldu
```bash
python backup_db.py list
python backup_db.py restore
```

### Yedek Bulunamıyor
- `backups/` klasörünü kontrol edin
- En son yedek dosyasını manuel olarak kopyalayın

### Resimler Kayboldu
- `static/uploads/` klasörünü kontrol edin
- Resimler genellikle burada kalır

## 📞 Acil Durum

Eğer verileriniz kaybolduysa:
1. `backups/` klasörünü kontrol edin
2. En son yedek dosyasını bulun
3. `python backup_db.py restore` komutunu çalıştırın
4. Uygulamayı yeniden başlatın
