var currentScore;
var currentMove = 0;
document.addEventListener("DOMContentLoaded", function() {
    fetchRandomArticle();
    currentScore = 0;
    currentMove = 0;
});
var answer;
var pastAnswers = [];
var successHistory = [];
var pastTitles = [];

function fetchRandomArticle() {
    if (getParameterByName(currentMove.toString()) != null){
        fetchChosenArticle(getParameterByName(currentMove.toString()));
    } else {
        const apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/random/summary'
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const title_text = data['title'];
                const extract_text = data['extract'];
                console.log(title_text, extract_text);
                displayQuestion(title_text, extract_text, data['thumbnail']['source'])
            })
            .catch(error => console.error('Error fetching random article:', error));
    }
}


function fetchChosenArticle(title) {

    const apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + title

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const title_text = data['title'];
            const extract_text = data['extract'];
            console.log(title_text, extract_text);
            displayQuestion(title_text, extract_text, data['thumbnail']['source'])
            
        })
        .catch(error => fetchRandomArticle());
}


function displayQuestion(title_text, extract_text, img_src) {
    pastTitles.push(title_text);

    const questionElement = document.getElementById("question");
    document.getElementById("title").textContent = title_text;
    var imgElement = document.createElement("img");
    imgElement.src = img_src;
    imgElement.style.maxHeight = "300px";
    document.getElementById("image_holder").appendChild(imgElement);

    words = extract_text.split(" ");
    var l = words.length;
    var randomNum = Math.floor(Math.random() * l) + 1;
    while (true){
        if (randomNum-1 > title_text.split(" ").length){
            if (words[randomNum-1].length > 3){
                break;
            } 
        }
        randomNum = Math.floor(Math.random() * l) + 1;
    }

    new_text = replaceNthWordWithUnderscore(extract_text, randomNum);
    answer = stripPunctuation(words[randomNum - 1])
    console.log(answer)

    document.getElementById("question").innerHTML = new_text;
}

