$(function () {

  // --- 1. hero画像の日付・時刻表示（日本時間） ---
  function getJSTParts() {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    return {
      date: map.year + '.' + map.month + '.' + map.day,
      time: (map.hour === '24' ? '00' : map.hour) + ':' + map.minute + ':' + map.second
    };
  }

  function updateHeroDateTime() {
    const parts = getJSTParts();
    $('.js-hero-date').text(parts.date);
    $('.js-hero-time').html(parts.time + '<span class="hero-content-datetime__tz">(JST)</span>');
  }

  updateHeroDateTime();
  setInterval(updateHeroDateTime, 1000); // 1秒ごとに更新


  // --- 1.5. 福岡県の天気・気温表示（Open-Meteo API） ---
  const WEATHER_CODE_MAP = {
    0: '☀︎', 1: '☀︎', 2: '⛅︎', 3: '☁︎',
    45: '﹌', 48: '﹌',
    51: '☂︎', 53: '☂︎', 55: '☂︎',
    61: '☂︎', 63: '☔︎', 65: '☔︎',
    71: '❆', 73: '❆', 75: '❆', 77: '❆',
    80: '☔︎', 81: '☔︎', 82: '☔︎',
    85: '❆', 86: '❆',
    95: '⚡︎', 96: '⚡︎', 99: '⚡︎'
  };
 
  function weatherCodeToText(code) {
    return WEATHER_CODE_MAP[code] || '';
  }
 
  function updateFukuokaWeather() {
    const lat = 33.5902, lon = 130.4017; // 福岡市
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + lat
      + '&longitude=' + lon
      + '&current=temperature_2m,weather_code'
      + '&timezone=Asia%2FTokyo';
 
    $.getJSON(url)
      .done(function (data) {
        if (!data || !data.current) throw new Error('no data');
        const temp = Math.round(data.current.temperature_2m);
        const desc = weatherCodeToText(data.current.weather_code);
        $('.js-hero-weather').text('FUKUOKA ' + desc + ' ' + temp + '℃');
      })
      .fail(function () {
        $('.js-hero-weather').text('Unable to retrieve weather information.');
      });
  }
 
  updateFukuokaWeather();
  setInterval(updateFukuokaWeather, 10 * 60 * 1000); // 10分ごとに更新

// --- 2. ハンバーガーメニュー ---
  $('#js-hamburger').on('click', function() {
    $(this).toggleClass('is-active');
    const isExpanded = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', !isExpanded);
    $('#js-sp-menu').slideToggle();
  });

  // ▼▼ ここから追加：画面リサイズ時のリセット処理 ▼▼
  $(window).on('resize', function() {
    // 画面幅が961px以上（PCサイズ）になったか判定
    if (window.matchMedia('(min-width: 961px)').matches) {
      // ハンバーガーボタンの状態を初期化（×から三本線に戻す）
      $('#js-hamburger').removeClass('is-active').attr('aria-expanded', 'false');
      $('#js-sp-menu').css('display', '');
    }
  });

  // --- 3. マウスストーカー ---
  const mouse = $("#js-mouse-stalker");
  $(document).on("mousemove", function(e){
    mouse.css({
      "opacity": "1",
      "transform": `translate(${e.clientX}px, ${e.clientY}px)`
    });
  });

  // --- 4. bxSlider ---
  $('.slider').bxSlider({
    auto: true,
    speed: 1500,
    pager: false,
    mode: 'fade',
    controls: false,
    captions: false
  });


  // === 【修正ポイント1】不要なエラーを回避するため、要素の存在チェックを追加 ===
  const cursor = document.getElementById("cursor");

  if (cursor) {
    const amount = 20;
    const sineDots = Math.floor(amount * 0.3);
    const width = 26;
    const idleTimeout = 150;
    let lastFrame = 0;
    let mousePosition = {x: 0, y: 0};
    let dots = [];
    let timeoutID;
    let idle = false;
    let hoverButton;
    let hoverTL;

    class HoverButton {
        constructor(id) {
            this.hovered = false;
            this.animatingHover = false;
            this.forceOut = false;
            this.timing = 0.65;
            this.el = document.getElementById(id);
            this.bg = this.el.getElementsByClassName("bg")[0];
            this.el.addEventListener("mouseenter", this.onMouseEnter);
            this.el.addEventListener("mouseleave", this.onMouseLeave);
        }

        onMouseEnter = () => {
            this.hoverInAnim();
        };

        hoverInAnim = () => {
            if (!this.hovered) {
                this.hovered = true;
                this.animatingHover = true;
                this.forceOut = false;
                TweenMax.fromTo(
                    this.bg,
                    this.timing,
                    {x: "-112%"},
                    {
                        x: "-12%",
                        ease: Power3.easeOut,
                        onComplete: () => {
                            this.animatingHover = false;
                            if (this.forceOut) {
                                this.foceOut = false;
                                this.hoverOutAnim();
                            }
                        }
                    }
                );
            }
        };

        onMouseLeave = () => {
            if (!this.animatingHover) {
                this.hoverOutAnim();
            } else {
                this.forceOut = true;
            }
        };

        hoverOutAnim = () => {
            this.hovered = false;
            TweenMax.to(this.bg, this.timing, {
                x: "100%",
                ease: Power3.easeOut,
                onComplete: () => {
                }
            });
        };
    }

    class Dot {
        constructor(index = 0) {
            this.index = index;
            this.anglespeed = 0.05;
            this.x = 0;
            this.y = 0;
            this.scale = 1 - 0.05 * index;
            this.range = width / 2 - width / 2 * this.scale + 2;
            this.limit = width * 0.75 * this.scale;
            this.element = document.createElement("span");
            TweenMax.set(this.element, {scale: this.scale});
            cursor.appendChild(this.element);
        }

        lock() {
            this.lockX = this.x;
            this.lockY = this.y;
            this.angleX = Math.PI * 2 * Math.random();
            this.angleY = Math.PI * 2 * Math.random();
        }

        draw(delta) {
            if (!idle || this.index <= sineDots) {
                TweenMax.set(this.element, {x: this.x, y: this.y});
            } else {
                this.angleX += this.anglespeed;
                this.angleY += this.anglespeed;
                this.y = this.lockY + Math.sin(this.angleY) * this.range;
                this.x = this.lockX + Math.sin(this.angleX) * this.range;
                TweenMax.set(this.element, {x: this.x, y: this.y});
            }
        }
    }

    class Circle {
        constructor(id) {
            const el = document.getElementById(id);
            const parent = el.parentElement;
            parent.removeChild(el);
            const chars = el.innerText.split("");
            chars.push(" ");
            for (let i = 0; i < chars.length; i++) {
                const span = document.createElement("span");
                span.innerText = chars[i];
                span.className = `char${i + 1}`;
                parent.appendChild(span);
            }
        }
    }

    function init() {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
        hoverButton = new HoverButton("button");
        // eslint-disable-next-line no-new
        new Circle("circle-content");
        lastFrame += new Date();
        buildDots();
        render();
    }

    function startIdleTimer() {
        timeoutID = setTimeout(goInactive, idleTimeout);
        idle = false;
    }

    function resetIdleTimer() {
        clearTimeout(timeoutID);
        startIdleTimer();
    }

    function goInactive() {
        idle = true;
        for (let dot of dots) {
            dot.lock();
        }
    }

    function buildDots() {
        for (let i = 0; i < amount; i++) {
            let dot = new Dot(i);
            dots.push(dot);
        }
    }

    const onMouseMove = event => {
        mousePosition.x = event.clientX - width / 2;
        mousePosition.y = event.clientY - width / 2;
        resetIdleTimer();
    };

    const onTouchMove = event => {
        mousePosition.x = event.touches[0].clientX - width / 2;
        mousePosition.y = event.touches[0].clientY - width / 2;
        resetIdleTimer();
    };

    const render = timestamp => {
        const delta = timestamp - lastFrame;
        positionCursor(delta);
        lastFrame = timestamp;
        requestAnimationFrame(render);
    };

    const positionCursor = delta => {
        let x = mousePosition.x;
        let y = mousePosition.y;
        dots.forEach((dot, index, dots) => {
            let nextDot = dots[index + 1] || dots[0];
            dot.x = x;
            dot.y = y;
            dot.draw(delta);
            if (!idle || index <= sineDots) {
                const dx = (nextDot.x - dot.x) * 0.35;
                const dy = (nextDot.y - dot.y) * 0.35;
                x += dx;
                y += dy;
            }
        });
    };

    init();
  }
  // === 【修正ポイント1ここまで】 ==============================================


  // --- 5. Luminous (ギャラリー) ---
  const luminousElements = document.querySelectorAll('.js-luminous');
  if (luminousElements.length > 0) {
    const galleryOptions = {
      arrowNavigation: true
    };

    const luminousOptions = {
      // ▼▼ 【修正ポイント2（推奨）】キャプションの取得方法を改善 ▼▼
      caption: function(trigger) {
        // 1. data-title属性があればそれを優先する
        const dataTitle = trigger.getAttribute('data-title');
        if (dataTitle) {
          return dataTitle;
        }
        // 2. なければ、中のimgタグのalt属性を取得する
        const img = trigger.querySelector('img');
        return img ? (img.getAttribute('alt') || '') : '';
      },
      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

      onOpen: function() {
        const lightbox = document.querySelector('.lum-lightbox.lum-open');
        const img = lightbox ? lightbox.querySelector('.lum-img') : null;

        // --- 画像クリックでズーム切り替え ---
        if (img) {
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('is-zoomed');
            this.style.cursor = this.classList.contains('is-zoomed') ? 'zoom-out' : 'zoom-in';
          });
        }

        // --- フルスクリーンボタンを追加 ---
        if (lightbox && !lightbox.querySelector('.lum-fullscreen-btn')) {
          const fsBtn = document.createElement('button');
          fsBtn.className = 'lum-fullscreen-btn';
          fsBtn.type = 'button';
          fsBtn.setAttribute('aria-label', 'フルスクリーン表示に切り替え');
          fsBtn.innerHTML = '⛶'; // シンプルなアイコン文字。SVGに差し替え可

          fsBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // ライトボックスが閉じないようにする

            if (!document.fullscreenElement) {
              lightbox.requestFullscreen?.().catch(err => {
                console.error('フルスクリーン化に失敗しました:', err);
              });
            } else {
              document.exitFullscreen?.();
            }
          });

          lightbox.appendChild(fsBtn);
        }
      },

      onClose: function() {
        const img = document.querySelector('.lum-lightbox-image');
        if (img) {
          img.classList.remove('is-zoomed');
        }
        // ライトボックスを閉じたらフルスクリーンも解除
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      }
    };

    new LuminousGallery(luminousElements, galleryOptions, luminousOptions);
  }

  // --- 6. スライド切り替え ---
  $(".slide-image:first").show();
  function slideSwitch() {
    let $active = $(".slide-image:visible");
    if ($active.length === 0) $active = $(".slide-image:last");
    
    let $next = $active.next(".slide-image").length ? $active.next(".slide-image") : $(".slide-image:first");
    $active.fadeOut(function () {
      $next.fadeIn();
    });
  }
  setInterval(slideSwitch, 5000);


