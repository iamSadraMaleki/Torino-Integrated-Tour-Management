import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { cities as staticCities, places as staticPlaces, hotels as staticHotels, foods as staticFoods, vehicles as staticVehicles } from "../../data/data";
import { landingApi } from "../../Services/landingApi";
import { LANDING_KEYS, parseHero, parseList } from "../../Types/landing";
import "./FirstPage.css";

// مقادیر پیش‌فرض متن معرفی (تا وقتی API لود شود یا در صورت خطا)
const defaultHero = {
  badge: "بیش از 10,000 مسافر خوشحال",
  title: "به",
  titleHighlight: "تورینو",
  titleEnd: "خوش آمدید",
  subtitle: "سفری به یادماندنی با بهترین امکانات",
  description: "تورینو، پلتفرمی هوشمند برای مدیران و علاقه‌مندان به سفر. ما بهترین تورهای ایران را با کیفیت عالی و قیمت مناسب به شما ارائه می‌دهیم.",
  buttonPrimary: "شروع ماجراجویی 🚀",
  buttonSecondary: "مشاهده تورها 📱",
  stats: [
    { number: "50+", label: "تور ویژه" },
    { number: "100+", label: "هتل لوکس" },
    { number: "24/7", label: "پشتیبانی" },
    { number: "100%", label: "رضایت" },
  ],
};