function stripPunctuation(str) {
    return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

function checkAnswer() {
    console.log(answer)
    var userAnswer = document.getElementById("answer").value;
    pastAnswers.push(answer);
    successHistory.push(answer.toLowerCase() == stripPunctuation(userAnswer.toLowerCase()));

    if (answer.toLowerCase() == stripPunctuation(userAnswer.toLowerCase().replace(/\s/g, ""))){
        document.getElementById('answer').value = '';
        document.getElementById('score').textContent = parseInt(document.getElementById('score').textContent) + 1
        document.getElementById("image_holder").innerHTML = '';
        if (currentMove < 4){
            document.getElementById("trivia-container").style.display = 'none';
            currentMove++
            fetchRandomArticle();
            document.getElementById("results-container").innerHTML = '<div class="checkmark">&#10004;</div>'
            setTimeout(() => {
                document.getElementById("results-container").innerHTML = '';
                document.getElementById("trivia-container").style.display = 'block';
            }, 600);
            
        } else {
            res = displayGameResults();
            document.getElementById("trivia-container").style.display = 'none';
            document.getElementById("results-container").appendChild(res);
        }
    } else {
        document.getElementById('answer').value = ''
        //document.getElementById('score').textContent = parseInt(document.getElementById('score').textContent) - 1
        //fetchChosenArticle(answer)
        var q_holder = document.getElementById("question")
        shakeElement(q_holder)
        //document.getElementById('correct').textContent = "Correct answer: " + answer;
        setTimeout(() => {
            if (currentMove < 4){
                document.getElementById("image_holder").innerHTML = '';
                document.getElementById('correct').textContent = "";
                document.getElementById("trivia-container").style.display = 'none';
                currentMove++
                fetchRandomArticle();
                document.getElementById("results-container").innerHTML = '<span class="redX">'+ answer +'</span>'
                setTimeout(() => {
                    document.getElementById("results-container").innerHTML = '';
                    document.getElementById("trivia-container").style.display = 'block';
                }, 600);
                
            } else {
                res = displayGameResults();
                document.getElementById("trivia-container").style.display = 'none';
                document.getElementById("results-container").appendChild(res);
            }
          }, 750);
    }
}

function replaceNthWordWithUnderscore(sentence, n) {
    const words = sentence.split(' ');

    if (n <= 0 || n > words.length) {
        // Invalid value of n, return the original sentence
        return sentence;
    }

    // Replace the nth word with an underscore
    words[n - 1] = '<input onkeydown="checkEnter(event)" type="text" id="answer" placeholder="What word is missing?">';

    // Join the words back into a sentence
    const modifiedSentence = words.join(' ');

    return modifiedSentence;
}

function shakeElement(element) {
    element.style.animation = 'shake 0.75s';
    
    // Remove the animation after it's completed
    setTimeout(() => {
      element.style.animation = '';
    }, 750);
  }

function pulseElementOnce(element) {
    // Add the pulse class to trigger the animation
    element.classList.add('pulse-once');

    // Remove the class after the animation ends
    setTimeout(() => {
        element.classList.remove('pulse-once');
    }, 600); // Adjust the duration of the animation (in milliseconds)
}
function checkEnter(event) {
    if (event.keyCode === 13) {
      // 13 is the key code for Enter
      checkAnswer();
    }
  }

function displayGameResults() {
    // Count the correct answers
    const correctAnswers = successHistory.filter(success => success).length;
    const totalQuestions = pastAnswers.length;

    // Create a div element to hold the results
    const resultsDiv = document.createElement('div');

    // Display the overall result
    resultsDiv.innerHTML = `<p>You got ${correctAnswers}/${totalQuestions} correct:</p>`;

    // Display each answer with corresponding emoji
    for (let i = 0; i < totalQuestions; i++) {
        const answer = pastAnswers[i];
        const isSuccess = successHistory[i];
        const resultElement = document.createElement('p');

        // Display answer text and corresponding emoji based on success
        resultElement.innerHTML = `${answer}: ${isSuccess ? '✔️ 🤜' : '❌🤦‍♀️'}`;

        // Append the result element to the results div
        resultsDiv.appendChild(resultElement);
    }

    // Create a "Try Again" button link
    const tryAgainButton = document.createElement('a');
    tryAgainButton.href = 'https://s-omas.github.io/holes/'; 
    tryAgainButton.innerHTML = 'Play Again';

    tryAgainButton.style.display = 'block';
    tryAgainButton.style.padding = '10px';
    tryAgainButton.style.marginTop = '20px';
    tryAgainButton.style.backgroundColor = '#4CAF50';
    tryAgainButton.style.color = 'white';
    tryAgainButton.style.textDecoration = 'none';
    tryAgainButton.style.border = 'none';
    tryAgainButton.style.borderRadius = '5px';
    tryAgainButton.style.cursor = 'pointer';

    // Append the "Try Again" button to the results div
    resultsDiv.appendChild(tryAgainButton);

    //share button
    const shareButton = document.createElement('button');
    shareButton.innerHTML = 'Share';
    shareButton.addEventListener('click', () => copyResultsToClipboard(resultsDiv));

    // Add styling to the "Share" button
    shareButton.style.display = 'block';
    shareButton.style.padding = '10px';
    shareButton.style.marginTop = '20px';
    shareButton.style.backgroundColor = '#008CBA';
    shareButton.style.color = 'white';
    shareButton.style.textDecoration = 'none';
    shareButton.style.border = 'none';
    shareButton.style.borderRadius = '5px';
    shareButton.style.cursor = 'pointer';

    // Append the "Share" button to the results div
    resultsDiv.appendChild(shareButton);

    //share button
    const gameLinkButton = document.createElement('button');
    gameLinkButton.innerHTML = 'Copy link to game';
    gameLinkButton.addEventListener('click', () => copyToClipboard(makeCustomUrl()));

    // Add styling to the "Share" button
    gameLinkButton.style.display = 'block';
    gameLinkButton.style.padding = '10px';
    gameLinkButton.style.marginTop = '20px';
    gameLinkButton.style.backgroundColor = '#008CBA';
    gameLinkButton.style.color = 'white';
    gameLinkButton.style.textDecoration = 'none';
    gameLinkButton.style.border = 'none';
    gameLinkButton.style.borderRadius = '5px';
    gameLinkButton.style.cursor = 'pointer';

    // Append the "Share" button to the results div
    resultsDiv.appendChild(gameLinkButton);

    // Return the results div
    return resultsDiv;
}


function copyResultsToClipboard(resultsDiv) {
    var resultsText = resultsDiv.innerText;
  
    // Create a temporary textarea to copy the text to clipboard
    const textarea = document.createElement('textarea');
    resultsText = resultsText.slice(0, -35);
    resultsText = resultsText + " play at holes.wiki"
    textarea.value = resultsText;
    document.body.appendChild(textarea);
  
    // Select and copy the text
    textarea.select();
    document.execCommand('copy');
  
    // Remove the temporary textarea
    document.body.removeChild(textarea);
  
    alert('Results copied to clipboard!');
  }

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function makeCustomUrl() {
    var urlstr = 'http://holes.wiki?'
    for (t in pastTitles) {
        urlstr = urlstr + t + '=' + pastTitles[t] + '&';
    }
    return urlstr.replaceAll(" ", "_");
}

function copyToClipboard(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;

    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
    alert("Link copied to clipboard!")
}