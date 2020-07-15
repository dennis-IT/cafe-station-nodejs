(function () {
    window.onload = function () {
        let nav_toggle = this.document.querySelector(".nav-toggle");
        let nav_menu = this.document.querySelector(".nav-menu");
        nav_toggle.addEventListener("click", () => {
            nav_menu.classList.toggle("active");
        });
    };
})();
