# İnci Gold E-Ticaret Sitesi

Modern ve tam fonksiyonel kuyumcu e-ticaret web sitesi. Flask framework'ü ile geliştirilmiştir.

## 🚀 Özellikler

### 🛍️ E-Ticaret Özellikleri
- **Ürün Yönetimi**: Kategoriler, ürün detayları, resim galerisi
- **Sepet Sistemi**: Dinamik sepet, stok kontrolü, fiyat hesaplama
- **Sipariş Yönetimi**: Sipariş takibi, durum güncellemeleri
- **Ödeme Entegrasyonu**: İyzico ile güvenli ödeme
- **Kullanıcı Sistemi**: Kayıt, giriş, profil yönetimi

### 👑 Kuyumcu Özel Özellikleri
- **Mücevher Detayları**: Ağırlık, saflık, taş türü, karat bilgileri
- **Kategori Yönetimi**: Yüzük, kolye, küpe, bilezik kategorileri
- **Ürün Galerisi**: Çoklu resim desteği, zoom özelliği
- **Değerlendirme Sistemi**: Kullanıcı yorumları ve puanlama

### 🔧 Admin Paneli
- **Dashboard**: Satış istatistikleri, grafik raporları
- **Ürün Yönetimi**: CRUD işlemleri, stok takibi
- **Sipariş Yönetimi**: Sipariş durumu, kargo takibi
- **Kullanıcı Yönetimi**: Müşteri listesi, yetki yönetimi
- **İçerik Yönetimi**: Kategoriler, yorumlar, mesajlar

## 🛠️ Teknoloji Stack

- **Backend**: Flask (Python)
- **Veritabanı**: SQLite (geliştirme), PostgreSQL (production)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Ödeme**: İyzico API
- **Email**: Flask-Mail
- **Resim İşleme**: Pillow
- **Authentication**: Flask-Login

## 📋 Kurulum

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd incigold-eticaret
```

### 2. Sanal Ortam Oluşturun
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

### 4. Çevre Değişkenlerini Ayarlayın
```bash
# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env
# .env dosyasını düzenleyin
```

### 5. Veritabanını Başlatın
```bash
python app.py
```

## ⚙️ Yapılandırma

### Çevre Değişkenleri (.env)

```env
# Flask Ayarları
SECRET_KEY=your-secret-key
FLASK_ENV=development

# Veritabanı
DATABASE_URL=sqlite:///kuyumcu.db

# Mail Ayarları
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# İyzico Ödeme
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
```

### İyzico Entegrasyonu

1. [İyzico](https://www.iyzico.com/) hesabı oluşturun
2. API anahtarlarınızı alın
3. `.env` dosyasına ekleyin
4. Test ortamı için sandbox URL'ini kullanın

## 🚀 Çalıştırma

### Geliştirme Ortamı

1. **Sanal ortamı aktifleştirin:**
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. **Veritabanını oluşturun:**
```bash
python init_db.py
```

3. **Uygulamayı başlatın:**
```bash
python app.py
```

Site `http://localhost:5000` adresinde çalışacaktır.

### Test Etme
```bash
python test_app.py
```

### Production Ortamı
```bash
# Gunicorn ile
gunicorn --bind 0.0.0.0:5000 app:app

# Docker ile
docker build -t kuyumcu-app .
docker run -p 5000:5000 kuyumcu-app
```

## 👤 Varsayılan Admin Hesabı

- **Email**: admin@kuyumcu.com
- **Şifre**: admin123

⚠️ **Güvenlik**: Production ortamında mutlaka şifreyi değiştirin!

## 📁 Proje Yapısı

```
incigold-eticaret/
├── app.py                 # Ana uygulama dosyası
├── models.py             # Veritabanı modelleri
├── requirements.txt      # Python bağımlılıkları
├── .env.example         # Çevre değişkenleri örneği
├── routes/              # Route modülleri
│   ├── main.py         # Ana sayfa route'ları
│   ├── auth.py         # Kullanıcı authentication
│   ├── admin.py        # Admin paneli
│   ├── shop.py         # Mağaza sayfaları
│   ├── cart.py         # Sepet işlemleri
│   └── payment.py      # Ödeme işlemleri
├── templates/           # HTML şablonları
├── static/             # CSS, JS, resimler
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/        # Yüklenen dosyalar
└── migrations/         # Veritabanı migration'ları
```

## 🔐 Güvenlik

- **CSRF Koruması**: Flask-WTF ile form koruması
- **SQL Injection**: SQLAlchemy ORM kullanımı
- **XSS Koruması**: Template auto-escaping
- **Şifre Güvenliği**: Werkzeug password hashing
- **Session Güvenliği**: Secure cookie ayarları

## 📊 Veritabanı Şeması

### Ana Tablolar
- **users**: Kullanıcı bilgileri
- **products**: Ürün detayları
- **categories**: Ürün kategorileri
- **orders**: Sipariş bilgileri
- **cart**: Sepet yönetimi
- **reviews**: Ürün yorumları

## 🎨 Frontend Özellikleri

- **Responsive Tasarım**: Mobil uyumlu
- **Modern UI**: Bootstrap benzeri component'ler
- **AJAX İşlemleri**: Dinamik sepet, filtreleme
- **Image Gallery**: Ürün resim galerisi
- **Form Validation**: Client-side doğrulama

## 📧 Email Bildirimleri

- Sipariş onayı
- Sipariş durumu güncellemeleri
- Hoş geldin mesajı
- Şifre sıfırlama

## 🔄 API Endpoints

### Public API
- `GET /api/products/featured` - Öne çıkan ürünler
- `GET /shop/api/products` - Ürün listesi
- `GET /shop/api/product/<id>` - Ürün detayı

### Authenticated API
- `POST /cart/add` - Sepete ekle
- `POST /cart/update` - Sepet güncelle
- `GET /cart/api/items` - Sepet öğeleri

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Veritabanı Hatası**
   ```bash
   # Veritabanını sıfırlayın
   rm incigold.db
   python app.py
   ```

2. **İyzico Bağlantı Hatası**
   - API anahtarlarını kontrol edin
   - Sandbox/Production URL'ini doğrulayın

3. **Email Gönderim Hatası**
   - Gmail için app password kullanın
   - SMTP ayarlarını kontrol edin

## 📈 Performance

- **Veritabanı İndeksleri**: Sık kullanılan sorgular için
- **Image Optimization**: Pillow ile otomatik boyutlandırma
- **Caching**: Flask-Caching (opsiyonel)
- **CDN**: Static dosyalar için (production)

## 🚀 Deployment

### Heroku
```bash
# Procfile oluşturun
echo "web: gunicorn app:app" > Procfile

# Deploy edin
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku main
```

### VPS/Server
```bash
# Nginx + Gunicorn
sudo apt install nginx
pip install gunicorn
gunicorn --bind 127.0.0.1:5000 app:app
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: info@incigold.com
- **Website**: https://incigold.com
- **GitHub**: https://github.com/username/kuyumcu-eticaret

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
