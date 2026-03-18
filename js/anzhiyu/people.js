"use strict";

(function () {
  // --- 1. 防止重复声明锁 ---
  if (window.anzhiyu_people_init) {
    // 如果已经初始化过，仅在 PJAX 完成时尝试重新绑定 DOM
    if (typeof initPeopleCanvas === "function") initPeopleCanvas();
    return;
  }
  window.anzhiyu_people_init = true;

  // --- 2. 辅助函数 (Babel 编译压缩版) ---
  function _toConsumableArray(e) { return _arrayWithoutHoles(e) || _iterableToArray(e) || _unsupportedIterableToArray(e) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance."); }
  function _unsupportedIterableToArray(e, r) { if (e) { if ("string" == typeof e) return _arrayLikeToArray(e, r); var t = Object.prototype.toString.call(e).slice(8, -1); return "Object" === t && e.constructor && (t = e.constructor.name), "Map" === t || "Set" === t ? Array.from(e) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(e, r) : void 0; } }
  function _iterableToArray(e) { if (("undefined" != typeof Symbol && null != e[Symbol.iterator]) || null != e["@@iterator"]) return Array.from(e); }
  function _arrayWithoutHoles(e) { if (Array.isArray(e)) return _arrayLikeToArray(e); }
  function _arrayLikeToArray(e, r) { (null == r || r > e.length) && (r = e.length); for (var t = 0, a = new Array(r); t < r; t++) a[t] = e[t]; return a; }
  function _classCallCheck(e, r) { if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function"); }
  function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var a = r[t]; a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, a.key, a); } }
  function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), e; }

  // --- 3. 配置与状态变量 (封装在闭包内) ---
  var peopleConfig = {
    src: GLOBAL_CONFIG.peoplecanvas.img,
    rows: 15,
    cols: 7,
  };

  var randomRange = function (e, r) { return e + Math.random() * (r - e); },
      randomIndex = function (e) { return 0 | randomRange(0, e.length); },
      removeFromArray = function (e, r) { return e.splice(r, 1)[0]; },
      removeItemFromArray = function (e, r) { return removeFromArray(e, e.indexOf(r)); },
      removeRandomFromArray = function (e) { return removeFromArray(e, randomIndex(e)); },
      getRandomFromArray = function (e) { return e[0 | randomIndex(e)]; };

  var resetPeep = function (e) {
    var r, t, a = e.stage, n = e.peep, o = 0.5 < Math.random() ? 1 : -1,
        i = 100 - 250 * gsap.parseEase("power2.in")(Math.random()),
        s = a.height - n.height + i;
    return (
      1 == o ? ((r = -n.width), (t = a.width), (n.scaleX = 1)) : ((r = a.width + n.width), (t = 0), (n.scaleX = -1)),
      (n.x = r), (n.y = s),
      { startX: r, startY: (n.anchorY = s), endX: t }
    );
  };

  var normalWalk = function (e) {
    var r = e.peep, t = e.props, a = t.startY, n = t.endX, o = gsap.timeline();
    return (
      o.timeScale(randomRange(0.5, 1.5)),
      o.to(r, { duration: 10, x: n, ease: "none" }, 0),
      o.to(r, { duration: 0.25, repeat: 40, yoyo: !0, y: a - 10 }, 0),
      o
    );
  };

  var walks = [normalWalk];
  var Peep = (function () {
    function a(e) {
      _classCallCheck(this, a);
      this.image = e.image;
      this.setRect(e.rect);
      this.x = 0; this.y = 0; this.anchorY = 0; this.scaleX = 1; this.walk = null;
    }
    return _createClass(a, [{
      key: "setRect",
      value: function (e) {
        this.rect = e;
        this.width = e[2];
        this.height = e[3];
        this.drawArgs = [this.image].concat(_toConsumableArray(e), [0, 0, this.width, this.height]);
      }
    }, {
      key: "render",
      value: function (e) {
        e.save();
        e.translate(this.x, this.y);
        e.scale(this.scaleX, 1);
        e.drawImage.apply(e, _toConsumableArray(this.drawArgs));
        e.restore();
      }
    }]), a;
  })();

  // --- 4. 核心逻辑变量 ---
  var img = document.createElement("img");
  var canvasEl = null, ctx = null;
  var stage = { width: 0, height: 0 };
  var allPeeps = [], availablePeeps = [], crowd = [];

  function cleanupPeopleCanvas() {
    window.removeEventListener("resize", resize);
    gsap.ticker.remove(render);
    crowd.forEach(function (e) { if (e.walk) e.walk.kill(); });
    crowd.length = 0;
    availablePeeps.length = 0;
  }

  function initPeopleCanvas() {
    canvasEl = document.getElementById("peoplecanvas");
    if (!canvasEl) return;
    
    ctx = canvasEl.getContext("2d");
    if (allPeeps.length === 0) createPeeps();
    
    resize();
    gsap.ticker.remove(render); // 确保不重复添加
    gsap.ticker.add(render);
    window.addEventListener("resize", resize);
  }

  function createPeeps() {
    var e = peopleConfig.rows, r = peopleConfig.cols, t = e * r,
        a = img.naturalWidth / e, n = img.naturalHeight / r;
    for (var o = 0; o < t; o++) {
      allPeeps.push(new Peep({
        image: img,
        rect: [(o % e) * a, ((o / e) | 0) * n, a, n]
      }));
    }
  }

  function resize() {
    if (canvasEl && canvasEl.clientWidth != 0) {
      stage.width = canvasEl.clientWidth;
      stage.height = canvasEl.clientHeight;
      canvasEl.width = stage.width * devicePixelRatio;
      canvasEl.height = stage.height * devicePixelRatio;
      crowd.forEach(function (e) { e.walk.kill(); });
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push.apply(availablePeeps, allPeeps);
      initCrowd();
    }
  }

  function initCrowd() {
    while (availablePeeps.length) addPeepToCrowd().walk.progress(Math.random());
  }

  function addPeepToCrowd() {
    var e = removeRandomFromArray(availablePeeps);
    var r = getRandomFromArray(walks)({
      peep: e,
      props: resetPeep({ peep: e, stage: stage })
    }).eventCallback("onComplete", function () {
      removePeepFromCrowd(e);
      addPeepToCrowd();
    });
    e.walk = r;
    crowd.push(e);
    crowd.sort(function (a, b) { return a.anchorY - b.anchorY; });
    return e;
  }

  function removePeepFromCrowd(e) {
    removeItemFromArray(crowd, e);
    availablePeeps.push(e);
  }

  function render() {
    if (!canvasEl) return;
    canvasEl.width = canvasEl.width; // Clear canvas
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    crowd.forEach(function (e) { e.render(ctx); });
    ctx.restore();
  }

  // --- 5. 生命周期与 PJAX 绑定 ---
  img.onload = initPeopleCanvas;
  img.src = peopleConfig.src;

  // 使用全局标志位确保事件只绑定一次
  if (!window.isAnzhiyuPeopleBound) {
    window.isAnzhiyuPeopleBound = true;
    document.addEventListener("pjax:send", cleanupPeopleCanvas);
    document.addEventListener("pjax:complete", function() {
      // 延迟 300ms 确保 DOM 树加载完成且避开主线程高峰
      setTimeout(initPeopleCanvas, 300);
    });
  }
})();