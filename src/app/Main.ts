namespace app {

    export class Main {

        private camera: THREE.PerspectiveCamera;
        private scene: THREE.Scene;
        private mesh: THREE.Mesh;
        private renderer: THREE.WebGLRenderer;
        private moveCtrl: fw.TouchMoveCtrl;

        private designWidth = 720;
        private designHeight = 405;

        public constructor() {
            this.camera = new THREE.PerspectiveCamera(70, this.designWidth / this.designHeight, 1, 1000);
            this.camera.position.set(200, 200, 200);
            this.camera.lookAt(0, 0, 0);
            // this.camera.aspect = this.designWidth / this.designHeight;
            // this.camera.updateProjectionMatrix();

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xcccccc);
            var grid = new THREE.GridHelper( 1000, 40, 0x000000, 0x000000 );
            (grid.material as THREE.Material).opacity = 0.2;
            (grid.material as THREE.Material).transparent = true;
            this.scene.add( grid );

            var texture = new THREE.TextureLoader().load('textures/bspline_char_0.png');
            var geometry = new THREE.BoxBufferGeometry(200, 200, 200);
            var material = new THREE.MeshBasicMaterial({ map: texture });
            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(1);
            this.renderer.setSize(this.designWidth, this.designHeight);
            document.getElementById("game_container").appendChild(this.renderer.domElement);
            //
            this.animate();

            this.moveCtrl = new fw.TouchMoveCtrl(document);
            this.moveCtrl.bindXChange(this, "changeX");
            this.moveCtrl.bindYChange(this, "changeY");

        }

        private moveX: number = 0;
        public get changeX(): number {
            return this.moveX;
        }
        public set changeX(value: number) {
            this.moveX = value;
        }

        public moveY: number = 0;
        public get changeY(): number {
            return this.moveY;
        }
        public set changeY(value: number) {
            this.moveY = value;
        }


        private animate() {
            setTimeout(() => {
                this.animate.call(this);
            }, 1000 / 24);

            this.mesh.rotation.z = (this.moveX / 5) / (180 / Math.PI);
            this.mesh.rotation.x = (this.moveY / 5) / (180 / Math.PI);
            // this.mesh.rotation.x += 0.005;
            // this.mesh.rotation.y += 0.01;
            this.renderer.render(this.scene, this.camera);
        }
    }
}