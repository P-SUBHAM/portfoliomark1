document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const neonToggle = document.getElementById('neonToggle');
    const html = document.documentElement;
    
    // Check for saved preferences
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const savedNeon = localStorage.getItem('neon') || 'on';
    
    // Apply initial states
    applyTheme(savedTheme);
    applyNeon(savedNeon);
    
    // Theme toggle handler
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        
        // Add animation effect
        themeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    });
    
    // Neon toggle handler
    neonToggle.addEventListener('click', function() {
        const currentNeon = html.getAttribute('data-neon');
        const newNeon = currentNeon === 'on' ? 'off' : 'on';
        applyNeon(newNeon);
        
        // Add animation effect
        neonToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            neonToggle.style.transform = 'scale(1)';
        }, 200);
    });
    
    function applyTheme(theme) {
        html.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        neonToggle.style.display = theme === 'dark' ? 'block' : 'none';
    }
    
    function applyNeon(state) {
        html.setAttribute('data-neon', state);
        localStorage.setItem('neon', state);
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
});
