// PERSONALIZE THESE THREE VALUES
const DEFAULT_CONFIG = {
  sender: "Your Name",
  recipient: "Your Favourite Person",
  message: "Some people make ordinary days feel special just by being in them. You bring a little more light, laughter, and warmth into my world. I'd love to spend a lovely moment with you and make a memory we can both smile about. No grand promises — just a sincere invitation from my heart."
};

const inviteParams = new URLSearchParams(window.location.search);
const CONFIG = {
  sender: inviteParams.get("sender")?.slice(0, 80) || DEFAULT_CONFIG.sender,
  recipient: inviteParams.get("recipient")?.slice(0, 80) || DEFAULT_CONFIG.recipient,
  message: inviteParams.get("message")?.slice(0, 600) || DEFAULT_CONFIG.message
};

const openLetter = document.getElementById("openLetter");
const intro = document.getElementById("intro");
const letterSection = document.getElementById("letterSection");
const celebration = document.getElementById("celebration");
const typedMessage = document.getElementById("typedMessage");
const toast = document.getElementById("toast");
const soundBtn = document.getElementById("soundBtn");
const soundLabel = document.getElementById("soundLabel");

document.getElementById("recipientName").textContent = CONFIG.recipient;
document.getElementById("senderName").textContent = CONFIG.sender;

let typingTimer;
let audioContext = null;
let soundOn = false;
let melodyTimer = null;
let noteIndex = 0;

openLetter.addEventListener("click", () => {
  if (openLetter.classList.contains("open")) return;
  openLetter.classList.add("open");
  setTimeout(() => {
    intro.style.display = "none";
    letterSection.classList.add("visible");
    letterSection.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => letterSection.classList.add("reveal"));
    window.scrollTo({top: 0, behavior: "smooth"});
    typeMessage(CONFIG.message);
    burstHearts(12);
  }, 850);
});

function typeMessage(message) {
  clearInterval(typingTimer);
  typedMessage.textContent = "";
  let i = 0;
  typingTimer = setInterval(() => {
    typedMessage.textContent += message.charAt(i);
    i++;
    if (i >= message.length) clearInterval(typingTimer);
  }, 25);
}

document.getElementById("yesBtn").addEventListener("click", () => {
  letterSection.style.display = "none";
  celebration.classList.add("visible");
  celebration.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => celebration.classList.add("reveal"));
  window.scrollTo({top: 0, behavior: "smooth"});
  burstHearts(55);
  showToast("A beautiful memory starts with one little yes. ❤️");
});

document.getElementById("laterBtn").addEventListener("click", () => {
  showToast("Of course. Take all the time you need. 💗");
  burstHearts(8);
});

document.getElementById("restartBtn").addEventListener("click", () => {
  clearInterval(typingTimer);
  celebration.classList.remove("reveal");
  letterSection.classList.remove("reveal");
  setTimeout(() => {
    celebration.classList.remove("visible");
    celebration.setAttribute("aria-hidden", "true");
    letterSection.classList.remove("visible");
    letterSection.setAttribute("aria-hidden", "true");
    intro.style.display = "flex";
    openLetter.classList.remove("open");
    typedMessage.textContent = "";
    window.scrollTo({top: 0, behavior: "smooth"});
  }, 350);
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  if (window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    showToast("Publish this page first to create a link your special person can open.");
    return;
  }

  const inviteUrl = new URL(window.location.href);
  inviteUrl.searchParams.set("sender", CONFIG.sender);
  inviteUrl.searchParams.set("recipient", CONFIG.recipient);
  inviteUrl.searchParams.set("message", CONFIG.message);
  const shareUrl = inviteUrl.toString();
  const shareText = `${CONFIG.recipient},\n\n${CONFIG.sender} made this love invitation just for you:\n\n${CONFIG.message}\n\nOpen your invitation:\n${shareUrl}`;
  const shareData = {
    title: "A Little Love Invitation ❤️",
    text: shareText,
    url: shareUrl
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareText);
      showToast("Full invitation and website link copied. Send them to someone special! 💌");
      return;
    }
  } catch (err) {
    if (err.name === "AbortError") return;
  }

  const linkField = document.createElement("textarea");
  linkField.value = shareText;
  linkField.setAttribute("readonly", "");
  linkField.style.position = "fixed";
  linkField.style.opacity = "0";
  document.body.appendChild(linkField);
  linkField.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (err) {
    copied = false;
  }
  linkField.remove();

  if (copied) {
    showToast("Full invitation and website link copied. Send them to someone special! 💌");
  } else {
    window.prompt("Copy the full invitation and website link to share it:", shareText);
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// Gentle optional synthesized chime — no audio file required.
soundBtn.addEventListener("click", async () => {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") await audioContext.resume();
    soundOn = !soundOn;
    soundLabel.textContent = soundOn ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-label", soundOn ? "Turn gentle sound off" : "Turn gentle sound on");
    if (soundOn) playMelody();
    else { clearInterval(melodyTimer); melodyTimer = null; }
  } catch (e) {
    showToast("Sound isn't available in this browser.");
  }
});

