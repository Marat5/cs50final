const checkApiButton = document.querySelector("#check-api");

async function* fetchWrodsFromPingPages() {
    let pageNumber = 1;
    let url = `/api/v1/ping?page=${pageNumber}`;

    while (true) {
        const response = await fetch(url);
        const body = await response.json();

        if (!body.next) {
            // Handles any error in process nicely
            // throw new Error("See how it looks on error");
            yield body.displayWord;
            return;
        }

        url = `/api/v1/ping?page=${body.next}`
        yield body.displayWord;
    }
}

const setButtonSuccess = () => {
    checkApiButton.classList.remove("btn-primary-custom");
    checkApiButton.classList.add("btn-success");
    checkApiButton.setAttribute("disabled", true)

    checkApiButton.textContent = "Api Is Fine";

    const statusWords = document.querySelector("#status-words");
    statusWords.classList.add("text-success");
}

const setButtonError = () => {
    checkApiButton.classList.remove("btn-primary-custom");
    checkApiButton.classList.add("btn-danger");
    checkApiButton.setAttribute("disabled", true)

    checkApiButton.textContent = "Api Is Not Fine";

    const statusWords = document.querySelector("#status-words");
    statusWords.classList.add("text-danger");
}

const addWordWhileLoading = (displayWord) => {
    const statusWords = document.querySelector("#status-words");

    const newWordElem = document.createElement('span');
    const newWordText = document.createTextNode(displayWord);
    newWordElem.appendChild(newWordText);

    statusWords.appendChild(newWordElem);
    statusWords.append(document.createTextNode("\n"));

    // We don't actually use the computedStyle value, but
    // Calling this function triggers layout update (with pending "opacity: 0")
    // So, we trick the browser optimisation to actually show transition instead of just setting opacity to 1 right away
    getComputedStyle(newWordElem).opacity;
    newWordElem.style.opacity = 1;
}

const checkApi = async () => {
    checkApiButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

    try {
        for await (const displayWord of fetchWrodsFromPingPages()) {
            addWordWhileLoading(displayWord);
        }
        setButtonSuccess();
    } catch {
        setButtonError();
    } finally {
        checkApiButton.removeEventListener("click", checkApi);
        setTimeout(() => {
            const statusWords = document.querySelector("#status-words");

            for (const word of statusWords.children) {
                word.style.opacity = 0;
            }
        }, 3000);
    }
}

checkApiButton.addEventListener("click", checkApi);