const FirstPage = () => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [activePlaceModal, setActivePlaceModal] = useState(null);
  const [activeHotelModal, setActiveHotelModal] = useState(null);
  const navigate = useNavigate();

  // محتوای داینامیک صفحه معرفی (از دیتابیس — قابل ویرایش در پنل ادمین)
  const [hero, setHero] = useState(defaultHero);
  const [cities, setCities] = useState(staticCities);
  const [places, setPlaces] = useState(staticPlaces);
  const [hotels, setHotels] = useState(staticHotels);
  const [foods, setFoods] = useState(staticFoods);
  const [vehicles, setVehicles] = useState(staticVehicles);

  // دریافت محتوای صفحه معرفی از سرور
  useEffect(() => {
    let cancelled = false;
    landingApi.getContent()
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        const map = res.data;
        const h = parseHero(map[LANDING_KEYS.HERO]);
        if (h) setHero((prev) => ({ ...prev, ...h }));
        const c = parseList(map[LANDING_KEYS.CITIES]);
        if (c.length) setCities(c);
        const p = parseList(map[LANDING_KEYS.PLACES]);
        if (p.length) setPlaces(p);
        const ht = parseList(map[LANDING_KEYS.HOTELS]);
        if (ht.length) setHotels(ht);
        const f = parseList(map[LANDING_KEYS.FOODS]);
        if (f.length) setFoods(f);
        const v = parseList(map[LANDING_KEYS.VEHICLES]);
        if (v.length) setVehicles(v);
      })
      .catch((err) => {
        // در صورت خطا، داده استاتیک به‌عنوان fallback باقی می‌ماند
        console.error("Error loading landing content:", err);
      });
    return () => { cancelled = true; };
  }, []);

  // انیمیشن اسکرول
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => [...new Set([...prev, entry.target.id])]);
        }
      });
    }, { threshold: 0.1, rootMargin: "50px" });

    document.querySelectorAll('.section-animate').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // بستن همه مودال‌ها هنگام unmount شدن کامپوننت
  useEffect(() => {
    return () => {
      setActivePlaceModal(null);
      setActiveHotelModal(null);
    };
  }, []);

  // بستن مودال با دکمه ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setActivePlaceModal(null);
        setActiveHotelModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // جلوگیری از اسکرول بدنه وقتی مودال بازه
  useEffect(() => {
    if (activePlaceModal !== null || activeHotelModal !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePlaceModal, activeHotelModal]);

  const openPlaceModal = (id) => {
    setActivePlaceModal(id);
  };

  const closePlaceModal = () => {
    setActivePlaceModal(null);
  };

  const openHotelModal = (id) => {
    setActiveHotelModal(id);
  };

  const closeHotelModal = () => {
    setActiveHotelModal(null);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">
              تورینو
            </div>
            <div className="nav-links">
              <a href="#cities">شهرها</a>
              <a href="#places">جاذبه‌ها</a>
              <a href="#hotels">هتل‌ها</a>
              <a href="#foods">غذاها</a>
              <a href="#vehicles">وسایل نقلیه</a>
            </div>
            <button 
              onClick={() => navigate('/auth')}
              className="login-btn"
            >
              ورود | ثبت‌نام
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg">
          <div className="hero-bg-icon hero-bg-icon-1">✈️</div>
          <div className="hero-bg-icon hero-bg-icon-2">🏔️</div>
          <div className="hero-bg-icon hero-bg-icon-3">🌟</div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span>⭐</span>
            <span>{hero.badge}</span>
            <span>⭐</span>
          </div>
          
          <h1 className="hero-title">
            {hero.title} <span className="hero-title-highlight">{hero.titleHighlight}</span> {hero.titleEnd}
          </h1>
          
          <p className="hero-subtitle">
            {hero.subtitle}
          </p>
          
          <p className="hero-description">
            {hero.description}
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary">
              {hero.buttonPrimary}
            </button>
            <button className="btn-secondary">
              {hero.buttonSecondary}
            </button>
          </div>
          
          <div className="hero-stats">
            {hero.stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path fill="#f8fafc" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Cities Section */}
      <div id="cities" className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <span>✨</span>
            <span>مقصدهای ویژه</span>
          </div>
          <h2 className="section-title">
            شهرهایی که <span className="section-title-highlight">تجربه میکنید</span>
          </h2>
          <p className="section-subtitle">شهرهای محبوب ایران با تورینو</p>
        </div>

        <div className="cities-grid">
          {cities.map((city) => (
            <div key={city.id} className="city-card">
              <div className="city-card-inner">
                <div className="city-image-container">
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="city-image" 
                  />
                  <div className="city-image-overlay" />
                </div>
                <div className="city-content">
                  <div className="city-icon">{city.icon}</div>
                  <h3 className="city-name">{city.name}</h3>
                  <p className="city-description">مقصد گردشگری</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Places Section */}
      <div id="places" className="section-container-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <span>🏛️</span>
              <span>جاذبه‌های تاریخی</span>
            </div>
            <h2 className="section-title">
              مکان‌هایی که <span className="section-title-highlight">میزبان شما هستند</span>
            </h2>
            <p className="section-subtitle">جاذبه‌های گردشگری ایران با تورینو</p>
          </div>
          
          <div className="places-grid">
            {places.map((place) => (
              <div key={place.id} className="place-card">
                <div className="place-image-wrapper">
                  <img src={place.image} alt={place.name} className="place-image" />
                </div>
                <div className="place-content">
                  <div className="place-header">
                    <div className="place-icon">{place.icon}</div>
                    <div>
                      <h3 className="place-name">{place.name}</h3>
                      <p className="place-location">{place.location}</p>
                    </div>
                  </div>
                  <p className="place-description">{place.description}</p>
                  <div className="place-info">
                    <span>📅 {place.bestTime}</span>
                    <span>⏱️ {place.duration}</span>
                    <span>💰 {place.price}</span>
                  </div>
                  <button onClick={() => openPlaceModal(place.id)} className="btn-more">
                    اطلاعات بیشتر <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Place Modals - با استفاده از state */}
      {places.map((place) => (
        activePlaceModal === place.id && (
          <div 
            key={`modal-${place.id}`} 
            className="modal-overlay" 
            onClick={closePlaceModal}
            style={{ display: 'flex' }}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-image-wrapper">
                <img src={place.image} alt={place.name} className="modal-image" />
                <button onClick={closePlaceModal} className="modal-close">×</button>
              </div>
              <div className="modal-body">
                <div className="modal-header">
                  <div className="modal-icon">{place.icon}</div>
                  <div>
                    <h3 className="modal-title">{place.name}</h3>
                    <p className="modal-location">{place.location}</p>
                  </div>
                </div>
                <div className="modal-description">
                  <h4>📖 توضیحات کامل</h4>
                  <p>{place.fullDescription}</p>
                </div>
                <div className="modal-details">
                  <div><span>📅</span> بهترین زمان: {place.bestTime}</div>
                  <div><span>⏱️</span> زمان بازدید: {place.duration}</div>
                  <div><span>💰</span> هزینه ورودی: {place.price}</div>
                  <div><span>📍</span> استان: {place.location.split('،')[0]}</div>
                </div>
                <button onClick={closePlaceModal} className="btn-close">بستن</button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Hotels Section */}
      <div id="hotels" className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <span>🏨</span>
            <span>اقامت لوکس</span>
          </div>
          <h2 className="section-title">
            هتل‌های <span className="section-title-highlight">۵ ستاره ویژه</span>
          </h2>
          <p className="section-subtitle">اقامت لوکس و به یادماندنی با تورینو</p>
        </div>
        
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="hotel-card">
              <div className="hotel-image-wrapper">
                <img src={hotel.image} alt={hotel.name} className="hotel-image" />
                <div className="hotel-stars">★ {hotel.stars}</div>
              </div>
              <div className="hotel-content">
                <h3 className="hotel-name">{hotel.name}</h3>
                <p className="hotel-location">📍 {hotel.location}</p>
                <div className="hotel-facilities">
                  {(hotel.facilities || []).slice(0, 3).map((fac, i) => (
                    <span key={i} className="facility-tag">✓ {fac}</span>
                  ))}
                </div>
                <div className="hotel-footer">
                  <div>
                    <p className="hotel-price">{hotel.price}</p>
                    <p className="hotel-price-label">هر شب</p>
                  </div>
                  <button onClick={() => openHotelModal(hotel.id)} className="btn-more-sm">
                    اطلاعات بیشتر →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel Modals - با استفاده از state */}
      {hotels.map((hotel) => (
        activeHotelModal === hotel.id && (
          <div 
            key={`hotel-modal-${hotel.id}`} 
            className="modal-overlay" 
            onClick={closeHotelModal}
            style={{ display: 'flex' }}
          >
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-image-wrapper">
                <img src={hotel.image} alt={hotel.name} className="modal-image" />
                <button onClick={closeHotelModal} className="modal-close">×</button>
                <div className="hotel-stars-badge">★ {hotel.stars}</div>
              </div>
              <div className="modal-body">
                <h3 className="modal-title">{hotel.name}</h3>
                <p className="modal-location">📍 {hotel.address}</p>
                <div className="modal-description">
                  <h4>📖 درباره هتل</h4>
                  <p>{hotel.fullDescription}</p>
                </div>
                <div>
                  <h4>✨ امکانات و خدمات</h4>
                  <div className="facilities-list">
                    {(hotel.facilities || []).map((fac, i) => (
                      <span key={i} className="facility-badge">✓ {fac}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>🛏️ انواع اتاق‌ها</h4>
                  <div className="room-types">
                    {(hotel.roomTypes || []).map((room, i) => (
                      <span key={i} className="room-tag">{room}</span>
                    ))}
                  </div>
                </div>
                <div className="hotel-contact">
                  <div>📞 {hotel.phone}</div>
                  <div>🌐 {hotel.website}</div>
                  <div>⏰ ورود: {hotel.checkIn} | خروج: {hotel.checkOut}</div>
                </div>
                <button onClick={closeHotelModal} className="btn-close">بستن</button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Foods Section */}
      <div id="foods" className="section-container-food">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <span>🍽️</span>
              <span>طعم‌های اصیل</span>
            </div>
            <h2 className="section-title">
              غذاهایی که <span className="section-title-highlight">پذیرایی میشید</span>
            </h2>
            <p className="section-subtitle">تجربه طعم‌های بین‌نظیر ایرانی، سفری خوشمزه به فرهنگ و اصالت این سرزمین</p>
          </div>
          
          <div className="foods-grid">
            {foods.map((food) => (
              <div key={food.id} className="food-card">
                <div className="food-image">
                  <img src={food.image} alt={food.name} />
                </div>
                <div className="food-content">
                  <div className="food-header">
                    <span className="food-emoji">{food.emoji}</span>
                    <h3 className="food-name">{food.name}</h3>
                  </div>
                  <p className="food-region">{food.region}</p>
                  <p className="food-description">{food.description}</p>
                  <span className="food-spice">{food.spice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div id="vehicles" className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <span>🚌</span>
            <span>ناوگان مدرن</span>
          </div>
          <h2 className="section-title">
            وسایل نقلیه <span className="section-title-highlight">VIP و مدرن</span>
          </h2>
          <p className="section-subtitle">سفر راحت و لوکس با ناوگان به‌روز</p>
        </div>
        
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image-wrapper">
                <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                <div className="vehicle-class">{vehicle.class}</div>
              </div>
              <div className="vehicle-content">
                <div className="vehicle-header">
                  <span className="vehicle-icon">{vehicle.icon}</span>
                  <h3 className="vehicle-name">{vehicle.name}</h3>
                </div>
                <p className="vehicle-capacity">👥 {vehicle.capacity}</p>
                <p className="vehicle-features">{vehicle.features}</p>
                <button className="btn-select">انتخاب →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stats-item">
            <div className="stats-number">10,000+</div>
            <div className="stats-label">مسافر خوشحال</div>
          </div>
          <div className="stats-item">
            <div className="stats-number">50+</div>
            <div className="stats-label">تور ویژه</div>
          </div>
          <div className="stats-item">
            <div className="stats-number">100+</div>
            <div className="stats-label">هتل لوکس</div>
          </div>
          <div className="stats-item">
            <div className="stats-number">24/7</div>
            <div className="stats-label">پشتیبانی</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-bg">
          <div className="cta-bg-icon">🎉</div>
          <div className="cta-bg-icon cta-bg-icon-2">🚀</div>
        </div>
        <div className="cta-content">
          <div className="cta-badge">
            <span>⭐</span>
            <span>پیشنهاد ویژه</span>
          </div>
          <h2 className="cta-title">
            منتظر چی هستی؟ <span className="cta-title-highlight">همین الان ثبت‌نام کن!</span>
          </h2>
          <p className="cta-description">
            به جمع هزاران مسافر خوشحال بپیوند و بهترین تورها رو با بهترین قیمت تجربه کن
          </p>
          <div className="cta-buttons">
            <button className="btn-cta-primary">ثبت‌نام رایگان 🚀</button>
            <button className="btn-cta-secondary">تماس با ما 📞</button>
          </div>
          <p className="cta-note">* بدون نیاز به کارت بانکی</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">تورینو</div>
              <p className="footer-text">پلتفرمی هوشمند برای مدیران و علاقه‌مندان به سفر در ایران</p>
            </div>
            <div>
              <h4 className="footer-title">دسترسی سریع</h4>
              <ul className="footer-links">
                <li><a href="#">درباره ما</a></li>
                <li><a href="#">تماس با ما</a></li>
                <li><a href="#">قوانین و مقررات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">خدمات</h4>
              <ul className="footer-links">
                <li><a href="#">تورهای داخلی</a></li>
                <li><a href="#">رزرو هتل</a></li>
                <li><a href="#">بلیط هواپیما</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">شبکه‌های اجتماعی</h4>
              <div className="social-icons">
                <span>📷</span>
                <span>💬</span>
                <span>📘</span>
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            © 2024 تورینو. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FirstPage;