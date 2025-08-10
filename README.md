Full-Stack E-Ticaret Platformu

Bu proje, "Software Engineer Case Study" kapsamında geliştirilmiş modern ve tam donanımlı bir e-ticaret platformudur. Next.js (React) ve Node.js (Express) teknolojileri kullanılarak monorepo yapısında geliştirilmiştir. Platform, hem son kullanıcılar için zengin bir alışveriş deneyimi sunar hem de yöneticiler için kapsamlı bir yönetim paneli içerir.
✨ Temel Özellikler
Müşteri Arayüzü

    Kullanıcı Yönetimi: JWT tabanlı güvenli kullanıcı kaydı, girişi, e-posta doğrulama ve şifre sıfırlama.

    Ürün Keşfi: Kategoriye ve fiyata göre filtreleme, sıralama ve anlık arama özellikleri.

    Detaylı Ürün Sayfaları: Çoklu ürün görselleri, varyantlar (renk, beden), stok durumu ve kullanıcı yorumları.

    Alışveriş Sepeti: Sepete ürün ekleme, çıkarma ve miktar güncelleme.

    Sipariş Süreci: Kayıtlı adres defterinden adres seçimi ile kolaylaştırılmış sipariş verme.

    Kullanıcı Paneli: Profil bilgilerini güncelleme, adres defterini yönetme ve sipariş geçmişini görüntüleme.

    İstek Listesi: Beğenilen ürünleri daha sonra satın almak üzere kaydetme.

    Değerlendirme Sistemi: Satın alınan ürünlere 1-5 arası puan verme ve yorum yapma.

Yönetim (Admin) Paneli

    Dashboard: Satışlar, sipariş durumları ve diğer önemli metrikleri gösteren interaktif grafikler.

    Ürün Yönetimi: Yeni ürün ekleme, mevcut ürünleri düzenleme (görsel, stok, varyant, etiket) ve silme.

    Sipariş Yönetimi: Tüm siparişleri listeleme ve sipariş durumunu güncelleme (örn: "İşleniyor" -> "Kargolandı").

    Kategori Yönetimi: Sistemdeki ürün kategorilerini ekleme, düzenleme ve silme.

    Müşteri Yönetimi: Kayıtlı tüm müşterileri listeleme ve arama.

    Yorum Yönetimi: Kullanıcılar tarafından yapılan ürün yorumlarını onaylama veya silme.

🛠️ Teknoloji Yığını

Proje, modern ve ölçeklenebilir teknolojiler kullanılarak geliştirilmiştir.

Alan
	

Teknoloji

Frontend
	

Next.js (App Router), React, TypeScript, Tailwind CSS, React Hook Form, Zod, Chart.js, React Context

Backend
	

Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, Zod, Multer, Nodemailer, Jest, Supertest

Genel
	

Docker, Docker Compose, ESLint
🚀 Projeyi Çalıştırma

Projenin tamamını (frontend, backend, veritabanı) yerel makinenizde çalıştırmanın en kolay yolu Docker kullanmaktır.
Ön Gereksinimler

    Git

    Docker ve Docker Compose

Kurulum Adımları

    Projeyi Klonlayın:

    git clone <proje-github-linki>
    cd pf-se-cs

    Backend Ortam Değişkenlerini Ayarlayın:
    backend klasörüne gidin, .env.example dosyasını kopyalayarak .env adında yeni bir dosya oluşturun ve içeriğini düzenleyin.

    cd backend
    cp .env.example .env

        Not: Docker ile çalışırken MONGO_URI değişkeninin mongodb://mongodb:27017/e-commerce-db olarak ayarlandığından emin olun.

    Frontend Ortam Değişkenlerini Ayarlayın:
    frontend klasörüne gidin ve .env.local adında bir dosya oluşturun.

    cd ../frontend
    touch .env.local

    Oluşturduğunuz .env.local dosyasının içine aşağıdaki satırı ekleyin:

    NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

    Tüm Servisleri Başlatın:
    Projenin ana dizinine geri dönün ve Docker Compose'u çalıştırın.

    cd ..
    docker-compose up -d --build

    Bu komut, gerekli imajları oluşturacak ve tüm servisleri (frontend, backend, mongodb) arka planda başlatacaktır.

    Frontend Arayüzü: http://localhost:3000

    Backend API: http://localhost:5000

🧪 Test ve Veri Yönetimi
Demo Kullanıcı Bilgileri

Uygulamayı test etmek için aşağıdaki hazır kullanıcıları kullanabilirsiniz. (Önce veritabanını seed etmeniz gerekmektedir).

    Admin Kullanıcısı:

        E-posta: admin@example.com

        Şifre: password123

    Müşteri Kullanıcısı:

        E-posta: ilker@example.com

        Şifre: password123

Veritabanını Doldurma (Seeding)

Veritabanını rastgele ve anlamlı verilerle doldurmak için aşağıdaki komutu projenin ana dizininde çalıştırın:

docker-compose exec backend npm run seed:import

Veritabanındaki tüm verileri temizlemek için:

docker-compose exec backend npm run seed:delete

Backend Testlerini Çalıştırma

Backend API'si için yazılmış olan testleri çalıştırmak için projenin ana dizininde aşağıdaki komutu çalıştırın:

docker-compose exec backend npm test

📂 Daha Fazla Bilgi

Projenin frontend ve backend katmanları hakkında daha detaylı teknik bilgi için ilgili klasörlerdeki README.md dosyalarını inceleyebilirsiniz:

    Backend README

    Frontend README