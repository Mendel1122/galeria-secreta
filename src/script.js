    // Enhanced page loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Signup button scroll functionality
    const signupBtnScroll = document.getElementById('signup-btn');
    if (signupBtnScroll) {
        signupBtnScroll.addEventListener('click', () => {
            document.querySelector('#application')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Enhanced form auto-save
    initFormAutoSave();
});