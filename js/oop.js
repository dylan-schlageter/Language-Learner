const API_KEY = '';
let unknown_words = {}; //word:translated_word

class Library {
    constructor() {
        this.active_book = null;
        this.library = {
            "el_alquimista": new Book("el_alquimista"),
            "narnia": new Book("narnia"),
            "perder_el_equilibrio": new Book("perder_el_equilibrio"),
            "perdida": new Book("perdida")
        };
    }

    remove_book(title) {
        delete this.library[title];
        document.getElementById(title).remove();
    }

    add_book(book) {
        this.library[book.title] = book;
    }
};

class Book {
    constructor(title) {
        this.title = title;
        this.content = []; // Array of lines
        this.pageNum = 0;
        
    }

    page_forward() {
        this.pageNum += 1;
        this.display_page();
    }

    page_backward() {
        if(this.pageNum === 0) return;
        this.pageNum -= 1;
        this.display_page();
    }

    display_page() {
        let text_container = document.getElementById("book-text-container");
        text_container.innerHTML = "";
        let page_length = 35
        let start = this.pageNum * page_length;
        let end = start + page_length;
        
        if (end > this.content.length)
            end = this.content.length;
        
        let page = "";
        const pg = document.createDocumentFragment()
        for (let i = start; i < end; i++){
            const line = document.createDocumentFragment()
            let words = this.content[i].split(" ");
            for(let k = 0; k < words.length; k++){
                let btn = document.createElement('button');
                btn.textContent = words[k];
                btn.classList.add('word');
                btn.id = words[k];
                btn.onclick = aiTranslate;
                let cleanedWord = words[k].replace(/[^\p{L}]/gu, '');
                if (cleanedWord in unknown_words){
                    btn.classList.add('unknown-word');
                    
                    const tooltip = document.createElement('span');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = unknown_words[cleanedWord];
                    
                    btn.appendChild(tooltip);
                }
                line.appendChild(btn);
            }
            pg.appendChild(line);
            let brFragment = document.createDocumentFragment();
            brFragment.appendChild(document.createElement("br"));
            pg.appendChild(brFragment);
        } 
        
        document.getElementById("read-button-container").style.visibility = 'visible';
        text_container.style.visibility = 'visible';
        text_container.appendChild(pg);
        document.getElementById("page-display").textContent = `Page: ${this.pageNum + 1}`;
        document.getElementById("read-button-container").scrollIntoView();
    }

    async load_content(filePath) {
        if (this.content.length != 0){
            console.log("already done")
            return
        };

        try{
            const response = await fetch(filePath);
            if (!response.ok){
                throw new Error(`Response status: ${response.status}`); 
            }
            const text = await response.text();
            let lines = text.split("\n");
            this.content = lines;
            return lines;
        } catch(error){
            console.error(error.message)
        }
    };
};


const myLibrary = new Library();

async function showPage(filePath) {
    let title = filePath.split("/")[2].split(".")[0];
    let book = myLibrary.library[title];
    await book.load_content(filePath);
    book.display_page();
    myLibrary.active_book = book;

};

async function aiTranslate() {
    let word = this.id.replace(/[^\p{L}]/gu, '');
    if (word in unknown_words) { //If clicking on word that is already yellow
        this.style.backgroundColor = '#1a1a1a';
        this.style.color = 'white';
        delete unknown_words[word];
        myLibrary.active_book.display_page();
        return
    }
    
    try{
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: "POST",
            headers: {
                'Content-Type' : "application/json",
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-5-nano", 
                messages: [{role:"user",content:`Translate '${word}' to english no extra`}]
            })
        });
        if (!response.ok) console.error("No response");
        let result = await response.json();
        let translated_word = result.choices[0].message.content;
        unknown_words[word] = translated_word;
        myLibrary.active_book.display_page();
    } catch(error) {
        console.error(error.message);
    }
    
};