function playMelody() {
  clearInterval(melodyTimer);
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  const playNote = () => {
    if (!soundOn || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[noteIndex % notes.length];
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.65);
    osc.connect(gain); gain.connect(audioContext.destination);
    osc.start(); osc.stop(audioContext.currentTime + 0.7);
    noteIndex++;
  };
  playNote();
  melodyTimer = setInterval(playNote, 760);
}

// Ambient drifting particles.
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({length: Math.min(75, Math.floor(window.innerWidth / 15))}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.6 + 0.3,
    a: Math.random() * 0.45 + 0.1,
    speed: Math.random() * 0.25 + 0.06,
    phase: Math.random() * Math.PI * 2
  }));
}
function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach(p => {
    p.y -= p.speed;
    p.phase += 0.012;
    if (p.y < -5) { p.y = window.innerHeight + 5; p.x = Math.random() * window.innerWidth; }
    ctx.beginPath();
    ctx.arc(p.x + Math.sin(p.phase) * 7, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,190,211,${p.a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();

function burstHearts(count) {
  const symbols = ["♥", "♡", "✦", "✧"];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement("span");
      heart.className = "float-heart";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.fontSize = (Math.random() * 18 + 10) + "px";
      heart.style.animationDuration = (Math.random() * 3 + 3) + "s";
      heart.style.opacity = Math.random() * 0.55 + 0.35;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 6500);
    }, i * 45);
  }
}
setInterval(() => {
  if (Math.random() > 0.45) burstHearts(1);
}, 1700);

async function createHeartArt() {
  const canvas = document.getElementById("heartCanvas");
  const stage = canvas.parentElement;
  if (!window.WebGLRenderingContext) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -1.05);
    heartShape.bezierCurveTo(-0.48, -0.55, -1.2, -0.08, -1.2, 0.55);
    heartShape.bezierCurveTo(-1.2, 1.18, -0.42, 1.42, 0, 0.82);
    heartShape.bezierCurveTo(0.42, 1.42, 1.2, 1.18, 1.2, 0.55);
    heartShape.bezierCurveTo(1.2, -0.08, 0.48, -0.55, 0, -1.05);

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      curveSegments: 24
    });
    geometry.center();
    const heart = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
      color: 0xf176a0,
      emissive: 0x5a102d,
      emissiveIntensity: 0.32,
      metalness: 0.28,
      roughness: 0.19,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    }));
    heart.scale.setScalar(0.86);
    scene.add(heart);

    const sparkles = [];
    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdfaa,
      emissive: 0x9c4d52,
      emissiveIntensity: 0.65,
      metalness: 0.4,
      roughness: 0.28
    });
    [[-1.25, 0.72, 0.35], [1.28, 0.82, 0.2], [-0.95, -0.78, 0.3], [1.05, -0.75, 0.25]].forEach((position, index) => {
      const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), sparkleMaterial);
      sparkle.position.set(position[0], position[1], position[2]);
      sparkle.userData.phase = index * 1.6;
      sparkle.userData.baseY = position[1];
      scene.add(sparkle);
      sparkles.push(sparkle);
    });

    scene.add(new THREE.AmbientLight(0xffdce8, 1.8));
    const keyLight = new THREE.PointLight(0xffc5d7, 42, 12);
    keyLight.position.set(-3, 3, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff4f91, 30, 10);
    rimLight.position.set(3, -1, -2);
    scene.add(rimLight);

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();
    stage.classList.add("is-rendered");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const clock = new THREE.Clock();
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        heart.rotation.y = Math.sin(elapsed * 0.55) * 0.3;
        heart.rotation.x = Math.sin(elapsed * 0.7) * 0.08;
        heart.position.y = Math.sin(elapsed * 1.2) * 0.08;
        sparkles.forEach(sparkle => {
          sparkle.rotation.x = elapsed * 0.7 + sparkle.userData.phase;
          sparkle.rotation.y = elapsed * 0.9 + sparkle.userData.phase;
          sparkle.position.y = sparkle.userData.baseY + Math.sin(elapsed * 1.4 + sparkle.userData.phase) * 0.045;
        });
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();
    }
  } catch (error) {
    stage.classList.remove("is-rendered");
    console.error("The 3D heart could not be rendered; showing the animated fallback instead.", error);
  }
}

createHeartArt();
