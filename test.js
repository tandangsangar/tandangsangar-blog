
    const startBtn = document.getElementById('start-btn');
    const loadingContainer = document.getElementById('loading-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const radioUi = document.getElementById('radio-ui');
    const playingUi = document.getElementById('playing-ui');
    const togglePlayBtn = document.getElementById('toggle-play-btn');
    const liveIndicator = document.getElementById('live-indicator');
    const liveText = document.getElementById('live-text');
    const video = document.getElementById('webcam-video');
    const audio = document.getElementById('radio-audio');
    const container = document.getElementById('canvas-container');
    const maskCanvas = document.getElementById('mask-canvas');
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

    let scene, camera, renderer, particles;
    let audioContext, analyser, dataArray;
    let canvasTexture;
    let isPlaying = true;
    let segmentationRunning = false;

    // Custom Shaders untuk Stippling Acak (Non-Grid)
    const vertexShader = `
        uniform sampler2D u_videoTexture;
        uniform float u_audioBass;
        uniform float u_pixelRatio;
        
        attribute float a_randomOffset;
        
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vBrightness;

        void main() {
            vUv = position.xy;
            
            vec4 texColor = texture2D(u_videoTexture, vUv);
            
    // Custom Shaders untuk Stippling Acak (Non-Grid)
    const vertexShader = `
        uniform sampler2D u_videoTexture;
        uniform float u_audioBass;
        uniform float u_pixelRatio;
        
        attribute float a_randomOffset;
        
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vBrightness;

        void main() {
            vUv = position.xy;
            
            vec4 texColor = texture2D(u_videoTexture, vUv);
            
            float rawBrightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
            
            // Tingkatkan kontras secara matematis: area gelap makin ditahan, area terang diboost
            float contrastBrightness = smoothstep(0.15, 0.85, rawBrightness);
            
            // Stippling Logic:
            // Peluang hidup eksponensial. Shadow tetap, tapi highlight dapet peluang 100% full.
            float survivalChance = contrastBrightness * 2.0; 
            float hideMultiplier = step(a_randomOffset, survivalChance);
            
            // vBrightness menentukan apakah di-discard di fragment shader
            vBrightness = contrastBrightness * hideMultiplier;
            
            vColor = vec3(0.8, 1.0, 0.0);
            
            vec3 pos = vec3(
                (0.5 - vUv.x) * 2.0,
                (vUv.y - 0.5) * 2.0,
                0.0 
            );
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // Ukuran partikel ikutan kontras. 
            // Shadow ukurannya kecil/nyebar (5px), Highlight ukurannya raksasa biar langsung nyatu (45px)
            float baseSize = 5.0 + (contrastBrightness * 40.0); 
            
            gl_PointSize = baseSize * (1.0 / -mvPosition.z) * u_pixelRatio;
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        uniform float u_audioBass;
        
        varying vec3 vColor;
        varying float vBrightness;
        
        void main() {
            if (vBrightness < 0.01) discard;
            
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            float r = length(cxy);
            if (r > 1.0) discard;
            
            float core = step(r, 0.4);
            
            float glowStrength = u_audioBass * 1.8;
            float glow = smoothstep(1.0, 0.4, r) * glowStrength;
            
            float alpha = max(core, glow);
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `;

    function onResults(results) {
        if (!segmentationRunning) return;
        
        maskCtx.save();
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        maskCtx.drawImage(results.segmentationMask, 0, 0, maskCanvas.width, maskCanvas.height);
        
        maskCtx.globalCompositeOperation = 'source-in';
        maskCtx.drawImage(results.image, 0, 0, maskCanvas.width, maskCanvas.height);
        
        maskCtx.globalCompositeOperation = 'destination-over';
        maskCtx.fillStyle = '#000000';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        
        maskCtx.restore();

        if (canvasTexture) {
            canvasTexture.needsUpdate = true;
        }
    }

    async function init() {
        startBtn.classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        loadingContainer.classList.add('flex');

        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 10;
                if (progress > 90) progress = 90;
                progressBar.style.width = progress + '%';
                progressText.innerText = Math.floor(progress) + '%';
            }
        }, 500);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
            video.srcObject = stream;

            const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            }});
            selfieSegmentation.setOptions({
                modelSelection: 1, 
            });
            selfieSegmentation.onResults(onResults);
            
            await selfieSegmentation.initialize();
            
            const mpCamera = new Camera(video, {
                onFrame: async () => {
                    await selfieSegmentation.send({image: video});
                },
                width: 640,
                height: 480
            });
            await mpCamera.start();
            segmentationRunning = true;
            
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressText.innerText = '100% - SYSTEM READY';

        } catch (err) {
            clearInterval(progressInterval);
            console.error("Camera/MediaPipe error", err);
            alert("Akses kamera ditolak atau AI gagal dimuat.");
            startBtn.classList.remove('hidden');
            loadingContainer.classList.add('hidden');
            loadingContainer.classList.remove('flex');
            return;
        }

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = 2.5;

        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        canvasTexture = new THREE.CanvasTexture(maskCanvas);
        canvasTexture.minFilter = THREE.LinearFilter;
        canvasTexture.magFilter = THREE.LinearFilter;

        // Tambah amunisi partikel sampai setengah juta (500.000) 
        // Biar area terang yang survival chance-nya 100% bener-bener solid!
        const particleCount = 500000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const randomOffsets = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = Math.random();
            positions[i * 3 + 1] = Math.random();
            positions[i * 3 + 2] = 0;
            randomOffsets[i] = Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('a_randomOffset', new THREE.BufferAttribute(randomOffsets, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_videoTexture: { value: canvasTexture },
                u_audioBass: { value: 0.0 },
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending // NormalBlending biar warnanya tetep hijau solid, gak jadi putih
        });

        particles = new THREE.Points(geometry, material);
        
        const aspect = container.clientWidth / container.clientHeight;
        const videoAspect = 640/480; 
        
        let scaleCoverage = 1.0;
        if (aspect > videoAspect) {
             scaleCoverage = aspect / videoAspect;
        } else {
             scaleCoverage = videoAspect / aspect;
        }
        
        particles.scale.set(videoAspect * scaleCoverage, scaleCoverage, 1);
        scene.add(particles);

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            
            const newAspect = container.clientWidth / container.clientHeight;
            let newScaleCoverage = 1.0;
            if (newAspect > videoAspect) {
                 newScaleCoverage = newAspect / videoAspect;
            } else {
                 newScaleCoverage = videoAspect / newAspect;
            }
            particles.scale.set(videoAspect * newScaleCoverage, newScaleCoverage, 1);
        });

        // 5. Mainkan Audio & Sembunyikan UI
        if(audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audio.play().catch(e => console.log("Audio play error", e));
        
        setTimeout(() => {
            radioUi.style.opacity = '0';
            setTimeout(() => {
                radioUi.classList.add('hidden');
                playingUi.classList.remove('hidden');
            }, 500);
        }, 500); // Tahan sebentar biar tulisan 100% keliatan

        animate();
    }

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        // Ambil data BASS
        analyser.getByteFrequencyData(dataArray);
        let bassSum = 0;
        for (let i = 0; i < 8; i++) {
            bassSum += dataArray[i];
        }
        const avgBass = bassSum / 8;
        const normalizedBass = Math.min(1.0, (avgBass / 255.0) * 1.5); // sedikit di boost

        particles.material.uniforms.u_audioBass.value = normalizedBass;

        renderer.render(scene, camera);
    }

    startBtn.addEventListener('click', init);

    // Play/Pause Toggle Logic
    togglePlayBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            togglePlayBtn.innerText = '[ PLAY ]';
            liveIndicator.classList.remove('animate-pulse', 'bg-red-500');
            liveIndicator.classList.add('bg-gray-500');
            liveText.classList.replace('text-[#ccff00]', 'text-gray-500');
        } else {
            audio.play();
            togglePlayBtn.innerText = '[ PAUSE ]';
            liveIndicator.classList.add('animate-pulse', 'bg-red-500');
            liveIndicator.classList.remove('bg-gray-500');
            liveText.classList.replace('text-gray-500', 'text-[#ccff00]');
        }
        isPlaying = !isPlaying;
    });

