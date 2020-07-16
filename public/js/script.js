(function () {
    window.onload = function () {
        let nav_toggle = this.document.querySelector(".nav-toggle");
        let nav_menu = this.document.querySelector(".nav-menu");
        nav_toggle.addEventListener("click", () => {
            nav_menu.classList.toggle("active");
        });

        //Check button edit image onclick()
        let btnEdit = document.querySelector('#edit-image-btn');
        let uplbox = document.querySelector('#imageUploadBox');
        let drinkUpdateForm = document.querySelector('#drinkUpdateForm');
        btnEdit.onclick = function () {
            if (uplbox.style.display === "none") {
                uplbox.style.display = "block";
                btnEdit.innerHTML = "No image change? Hide image uploader";
                drinkUpdateForm.setAttribute("action", "/manage/drink/update");
                drinkUpdateForm.setAttribute("enctype", "multipart/form-data");
            } else {
                uplbox.style.display = "none";
                btnEdit.innerHTML = "Reveal image uploader";
                drinkUpdateForm.setAttribute("action", "/manage/drink/update-no-image");
                drinkUpdateForm.setAttribute("enctype", "");
            }
        }
    };
})();
