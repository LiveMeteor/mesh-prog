requirejs.config({
    baseUrl: "./",
    waitSeconds: 20,
    paths: {
        THREE: ["../lib/three"],
        mesh: ["js/mesh.all"],
    }
});

function loadFramework(onComplete) {
    require(["THREE"], function(THREE) {
        window.THREE = THREE;
        onComplete();
    });
}

function loadGame() {
    require(["mesh"], function() {
        new app.Main();
    });
}

loadFramework(loadGame);




