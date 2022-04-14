window.addEventListener('load', () => {


    const changeTheme = () => {
        const body = document.querySelector('body');
        body.classList.toggle('dark-theme');
        console.log(body.classList);
    }


    const changeThemeBtn = document.querySelector('.header__theme-button');
    changeThemeBtn.addEventListener('click', changeTheme);

});