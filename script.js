/**
 * VocabularyManager: Quản lý danh sách từ vựng và localStorage
 */
class VocabularyManager {
    constructor() {
      this.vocabularyList = [];
      this.correctWords = []; // Lưu các từ đã kiểm tra đúng
      this.loadFromLocalStorage();
    }
  
    saveToLocalStorage() {
      localStorage.setItem('vocabulary', JSON.stringify(this.vocabularyList));
    }
  
    loadFromLocalStorage() {
      const storedVocabulary = localStorage.getItem('vocabulary');
      if (storedVocabulary) {
        this.vocabularyList = JSON.parse(storedVocabulary);
      }
    }
  
    addWord(word, description) {
      this.vocabularyList.push({ word, description });
      this.saveToLocalStorage();
    }
  
    findWord(wordToFind) {
      return this.vocabularyList.find(
        item => item.word.toLowerCase() === wordToFind.toLowerCase()
      );
    }
  
    removeWord(word) {
      this.vocabularyList = this.vocabularyList.filter(
        item => item.word !== word
      );
      this.saveToLocalStorage();
    }
  }
  
  /**
   * VocabularyApp: Quản lý giao diện và sự kiện
   */
  class VocabularyApp {
    constructor() {
      // Lấy các phần tử DOM cố định
      this.trainContainer = document.getElementById('train');
      this.stepButtons = {
        step1: document.getElementById('step-1'),
        step2: document.getElementById('step-2'),
        step3: document.getElementById('step-3')
      };
  
      this.toggleAddButton = document.getElementById('toggle-add-button');
      this.addSection = document.getElementById('add-section');
      this.addVocabularySection = document.getElementById('add-vocabulary-section');
      this.toggleIcon = document.getElementById('toggle-icon');
      this.vocabularyInput = document.getElementById('vocabulary-input');
      this.descriptionInput = document.getElementById('description-input');
      this.addWordButton = document.getElementById('add-word-button');
      this.vocabularyListElement = document.getElementById('vocabulary-list');
  
      this.manager = new VocabularyManager();
  
      // Biến đếm
      this.totalAttempts = 0;
      this.correctCount = 0;
  
      // Gán sự kiện cố định
      this.addWordButton.addEventListener('click', () => this.handleAddWord());
      this.toggleAddButton.addEventListener('click', () => this.toggleAddSection());
    }
  
    init() {
      // Hiển thị danh sách từ vựng
      this.renderVocabularyList();
  
      // Gán sự kiện cho các nút bước
      this.stepButtons.step1.addEventListener('click', () => this.setupStep1());
      this.stepButtons.step2.addEventListener('click', () => this.setupStep2());
      this.stepButtons.step3.addEventListener('click', () => this.setupStep3());
  
      // Mặc định hiển thị step1
      this.stepButtons.step1.click();
    }
  
    // Hàm trợ giúp: Phát âm từ (speak)
    speak(text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // ngữ âm tiếng Anh (accent)
      window.speechSynthesis.speak(utterance);
    }
  
    // Render danh sách từ vựng ở sidebar
    renderVocabularyList() {
      this.vocabularyListElement.innerHTML = '';
      this.manager.vocabularyList.forEach(({ word, description }) => {
        const listItem = this.createVocabularyItemElement(word, description);
        this.vocabularyListElement.appendChild(listItem);
      });
      this.addWordButton.textContent = `Add Word (${this.manager.vocabularyList.length})`;
    }
  
    // Tạo phần tử hiển thị cho một từ vựng
    createVocabularyItemElement(word, description) {
      const listItem = document.createElement('li');
  
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
  
      const descriptionSpan = document.createElement('span');
      descriptionSpan.textContent = description;
      descriptionSpan.classList.add('description');
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'X';
      deleteButton.classList.add('delete-button');
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        listItem.remove();
        this.manager.removeWord(word);
        this.renderVocabularyList(); // cập nhật số lượng từ
      });
  
      listItem.addEventListener('click', () => this.speak(word));
  
      listItem.append(wordSpan, descriptionSpan, deleteButton);
      return listItem;
    }
  
    // Xử lý logic khi bấm nút "Add Word"
    handleAddWord() {
      const word = this.vocabularyInput.value.trim();
      const description = this.descriptionInput.value.trim();
        console.log(word);
        console.log(description);
      if (!word || !description) {
        alert('Please enter both the word and its description (giải thích)!');
        return;
      }
  
      this.manager.addWord(word, description);
      const newItem = this.createVocabularyItemElement(word, description);
      this.vocabularyListElement.appendChild(newItem);
      this.vocabularyInput.value = '';
      this.descriptionInput.value = '';
      this.addWordButton.textContent = `Add Word (${this.manager.vocabularyList.length})`;
    }
  
    // Xử lý logic khi kiểm tra từ (Step 1)
    handleCheckWord() {
      const wordToCheck = this.checkInput.value.trim();
      if (!wordToCheck) {
        this.checkResult.textContent = 'Please enter a word to check!';
        this.checkResult.style.color = 'red';
        return;
      }
  
      const matchedWord = this.manager.findWord(wordToCheck);
      const alreadyChecked = this.manager.correctWords.find(
        item => item.word.toLowerCase() === wordToCheck.toLowerCase()
      );
      let resultCount;
      if (matchedWord && !alreadyChecked) {
        this.checkResult.style.color = 'green';
        this.speak(matchedWord.word);
        this.manager.correctWords.push(matchedWord);
        this.correctWordsListElement.innerHTML = '';
        resultCount = `${this.manager.correctWords.length} / ${this.manager.vocabularyList.length}`;
        this.checkResult.textContent = `"${matchedWord.word}" : ${matchedWord.description} ( ${resultCount} )`;
  
        this.manager.correctWords.forEach(({ word, description }) => {
          const li = document.createElement('li');
          li.textContent = `${word} : ${description}`;
          li.addEventListener('click', () => this.speak(word));
          this.correctWordsListElement.appendChild(li);
        });
      } else {
        if (alreadyChecked) {
          this.speak(wordToCheck);
          resultCount = `${this.manager.correctWords.length} / ${this.manager.vocabularyList.length}`;
          this.checkResult.textContent = `${alreadyChecked.word} : ${alreadyChecked.description} (${resultCount})`;
        } else {
          this.checkResult.textContent = 'Incorrect!';
        }
        this.checkResult.style.color = 'red';
      }
      this.checkInput.value = '';
    }
  
    // Setup giao diện cho Step 1: Check Word
    setupStep1() {
      this.activateStepButton('step1');
      this.trainContainer.innerHTML = `
        <div class="step2 container mt-5">
          <h1>STEP 1: check word</h1>
          <div id="check-result"></div>
          <input type="text" id="check-input" placeholder="Enter a word to check..." />
          <button class="d-none" id="check-word-button">Check</button>
          <ul id="correct-words-list"></ul>
        </div>
      `;
  
      // Lấy các phần tử vừa được render
      this.checkResult = document.getElementById('check-result');
      this.checkInput = document.getElementById('check-input');
      this.checkWordButton = document.getElementById('check-word-button');
      this.correctWordsListElement = document.getElementById('correct-words-list');
  
      // Sự kiện khi nhấn Enter trong ô check-input
      this.checkInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          this.handleCheckWord();
        }
      });
  
      // Sự kiện nhấn Enter trong ô description để add word (giữ con trỏ ở vocabulary-input)
      this.descriptionInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          this.handleAddWord();
          this.vocabularyInput.focus();
        }
      });
    }
  
    // Setup giao diện cho Step 2: Check Listen
    setupStep2() {
      this.activateStepButton('step2');
      this.trainContainer.innerHTML = `
        <div id="step-2-contaner" class="step2 container mt-5">
          <h1>STEP 2: check listen</h1>
          <div class="mb-5 row">
            <div class="col-8">
              <button class="sound-button w-100" id="btn-train-vocabulary">Start</button>
            </div>
            <div class="col-2 ps-2">
              <button class="sound-button w-100" id="btn-repeat-word" title="listen again !">Again</button>
            </div>
            <div class="col-2 ps-2">
              <button class="sound-button w-100 reset-button" id="btn-restart-word" title="Restart progress!">Restart</button>
            </div>
            </div>
          <div id="check-result-vocabulary"></div>
          <div class="input-row">
            <input type="text" placeholder="Nhập từ vựng..." id="vocabulary-input-step2">
          </div>
          <div class="progress-container">
            <div id="progress-vocabulary" class="progress-bar" style="width: 0%"></div>
          </div>
          <div id="help-step2" class="help-container" data-result="">
            <p class="help-text">Crl + X to get suggestions</p>
          </div>
        </div>
      `;
  
      // Lấy các phần tử cần thiết cho Step 2
      let wordsFailed = [];
      const btnTrainVocabulary = document.getElementById('btn-train-vocabulary');
      const btnRepeatWord = document.getElementById('btn-repeat-word');
      this.btnRestart = document.getElementById('btn-restart-word');
      this.resultVocabulary = document.getElementById('check-result-vocabulary');
      this.progressVocabulary = document.getElementById('progress-vocabulary');
      this.inputVocabularyStep2 = document.getElementById('vocabulary-input-step2');
      this.helpStep2 = document.getElementById('help-step2');
  
      // Tạo hàm random duy nhất cho danh sách từ vựng
      const getRandom = createUniqueRandom(this.manager.vocabularyList.length - 1);
      const vocabularyList = this.manager.vocabularyList;
      let currentWord = '';
      let currentDescription = '';
      let correctCount = 1;
      
      const pickNewWord = () => {
        const { word, description } = vocabularyList[getRandom()];
        currentWord = word;
        currentDescription = description;
        this.speak(word);
        document.addEventListener("keydown",
           (event) => keydownHandler(event, showHelp, this.helpStep2, `${currentWord} : ${currentDescription}`, 5000));
      };
      const restart = () => {
        correctCount = 1;
        this.progressVocabulary.style.width = '0%';
        this.resultVocabulary.classList.add('hidden-result');
        setTimeout(() => {
          pickNewWord();
        }, 1000);
      }
  
      btnTrainVocabulary.addEventListener('click', () => pickNewWord());
      btnRepeatWord.addEventListener('click', () => {
        if (currentWord) this.speak(currentWord);
      });
      this.btnRestart.addEventListener('click', () => restart());
  
      this.inputVocabularyStep2.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          const userInput = this.inputVocabularyStep2.value.trim().toLowerCase();
          if (userInput === currentWord.toLowerCase()) {
            this.resultVocabulary.textContent = `${currentWord} : ${currentDescription}`;
            this.inputVocabularyStep2.value = '';
            const progressPercent = (correctCount * 100) / vocabularyList.length;
            this.progressVocabulary.style.width = `${progressPercent}%`;
            pickNewWord();
            correctCount++;
          } else {
            let wordsFailed = JSON.parse(localStorage.getItem("wordsFailed")) || [];
            let index = wordsFailed.findIndex(word => word.word === currentWord);
            if (index !== -1) {
                wordsFailed[index].countFail += 1;
            } else {
                wordsFailed.push({
                    word: currentWord,
                    description: currentDescription,
                    countFail: 1
                });
            }
            wordsFailed.sort((a, b) => b.countFail - a.countFail);
            localStorage.setItem("wordsFailed", JSON.stringify(wordsFailed));


            this.resultVocabulary.textContent = `Incorrect!`;
            this.resultVocabulary.classList.add('hidden-result');
            setTimeout(() => this.resultVocabulary.classList.remove('hidden-result'), 300);
          }
        }
      });
    }
  
    // Setup giao diện cho Step 3: Check Description
    setupStep3() {
      this.activateStepButton('step3');
      this.trainContainer.innerHTML = `
        <div id="step-3-container" class="step2 container mt-5">
          <h1>STEP 3: check description</h1>
          <p id="description-text" class="description-box fs-3"></p>
          <div class="text-danger fw-bold mt-3" id="check-result-vocabulary"></div>
          <div class="input-row">
            <input type="text" placeholder="Nhập từ vựng..." id="vocabulary-input-step3">
          </div>
          <div class="progress-container" style="width: 100%; background: #ddd; height: 20px; border-radius: 5px; margin-top: 10px;">
            <div id="progress-vocabulary" class="progress-bar" style="width: 0%; height: 100%; background: #4caf50; border-radius: 5px; transition: width 0.3s ease-in-out;">&nbsp;</div>
          </div>
          <div id="help-step2" class="help-container" data-result="">
            <p class="help-text">Crl + X to get suggestions</p>
          </div>
        </div>
      `;
  
      this.resultVocabulary = document.getElementById('check-result-vocabulary');
      this.progressVocabulary = document.getElementById('progress-vocabulary');
      this.inputVocabularyStep3 = document.getElementById('vocabulary-input-step3');
      this.descriptionText = document.getElementById('description-text');
      this.helpStep2 = document.getElementById('help-step2');
  
      const getRandom = createUniqueRandom(this.manager.vocabularyList.length - 1);
      const vocabularyList = this.manager.vocabularyList;
      let currentWord = '';
      let currentDescription = '';
      let correctCount = 0;
  
      const pickNewWord = () => {
        const { word, description } = vocabularyList[getRandom()];
        currentWord = word;
        currentDescription = description;
        this.descriptionText.textContent = description;
        document.addEventListener("keydown",
          (event) => keydownHandler(event, showHelp, this.helpStep2, `${currentWord} : ${currentDescription}`, 5000));
      };
  
      this.inputVocabularyStep3.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          if (this.inputVocabularyStep3.value.trim().toLowerCase() === currentWord.toLowerCase()) {
            this.resultVocabulary.textContent = `${currentWord} : ${currentDescription}`;
            this.inputVocabularyStep3.value = '';
            correctCount++;
            const progressPercent = (correctCount / vocabularyList.length) * 100;
            this.progressVocabulary.style.width = `${progressPercent}%`;
            this.progressVocabulary.textContent = `${Math.round(progressPercent)}%`;
            this.speak(currentWord);
            pickNewWord();
          } else {
            
            let wordsFailed = JSON.parse(localStorage.getItem("wordsFailed")) || [];
            let index = wordsFailed.findIndex(word => word.word === currentWord);
            if (index !== -1) {
                wordsFailed[index].countFail += 1;
            } else {
                wordsFailed.push({
                    word: currentWord,
                    description: currentDescription,
                    countFail: 1
                });
            }
            wordsFailed.sort((a, b) => b.countFail - a.countFail);
            localStorage.setItem("wordsFailed", JSON.stringify(wordsFailed));

            this.resultVocabulary.textContent = `Incorrect!`;
            this.resultVocabulary.classList.add('hidden-result');
            setTimeout(() => this.resultVocabulary.classList.remove('hidden-result'), 1000);
          }
        }
      });
  
      pickNewWord();
    }
  
    // Đặt trạng thái active cho nút bước được chọn
    activateStepButton(stepId) {
      Object.keys(this.stepButtons).forEach(id => {
        if (id === stepId) {
          this.stepButtons[id].classList.add('active');
        } else {
          this.stepButtons[id].classList.remove('active');
        }
      });
    }
  
    // Mở/đóng phần Add Vocabulary
    toggleAddSection() {
      const isCollapsed = this.addSection.classList.contains('collapsed');
      if (isCollapsed) {
        this.addSection.classList.remove('collapsed');
        this.addVocabularySection.classList.remove('d-none');
        this.toggleIcon.textContent = '◀';
      } else {
        this.addSection.classList.add('collapsed');
        this.addVocabularySection.classList.add('d-none');
        this.toggleIcon.textContent = '▶';
      }
    }
  }
  
  // Hàm helper: Tạo số ngẫu nhiên duy nhất trong khoảng 0 đến max
  function createUniqueRandom(max) {
    const numbers = Array.from({ length: max + 1 }, (_, i) => i);
    let availableNumbers = [...numbers];
  
    return function () {
      if (availableNumbers.length === 0) {
        availableNumbers = [...numbers]; // reset danh sách khi đã dùng hết
      }
      const index = Math.floor(Math.random() * availableNumbers.length);
      return availableNumbers.splice(index, 1)[0];
    };
  }
  
  // Khởi chạy ứng dụng khi DOM đã sẵn sàng
  document.addEventListener('DOMContentLoaded', () => {
    const app = new VocabularyApp();
    app.init();
  });
  
