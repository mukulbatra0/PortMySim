// FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = question.classList.contains('active');
        
        // Close all other answers
        faqQuestions.forEach(q => {
            if (q !== question) {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            }
        });
        
        // Toggle current answer
        question.classList.toggle('active');
        answer.classList.toggle('active');
    });
});

// Plan Card Hover Animation
const planCards = document.querySelectorAll('.plan-card');

planCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        planCards.forEach(c => {
            if (c !== card) {
                c.style.transform = 'scale(0.95)';
                c.style.opacity = '0.7';
            }
        });
    });
    
    card.addEventListener('mouseleave', () => {
        planCards.forEach(c => {
            c.style.transform = '';
            c.style.opacity = '';
        });
    });
});

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
document.querySelectorAll('.plan-card, .faq-item').forEach(element => {
    observer.observe(element);
});

// Smooth scroll to comparison section
const comparisonLinks = document.querySelectorAll('a[href="#comparison"]');
comparisonLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const comparisonSection = document.querySelector('.plan-comparison');
        comparisonSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Update current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear(); 