// --- 7. hero画像クリック時の水面リップルエフェクト ---
  const $waterTarget = $('.js-water-ripple');

  $waterTarget.on('click', function (e) {
    const $container = $(this);
    const offset = $container.offset();
    const x = e.pageX - offset.left;
    const y = e.pageY - offset.top;

    // 波紋の輪を生成（水面が一度揺れて広がるイメージ）
    const ringCount = 2;
    for (let i = 0; i < ringCount; i++) {
      setTimeout(function () {
        const $ring = $('<span class="c-ripple-ring"></span>').css({
          left: x + 'px',
          top: y + 'px'
        });
        $container.append($ring);
        $ring.on('animationend', function () { $(this).remove(); });
      }, i * 180);
    }

    // 水面に光が反射したようなグロー（ハイライト）
    const $glow = $('<span class="c-ripple-glow"></span>').css({
      left: x + 'px',
      top: y + 'px'
    });
    $container.append($glow);
    $glow.on('animationend', function () { $(this).remove(); });
  });


  // --- 8. ギャラリーのフィルター機能 ---
  $('.p-gallery__controls .c-btn').on('click', function() {
    $('.p-gallery__controls .c-btn').removeClass('is-active');
    $(this).addClass('is-active');

    var filterValue = $(this).attr('data-filter');

    if (filterValue === 'all') {
      $('.js-gallery-item').fadeIn(400); 
    } else {
      $('.js-gallery-item').each(function() {
        if ($(this).attr('data-category') === filterValue) {
          $(this).fadeIn(400); 
        } else {
          $(this).hide();      
        }
      });
    }
  });

});