// Lắng nghe sự kiện khi nhấn nút Import File
document.getElementById('import-word-button').addEventListener('click', function() {
  document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', function(e) {
  const fileInput = e.target; // Get the file input element
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader(); // FileReader: object to read file data
  reader.onload = function(e) {
    const content = e.target.result;
    localStorage.setItem('vocabulary', content);
    alert('Vocabulary updated successfully! (Từ vựng đã được cập nhật thành công!)');
    
    // Refresh the app if needed
    const app = new VocabularyApp();
    app.init();

    // Reset the file input so selecting the same file again will trigger the change event
    fileInput.value = '';
  };

  reader.readAsText(file);
});


// Event listener for the Export File button
document.getElementById('export-file-button').addEventListener('click', function() {
  const vocabularyContent = localStorage.getItem('vocabulary');
  
  if (!vocabularyContent) {
    alert('No vocabulary data found! (Không tìm thấy dữ liệu từ vựng!)');
    return;
  }

  const blob = new Blob([vocabularyContent], { type: 'text/plain' });
  
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocabulary.txt';
  
  document.body.appendChild(a);
  
  a.click();
  
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
  
  alert('Vocabulary exported successfully! (Xuất file từ vựng thành công!)');
});
function keydownHandler(event, callback, elmContainer, result, time = 5000) {
  if (event.ctrlKey && event.code === "KeyX") {
      event.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
      event.stopPropagation(); // Ngăn chặn lan truyền sự kiện (nếu có)

      // Gọi callback (showHelp) đúng cách
      if (typeof callback === "function") {
          callback(elmContainer, result, time);
      }

      // Xóa sự kiện sau khi thực thi
      document.removeEventListener("keydown", keydownHandler);
  }
}
function showHelp(elmContainer, result, time = 5000) {
  if (!elmContainer) return;
  
  let html = `<p>${result}</p>`;
  elmContainer.innerHTML = html;
  
  setTimeout(() => {
      elmContainer.innerHTML = `<p class="help-text">Crl + X to get suggestions</p>`;
  }, time);
}
