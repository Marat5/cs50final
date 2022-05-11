const checkApiButton = document.querySelector("#check-api");

const checkApi = () => {
    checkApiButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

    fetch("http://127.0.0.1:5000/api/v1/ping")
        .then(res => {
            return res.json();
        })
        .then(json => {
            if (json.isApiFine) {
                checkApiButton.classList.remove("btn-primary-custom");
                checkApiButton.classList.add("btn-success");
                checkApiButton.setAttribute("disabled", true)
    
                checkApiButton.textContent = "Api Is Fine";
            } else {
                throw new Error("Api is not fine!");
            }
        })
        .catch(e => {
            checkApiButton.classList.remove("btn-primary-custom");
            checkApiButton.classList.add("btn-danger");
            checkApiButton.setAttribute("disabled", true)

            checkApiButton.textContent = "Api Is Not Fine";
        })

    checkApiButton.removeEventListener("click", checkApi);
}

checkApiButton.addEventListener("click", checkApi);