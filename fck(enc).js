        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    fontFamily: {
                        sans: ["Plus Jakarta Sans", "sans-serif"],
                        heading: ["Space Grotesk", "sans-serif"],
                    },
                    colors: {
                        nebula: "#4f46e5",
                        plasma: "#0ea5e9",
                        void: "#020617",
                    },
                },
            },
        };
        
 const canvas = document.getElementById('cosmic-canvas');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStaticStars();
        });

        
        let staticStars = [];
        function initStaticStars() {
            staticStars = [];
            const count = Math.floor((width * height) / 8000);
            for(let i=0; i<count; i++) {
                staticStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.6 + 0.2,
                    speed: Math.random() * 0.05 + 0.01
                });
            }
        }

        
        let mouse = { x: width/2, y: height/2, active: false, isDown: false };
        let stars = [];
        const starCount = 12; 
        const connectionDistance = 250; 

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => { mouse.active = false; });
        window.addEventListener('mousedown', () => { mouse.isDown = true; });
        window.addEventListener('mouseup', () => { mouse.isDown = false; });

        window.addEventListener('touchmove', (e) => {
            if(e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
                mouse.active = true;
            }
        });

       
        let particles = [];

        class Particle {
            constructor(x, y, color, size, vx, vy) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = color;
                this.vx = vx;
                this.vy = vy;
                this.alpha = 1;
                this.decay = Math.random() * 0.02 + 0.015;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                // Add star bloom
                ctx.shadowBlur = this.size * 2;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        class ConstellationStar {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.baseSize = Math.random() * 2 + 1;
                this.color = Math.random() > 0.5 ? '#0ea5e9' : '#4f46e5';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                if (mouse.active) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = (connectionDistance - distance) / connectionDistance;

                    if (distance < connectionDistance) {
                        this.x += dx * force * 0.02;
                        this.y += dy * force * 0.02;
                    }
                }
            }

            draw() {
                ctx.save();
                const size = this.baseSize + (mouse.isDown ? 2 : 0);
                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = size * 4;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }
        for (let i = 0; i < starCount; i++) {
            stars.push(new ConstellationStar());
        }

        initStaticStars();

        function render() {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);
            let grad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height));
            grad.addColorStop(0, '#11103e');
            grad.addColorStop(0.5, '#05071f');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            staticStars.forEach(s => {
                s.alpha += s.speed;
                if(s.alpha > 0.8 || s.alpha < 0.2) s.speed = -s.speed;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.alpha)})`;
                ctx.fillRect(s.x, s.y, s.size, s.size);
            });

            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
                stars[i].draw();

                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y);
                        ctx.lineTo(stars[j].x, stars[j].y);
                        const alpha = (connectionDistance - distance) / connectionDistance * 0.2;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
            if (mouse.active) {
                let emitChance = mouse.isDown ? 4 : 1.5; 
                for(let k=0; k<emitChance; k++) {
                    let sizeFactor = mouse.isDown ? 4 : 2;
                    let pColor = mouse.isDown ? '#0ea5e9' : (Math.random() > 0.5 ? '#4f46e5' : '#38bdf8');
                    particles.push(new Particle(
                        mouse.x + (Math.random() - 0.5) * 20,
                        mouse.y + (Math.random() - 0.5) * 20,
                        pColor,
                        Math.random() * sizeFactor + 0.8,
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 2
                    ));
                }
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    particles[i].draw();
                }
            }

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const angleX = (yc - y) / 8;
                const angleY = (x - xc) / 8;
                
                card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.03, 1.03, 1.03)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });

        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        reveals.forEach(reveal => { observer.observe(reveal); });
   