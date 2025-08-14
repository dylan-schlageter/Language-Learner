function removeBook() {
    let container = document.getElementById("book-text-container");
    container.innerHTML = '<p>Choose which book to remove:</p><br>';
    container.style.visibility = "visible";
    document.getElementById("read-button-container").style.visibility = "hidden";
    let fragment = document.createDocumentFragment();
    let titles = Object.keys(myLibrary.library)

    for(let i = 0; i < titles.length; i++){
        let btn = document.createElement('btn');
        btn.textContent = titles[i];
        btn.classList.add('word');
        btn.classList.add('to-remove');
        btn.style.margin = "10px";
        fragment.appendChild(btn);
    }

    container.appendChild(fragment);

    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("to-remove")){
            myLibrary.remove_book(event.target.textContent.trim());
            document.getElementById("book-text-container").style.visibility = "hidden";
            document.getElementById("read-button-container").style.visibility = "hidden";
        }
    });
}

