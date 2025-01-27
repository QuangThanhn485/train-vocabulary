/**
 * Quản lý danh sách từ vựng và localStorage
 */
class VocabularyManager {
    constructor() {
        this.vocabularyList = [];
        this.correctWordsListEl = [];
        this.loadFromLocalStorage();
    }

    /**
     * Lưu từ vựng vào localStorage
     */
    saveToLocalStorage() {
        localStorage.setItem('vocabulary', JSON.stringify(this.vocabularyList));
    }

    /**
     * Tải từ vựng từ localStorage
     */
    loadFromLocalStorage() {
        const storedVocabulary = localStorage.getItem('vocabulary');
        if (storedVocabulary) {
            this.vocabularyList = JSON.parse(storedVocabulary);
        }
    }

    /**
     * Thêm một từ vựng mới
     * @param {string} word
     * @param {string} description - Giải thích (description) của từ
     */
    addWord(word, description) {
        this.vocabularyList.push({ word, description });
        this.saveToLocalStorage();
    }

    /**
     * Tìm một từ vựng trong danh sách
     * @param {string} wordToFind
     * @returns {object|null}
     */
    findWord(wordToFind) {
        return this.vocabularyList.find(item =>
            item.word.toLowerCase() === wordToFind.toLowerCase()
        );
    }

    /**
     * Xóa từ vựng khỏi danh sách
     * @param {string} word
     */
    removeWord(word) {
        this.vocabularyList = this.vocabularyList.filter(
            item => item.word !== word
        );
        this.saveToLocalStorage();
    }
}

/**
 * Quản lý giao diện và sự kiện (events)
 */
class VocabularyApp {
    constructor() {
        // Lưu trữ các phần tử HTML
        this.toggleAddButton = document.getElementById('toggle-add-button');
        this.addSection = document.getElementById('add-section');
        this.addVocabularySection = document.getElementById('add-vocabulary-section');
        this.toggleIcon = document.getElementById('toggle-icon');

        this.vocabularyInput = document.getElementById('vocabulary-input');
        this.descriptionInput = document.getElementById('description-input');
        this.addWordButton = document.getElementById('add-word-button');
        this.vocabularyListEl = document.getElementById('vocabulary-list');

        this.checkInput = document.getElementById('check-input');
        this.checkWordButton = document.getElementById('check-word-button');
        this.checkResult = document.getElementById('check-result');

        // Khu vực hiển thị những từ đã check đúng
        this.correctWordsListEl = document.getElementById('correct-words-list');

        // Tạo instance (đối tượng) của class VocabularyManager
        this.manager = new VocabularyManager();

        // Thêm 2 biến để đếm số lần kiểm tra và số lần đúng
        this.totalAttempts = 0;
        this.correctCount = 0;
    }

