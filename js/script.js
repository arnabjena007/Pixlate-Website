// Generated by CoffeeScript 1.10.0
(function () {
  var ArtAnimation,
    Mask,
    Particles,
    galleryAnimation,
    galleryMask,
    galleryParticles,
    getBackingScale,
    headerAnimation,
    headerMask,
    headerParticles,
    img,
    imgClick,
    j,
    len,
    loadPlaybackData,
    ref,
    retinize,
    bind = function (fn, me) {
      return function () {
        return fn.apply(me, arguments);
      };
    };

  (function (_this) {
    return function () {
      return document.querySelector('.video .play').addEventListener('click', function () {
        var video;
        document.querySelector('.video').classList.add('played');
        video = document.querySelector('video');
        video.setAttribute('controls', true);
        return video.play();
      });
    };
  })(this)();

  (function (_this) {
    return function () {
      var canvas, ctx, icon, parent;
      icon = document.querySelector('link[rel=icon]');
      canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = '#E6CDC2';
      ctx.fillRect(0, 0, 1, 1);
      parent = icon.parentNode;
      if (parent != null) {
        parent.removeChild(icon);
      }
      icon.href = canvas.toDataURL();
      if (parent != null) {
        return parent.appendChild(icon);
      }
    };
  })(this)();

  getBackingScale = function (ctx) {
    var backingStoreRatio, devicePixelRatio;
    if (ctx.canvas == null) {
      d('Warning: getBackingScale takes a context, not a canvas.');
    }
    if ('devicePixelRatio' in window) {
      devicePixelRatio = window.devicePixelRatio;
      backingStoreRatio =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
      return devicePixelRatio / backingStoreRatio;
    }
    return 1;
  };

  retinize = function (canvas) {
    var backingScale, height, width;
    backingScale = getBackingScale(canvas.getContext('2d'));
    (width = canvas.width), (height = canvas.height);
    canvas.width = width * backingScale;
    return (canvas.height = height * backingScale);
  };

  Particles = (function () {
    function Particles(width, height, radius, canvas1) {
      this.radius = radius;
      this.canvas = canvas1;
      this.canvas.width = width;
      this.canvas.height = height;
      retinize(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.backingScale = getBackingScale(this.ctx);
      this.ctx.setTransform(this.backingScale, 0, 0, this.backingScale, 0, 0);
      this.points = [];
    }

    Particles.prototype.reset = function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return (this.points = []);
    };

    Particles.prototype.add = function (x, y, color) {
      if (color == null) {
        color = '#000';
      }
      return this.points.push({
        x: x,
        y: y,
        radius: this.radius,
        color: color,
        a: 0.65,
        age: 0,
        lifespan: 45,
        vx: 2 * Math.random() - 1,
        vy: Math.random() - 1,
      });
    };

    Particles.prototype.updateAndDraw = function (dt) {
      var j, len, p, ref;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      while (this.points.length > 0 && this.points[0].age >= this.points[0].lifespan) {
        this.points.shift();
      }
      ref = this.points;
      for (j = 0, len = ref.length; j < len; j++) {
        p = ref[j];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.age++;
        if (p.age < p.lifespan) {
          this.ctx.beginPath();
          this.ctx.globalAlpha = p.a * (1 - p.age / p.lifespan);
          this.ctx.fillStyle = p.color;
          this.ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    };

    return Particles;
  })();

  Mask = (function () {
    function Mask(width, height, canvas1) {
      this.canvas = canvas1;
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext('2d');
      this.data = null;
    }

    Mask.prototype.arm = function (bgcolor) {
      if (bgcolor == null) {
        bgcolor = '#F0F0F0';
      }
      this.ctx.fillStyle = bgcolor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return (this.data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    };

    Mask.prototype.coverPixel = function (x, y) {
      var alphaOffset;
      alphaOffset = 4 * (x + this.canvas.width * y) + 3;
      return (this.data.data[alphaOffset] = 255);
    };

    Mask.prototype.uncoverPixel = function (x, y) {
      var alphaOffset;
      alphaOffset = 4 * (x + this.canvas.width * y) + 3;
      return (this.data.data[alphaOffset] = 0);
    };

    Mask.prototype.draw = function () {
      return this.ctx.putImageData(this.data, 0, 0);
    };

    return Mask;
  })();

  ArtAnimation = (function () {
    function ArtAnimation(parent1, particles, mask, speed) {
      this.parent = parent1;
      this.particles = particles;
      this.mask = mask;
      this.speed = speed != null ? speed : 1000;
      this.click = bind(this.click, this);
      this.animation = this.parent.querySelector('.animation');
      this.play = this.animation.querySelector('.play');
      this.caption = this.play.querySelector('.caption');
      this.img = this.animation.querySelector('img');
      this.animationFrame = 0;
    }

    ArtAnimation.prototype.setAnimationClass = function (cls) {
      this.animation.classList.remove('initial', 'error', 'loading', 'playing', 'played');
      return this.animation.classList.add(cls);
    };

    ArtAnimation.prototype.trackTime = (function () {
      var prev;
      prev = null;
      return function (timestamp) {
        var dt;
        if (prev == null) {
          prev = timestamp;
        }
        dt = timestamp - prev;
        prev = timestamp;
        return dt * (60 / 1000);
      };
    })();

    ArtAnimation.prototype.arm = function (name1) {
      this.name = name1;
      if (this.name.includes('the-pink-cloud')) this.img.src = 'img/' + this.name + '.jpg';
      else this.img.src = 'img/new/' + this.name;
      this.play.removeEventListener('click', this.click);
      this.play.addEventListener('click', this.click);
      this.setAnimationClass('initial');
      return cancelAnimationFrame(this.animationFrame);
    };

    ArtAnimation.prototype.click = function () {
      this.mask.arm();
      this.particles.reset();
      this.setAnimationClass('loading');
      return loadPlaybackData(
        this.name,
        (function (_this) {
          return function (playback, err) {
            var frame, index;
            if (err != null) {
              console.log('ERROR:', err);
              _this.caption.innerText = 'Loading error. Try again?';
              _this.setAnimationClass('error');
              return;
            }
            _this.setAnimationClass('playing');
            index = 0;
            frame = function (timestamp) {
              var _, color, i, j, k, pc, pos, ref, x, y;
              pc = _this.trackTime(timestamp);
              for (i = j = 0, ref = _this.speed; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
                pos = playback.positionAtIndex(index++);
                if (!pos) {
                  break;
                }
                (x = pos[0]), (y = pos[1]);
                _this.mask.uncoverPixel(x, y);
                if (i === 0) {
                  color = d3.lab(playback.colorAtPosition(x, y)).brighter(2) + '';
                  for (_ = k = 1; k <= 3; _ = ++k) {
                    _this.particles.add(x, y, color);
                  }
                }
              }
              _this.mask.draw();
              _this.particles.updateAndDraw(pc);
              if (playback.positionAtIndex(index) != null) {
                return (_this.animationFrame = requestAnimationFrame(frame));
              } else {
                _this.caption.innerText = 'Watch Again';
                return _this.setAnimationClass('played');
              }
            };
            return (_this.animationFrame = requestAnimationFrame(frame));
          };
        })(this),
      );
    };

    return ArtAnimation;
  })();

  headerParticles = new Particles(1125, 675, 1.5, document.querySelector('.header .particles'));

  headerMask = new Mask(1125, 675, document.querySelector('.header .mask'));

  headerAnimation = new ArtAnimation(document.querySelector('.header'), headerParticles, headerMask, 1000);

  headerAnimation.arm('the-pink-cloud_ed67e3f_28');

  galleryParticles = new Particles(1125, 675, 1, document.querySelector('.gallery .particles'));

  galleryMask = new Mask(1125, 675, document.querySelector('.gallery .mask'));

  galleryAnimation = new ArtAnimation(document.querySelector('.gallery'), galleryParticles, galleryMask, 750);

  galleryAnimation.arm('56.png');

  imgClick = function () {
    var cls, name, source, sourceImg, src;
    src = this.src;
    name = this.dataset.num + '.png';
    galleryAnimation.arm(name);
    cls = this.dataset.cls;
    source = this.dataset.source;
    sourceImg = document.querySelector('.gallery .source');
    sourceImg.src = 'img/' + source; // + '.jpg';
    sourceImg.classList.remove('wide', 'tall');
    return sourceImg.classList.add(cls);
  };

  ref = document.querySelectorAll('.thumbnails img');
  for (j = 0, len = ref.length; j < len; j++) {
    img = ref[j];
    img.addEventListener('click', imgClick);
  }

  /* */

  function _loadImage(url, init) {
    return new Promise(function (resolve, reject) {
      let img = new Image();
      for (let key in init) img[key] = init[key];
      img.onerror = reject;
      img.onload = function () {
        resolve(img);
      };
      img.src = url;
    });
  }

  const artWidth = 1125;
  const artHeight = 675;
  const numPixels = artWidth * artHeight;

  function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function decompressPositionSequence(img) {
    let canvas = createCanvas(artWidth, artHeight);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let { data: buf } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let positions = new Int32Array(numPixels);
    let base = 256;
    let baseSquared = base * base;
    for (let i = 0; i < numPixels; i += 1) {
      let index = i * 4;
      let order = buf[index] * baseSquared + buf[index + 1] * base + buf[index + 2];
      positions[order] = i;
    }
    return positions;
  }

  loadPlaybackData = (function (_this) {
    return function (name, cb) {
      var check, image, json, loadImage, loadJson;
      loadJson = function (cb) {
        const ret = [];
        return (
          name.includes('the-pink-cloud')
            ? fetch('data/the-pink-cloud_ed67e3f_28.json').then((res) => res.json())
            : _loadImage('img/new/s/' + name, {
                crossOrigin: 'anonymous',
              }).then(decompressPositionSequence)
        )
          .then(function (positions) {
            cb(function (index) {
              if (index < positions.length) {
                const d = positions[index];
                ret[0] = d % artWidth;
                ret[1] = Math.floor(d / artWidth);
                return ret;
              } else {
                return null;
              }
            });
          })
          .catch((err) => cb(null, err));
      };
      loadImage = function (cb) {
        var imgData, src;
        src = new Image();
        src.src = name.includes('the-pink-cloud') ? 'img/' + name + '.jpg' : 'img/new/' + name;
        imgData = null;
        src.onerror = function () {
          return cb(null, 'Image failed to load.');
        };
        return (src.onload = function () {
          var srcCanvas, srcCtx, srcImageData;
          srcCanvas = document.createElement('canvas');
          srcCanvas.width = src.width;
          srcCanvas.height = src.height;
          srcCtx = srcCanvas.getContext('2d');
          srcCtx.drawImage(src, 0, 0, src.width, src.height);
          imgData = srcImageData = srcCtx.getImageData(0, 0, src.width, src.height).data;
          return cb(function (x, y) {
            var offset;
            offset = 4 * (x + src.width * y);
            return 'rgb(' + imgData[offset + 0] + ',' + imgData[offset + 1] + ',' + imgData[offset + 2] + ')';
          });
        });
      };
      json = image = null;
      check = function () {
        if (json != null && image != null) {
          return cb({
            positionAtIndex: json,
            colorAtPosition: image,
          });
        }
      };
      loadJson(function (result, err) {
        if (err != null) {
          return cb(null, err);
        } else {
          json = result;
          return check();
        }
      });
      return loadImage(function (result, err) {
        if (err != null) {
          return cb(null, err);
        } else {
          image = result;
          return check();
        }
      });
    };
  })(this);
}.call(this));
