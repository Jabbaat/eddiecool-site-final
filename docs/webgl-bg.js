/**
 * webgl-bg.js — Eddiecool Interactieve 3D Particle Achtergrond
 * Maakt een full-screen Three.js canvas met reagerende deeltjes
 */
(function () {
    'use strict';

    // Wacht tot Three.js geladen is
    function waitForThree(callback, retries) {
        retries = retries || 0;
        if (typeof THREE !== 'undefined') {
            callback();
        } else if (retries < 30) {
            setTimeout(function () { waitForThree(callback, retries + 1); }, 100);
        }
    }

    function initWebGL() {
        /* ─── SCENE SETUP ─── */
        var scene    = new THREE.Scene();
        var camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 500;

        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Transparante achtergrond

        /* ─── CANVAS IN DOM ─── */
        var canvas = renderer.domElement;
        canvas.id  = 'webgl-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);

        /* ─── DEELTJES GEOMETRIE ─── */
        var PARTICLE_COUNT = 900;
        var positions  = new Float32Array(PARTICLE_COUNT * 3);
        var colors     = new Float32Array(PARTICLE_COUNT * 3);
        var sizes      = new Float32Array(PARTICLE_COUNT);

        // Kleurenpalet: paars, cyaan, zacht wit
        var palette = [
            new THREE.Color(0xa855f7),  // paars
            new THREE.Color(0x7c3aed),  // diep paars
            new THREE.Color(0x06b6d4),  // cyaan
            new THREE.Color(0x818cf8),  // indigo
            new THREE.Color(0xd946ef),  // roze-paars
        ];

        for (var i = 0; i < PARTICLE_COUNT; i++) {
            // Willekeurige positie in een bol
            var theta  = Math.random() * Math.PI * 2;
            var phi    = Math.acos(2 * Math.random() - 1);
            var r      = 150 + Math.random() * 350;

            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

            // Kleur uit palet
            var c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3]     = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;

            sizes[i] = Math.random() * 2.5 + 0.5;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

        /* ─── SHADER MATERIAAL (zachte gloeiende deeltjes) ─── */
        var material = new THREE.PointsMaterial({
            size:          2.5,
            sizeAttenuation: true,
            vertexColors:  true,
            transparent:   true,
            opacity:       0.75,
            blending:      THREE.AdditiveBlending,
            depthWrite:    false,
        });

        var particles = new THREE.Points(geometry, material);
        scene.add(particles);

        /* ─── WIREFRAME GOLVEND VLAK (subtiele grid) ─── */
        var gridGeo = new THREE.PlaneGeometry(1800, 1800, 28, 28);
        var gridMat = new THREE.MeshBasicMaterial({
            color:       0x3b0764,
            wireframe:   true,
            transparent: true,
            opacity:     0.08,
        });
        var grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2.5;
        grid.position.y = -200;
        scene.add(grid);

        /* ─── MUIS-INTERACTIE ─── */
        var mouse = { x: 0, y: 0 };
        var targetRot = { x: 0, y: 0 };

        document.addEventListener('mousemove', function (e) {
            mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
            mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        /* ─── WINDOW RESIZE ─── */
        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        /* ─── ANIMATIELUS ─── */
        var clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            var elapsed = clock.getElapsedTime();

            // Langzame rotatie van deeltjeswolk
            particles.rotation.y = elapsed * 0.04;
            particles.rotation.x = elapsed * 0.015;

            // Grid golfbeweging
            var gpos = grid.geometry.attributes.position;
            for (var i = 0; i < gpos.count; i++) {
                var x = gpos.getX(i);
                var z = gpos.getZ(i);
                gpos.setY(i, Math.sin(x * 0.008 + elapsed * 0.5) * 18 +
                              Math.cos(z * 0.006 + elapsed * 0.4) * 12);
            }
            gpos.needsUpdate = true;

            // Soepele muis-volging (lerp)
            targetRot.x += (mouse.y * 0.12 - targetRot.x) * 0.05;
            targetRot.y += (mouse.x * 0.12 - targetRot.y) * 0.05;

            camera.position.x = targetRot.y * 80;
            camera.position.y = -targetRot.x * 60;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();
    }

    // Start na DOM-load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { waitForThree(initWebGL); });
    } else {
        waitForThree(initWebGL);
    }

})();
