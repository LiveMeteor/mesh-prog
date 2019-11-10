var app;
(function (app) {
    class Main {
        constructor() {
            this.designWidth = 720;
            this.designHeight = 405;
            this.moveX = 0;
            this.moveY = 0;
            this.camera = new THREE.PerspectiveCamera(70, this.designWidth / this.designHeight, 1, 1000);
            this.camera.position.set(200, 200, 200);
            this.camera.lookAt(0, 0, 0);
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xcccccc);
            var grid = new THREE.GridHelper(1000, 40, 0x000000, 0x000000);
            grid.material.opacity = 0.2;
            grid.material.transparent = true;
            this.scene.add(grid);
            var texture = new THREE.TextureLoader().load('textures/bspline_char_0.png');
            var geometry = new THREE.BoxBufferGeometry(200, 200, 200);
            var material = new THREE.MeshBasicMaterial({ map: texture });
            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(1);
            this.renderer.setSize(this.designWidth, this.designHeight);
            document.getElementById("game_container").appendChild(this.renderer.domElement);
            this.animate();
            this.moveCtrl = new fw.TouchMoveCtrl(document);
            this.moveCtrl.bindXChange(this, "changeX");
            this.moveCtrl.bindYChange(this, "changeY");
        }
        get changeX() {
            return this.moveX;
        }
        set changeX(value) {
            this.moveX = value;
        }
        get changeY() {
            return this.moveY;
        }
        set changeY(value) {
            this.moveY = value;
        }
        animate() {
            setTimeout(() => {
                this.animate.call(this);
            }, 1000 / 24);
            this.mesh.rotation.z = (this.moveX / 5) / (180 / Math.PI);
            this.mesh.rotation.x = (this.moveY / 5) / (180 / Math.PI);
            this.renderer.render(this.scene, this.camera);
        }
    }
    app.Main = Main;
})(app || (app = {}));
var fw;
(function (fw) {
    class TouchMoveCtrl {
        constructor(target) {
            this.touchShake = 3;
            this.beginX = 0;
            this.beginY = 0;
            TouchMoveCtrl.self = this;
            this.isTouchDown = false;
            this.target = target;
            this.target.addEventListener("pointerdown", TouchMoveCtrl.eventBridge, false);
            this.target.addEventListener("pointermove", TouchMoveCtrl.eventBridge, false);
            this.target.addEventListener("pointerup", TouchMoveCtrl.eventBridge, false);
            this.target.addEventListener("pointercancel", TouchMoveCtrl.eventBridge, false);
        }
        static eventBridge(evt) {
            TouchMoveCtrl.self.onTouchScroll.call(TouchMoveCtrl.self, evt);
        }
        onTouchScroll(evt) {
            if (evt.type == "pointerdown") {
                this.isTouchDown = true;
                if (this.bindBeginProp && this.bindBeginProp.func.length == 0)
                    this.bindBeginProp.func.call(this.bindBeginProp.target);
                else if (this.bindBeginProp)
                    this.bindBeginProp.func.call(this.bindBeginProp.target, evt);
                this.beginPoint = { x: evt.x, y: evt.y };
                if (this.bindXProp)
                    this.beginX = this.bindXProp.target[this.bindXProp.prop];
                if (this.bindYProp)
                    this.beginY = this.bindYProp.target[this.bindYProp.prop];
                if (this.bindXYProp) {
                    let begin = this.bindXYProp.getfunc.call(this.bindXYProp.target);
                    this.beginX = begin.x;
                    this.beginY = begin.y;
                }
            }
            else if (this.beginPoint && (evt.type == "pointermove" || evt.type == "pointerup" || evt.type == "pointercancel")) {
                if (!this.isTouchDown)
                    return;
                this.nowPoint = { x: evt.x, y: evt.y };
                if (this.touchShake > 0 && evt.type == "pointermove" &&
                    (this.nowPoint.x - this.beginPoint.x < this.touchShake && this.nowPoint.x - this.beginPoint.x > -this.touchShake ||
                        this.nowPoint.y - this.beginPoint.y < this.touchShake && this.nowPoint.y - this.beginPoint.y > -this.touchShake))
                    return;
                if (this.bindXProp)
                    this.bindXProp.target[this.bindXProp.prop] = this.beginX + (this.nowPoint.x - this.beginPoint.x);
                if (this.bindYProp) {
                    this.bindYProp.target[this.bindYProp.prop] = this.beginY + (this.nowPoint.y - this.beginPoint.y);
                }
                if (this.bindXYProp)
                    this.bindXYProp.setfunc.call(this.bindXYProp.target, this.beginX + (this.nowPoint.x - this.beginPoint.x), this.beginY + (this.nowPoint.y - this.beginPoint.y));
            }
            if (evt.type == "pointerup" || evt.type == "pointercancel") {
                if (!this.isTouchDown)
                    return;
                if (this.bindEndProp && this.bindEndProp.func.length == 0)
                    this.bindEndProp.func.call(this.bindEndProp.target);
                else if (this.bindEndProp)
                    this.bindEndProp.func.call(this.bindEndProp.target, evt);
                this.beginPoint = undefined;
                this.isTouchDown = false;
            }
        }
        bindXChange(target, prop) {
            if (typeof (target[prop]) != "number") {
                console.error(this, "bind property is not number type!!!");
                return;
            }
            this.bindXProp = { target, prop };
        }
        bindYChange(target, prop) {
            if (typeof (target[prop]) != "number") {
                console.error(this, "bind property is not number type!!!");
                return;
            }
            this.bindYProp = { target, prop };
        }
        bindMoveBeginFunc(target, func) {
            this.bindBeginProp = { target, func };
        }
        bindXYChange(target, getfunc, setfunc) {
            this.bindXYProp = { target, getfunc, setfunc };
        }
        bindMoveEndFunc(target, func) {
            this.bindEndProp = { target, func };
        }
        destroy() {
            this.target.removeEventListener("pointerdown", TouchMoveCtrl.eventBridge, false);
            this.target.removeEventListener("pointermove", TouchMoveCtrl.eventBridge, false);
            this.target.removeEventListener("pointerup", TouchMoveCtrl.eventBridge, false);
            this.target.removeEventListener("pointercancel", TouchMoveCtrl.eventBridge, false);
        }
    }
    fw.TouchMoveCtrl = TouchMoveCtrl;
})(fw || (fw = {}));
//# sourceMappingURL=mesh.all.js.map