// Intersection Observer for Animations
const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.1
});

// Observe elements for animation
document.querySelectorAll('.mission-item, .team-member, .achievement-card, .stat-item').forEach(element => {
    observer.observe(element);
});

// Counter Animation for Stats
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50; // Divide animation into 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
};

// Start counter animation when stats section is in view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statItems = document.querySelectorAll('.stat-item h3');
            statItems.forEach(item => {
                const target = parseInt(item.textContent);
                if (!isNaN(target)) {
                    animateCounter(item, target);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Team Member Social Links Hover Effect
document.querySelectorAll('.team-member').forEach(member => {
    const socialLinks = member.querySelector('.team-member-social');
    
    member.addEventListener('mouseenter', () => {
        socialLinks.style.opacity = '1';
        socialLinks.style.transform = 'translateY(0)';
    });
    
    member.addEventListener('mouseleave', () => {
        socialLinks.style.opacity = '0.7';
        socialLinks.style.transform = 'translateY(10px)';
    });
}); 