    /**
     * Khởi tạo (initialize) các sự kiện
     */
    init() {
        this.toggleAddButton.addEventListener('click', () => {
            this.toggleAddSection();
        });

        this.addWordButton.addEventListener('click', () => {
            this.handleAddWord();
        });

        this.checkWordButton.addEventListener('click', () => {
            this.handleCheckWord();
        });

        // Khi nhấn Enter trong ô check-input cũng gọi hàm checkWord
        this.checkInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.handleCheckWord();
            }
        });
        this.descriptionInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.handleAddWord();
                this.vocabularyInput.focus();
            }
        });

        // Lần đầu tải trang, hiển thị danh sách từ vựng
        this.renderVocabularyList();
    }
    

    /**
     * Thêm tất cả từ vựng từ mảng vào giao diện
     */
    renderVocabularyList() {
        // Xóa nội dung cũ để tránh trùng lặp
        this.vocabularyListEl.innerHTML = '';

        // Lặp qua từng từ và tạo phần tử hiển thị
        this.manager.vocabularyList.forEach(({ word, description }) => {
            const listItem = this.createVocabularyItemElement(word, description);
            this.vocabularyListEl.appendChild(listItem);
        });
    }

    /**
     * Tạo phần tử hiển thị một từ vựng
     * @param {string} word
     * @param {string} description
     */
    createVocabularyItemElement(word, description) {
        // Tạo thẻ <li>
        const listItem = document.createElement('li');

        // Tạo nội dung từ
        const wordText = document.createElement('span');
        wordText.textContent = word;

        // Tạo phần mô tả từ
        const wordDescription = document.createElement('span');
        wordDescription.textContent = description;
        wordDescription.classList.add('description');

        // Nút xóa từ
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');

        // Xử lý sự kiện xóa khi bấm nút
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            listItem.remove(); // Xóa khỏi giao diện
            this.manager.removeWord(word); // Xóa khỏi danh sách và localStorage
        });

        // Sự kiện click vào listItem để đọc từ
        listItem.addEventListener('click', () => {
            const speech = new SpeechSynthesisUtterance(word);
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
        });

        // Thêm các phần tử con vào li
        listItem.appendChild(wordText);
        listItem.appendChild(wordDescription);
        listItem.appendChild(deleteButton);

        return listItem;
    }

    /**
     * Xử lý logic khi bấm nút "Add Word"
     */
    handleAddWord() {
        const word = this.vocabularyInput.value.trim();
        const description = this.descriptionInput.value.trim();

        if (!word || !description) {
            alert('Please enter both the word and its description (giải thích)!');
            return;
        }

        // Thêm vào manager và lưu
        this.manager.addWord(word, description);

        // Tạo phần tử giao diện
        const newItem = this.createVocabularyItemElement(word, description);
        this.vocabularyListEl.appendChild(newItem);

        // Xóa dữ liệu trong ô input
        this.vocabularyInput.value = '';
        this.descriptionInput.value = '';
    }

    /**
     * Xử lý logic khi bấm nút "Check Word"
     */
    handleCheckWord() {
        const wordToCheck = this.checkInput.value.trim();

        if (!wordToCheck) {
            this.checkResult.textContent = 'Please enter a word to check!';
            this.checkResult.style.color = 'red';
            return;
        }

        // Tìm từ trong danh sách
        const match = this.manager.findWord(wordToCheck);
        const findExis = this.manager.correctWordsListEl.find(s=>s.word.toLowerCase() === wordToCheck.toLowerCase())
        if (match && !findExis) {
            
            this.checkResult.style.color = 'green';
            // Phát âm (pronounce) từ vừa nhập
            const speech = new SpeechSynthesisUtterance(match.word);
            speech.lang = 'en-US'; // Bạn có thể thay đổi accent
            window.speechSynthesis.speak(speech);

            this.manager.correctWordsListEl.push({ word : match.word , description : match.description });
            this.correctWordsListEl.innerHTML='';
            let resultCount = `${this.manager.correctWordsListEl.length}/ ${this.manager.vocabularyList.length}`
            this.checkResult.textContent = `"${match.word}" : ${match.description} ( ${resultCount} )`;
            this.manager.correctWordsListEl.forEach(({ word, description }) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${word} : ${description}`
                this.correctWordsListEl.appendChild(listItem);
                // Sự kiện click vào listItem để đọc từ
                listItem.addEventListener('click', () => {
                    const speech = new SpeechSynthesisUtterance(word);
                    speech.lang = 'en-US';
                    window.speechSynthesis.speak(speech);
                });
            });

        } else {
            findExis && (() => {
                const speech = new SpeechSynthesisUtterance(wordToCheck);
                    speech.lang = 'en-US';
                    window.speechSynthesis.speak(speech);
            })()
            let message = !findExis ? 'Incorrect !' : 'Exis !'
            this.checkResult.textContent = message;
            this.checkResult.style.color = 'red';
        }

        // Xóa dữ liệu trong ô input
        this.checkInput.value = '';
    }

    /**
     * Đóng/mở phần Add Vocabulary
     */
    toggleAddSection() {
        const isCollapsed = this.addSection.classList.contains('collapsed');

        // Nếu đang đóng, mở ra
        if (isCollapsed) {
            this.addSection.classList.remove('collapsed');
            this.addVocabularySection.classList.remove('d-none');
            this.toggleIcon.textContent = '◀';
        } 
        // Nếu đang mở, thì đóng lại
        else {
            this.addSection.classList.add('collapsed');
            this.addVocabularySection.classList.add('d-none');
            this.toggleIcon.textContent = '▶';
        }
    }
}

// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    const app = new VocabularyApp();
    app.init();
});
