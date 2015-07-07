var targetWord = '',
    wordMeanings = [],
    maxLives = 6,
    guesses = [],
    colors = ["#E91E63", "#E91E63", "#7C4DFF", "#3F51B5", "#4CAF50", "#FF5722", "#009688"];

// Load random nouns using the Wordnik API
function loadWord() {
    $.ajax({
        url: 'http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=4&maxLength=8&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
        async: false
    }).done(function(data) {
            targetWord = data.word;
            var defUrl = 'http://api.wordnik.com:80/v4/word.json/' + targetWord + '/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
            $.ajax({
                url: defUrl
            }).done(function(meaning) {
                    wordMeanings = [];
                    for(meanings in meaning) {
                        wordMeanings.push(meaning[meanings].text);
                    }
                });
    }, 'json');
}

function drawWord() {
    if (targetWord == '') {
        loadWord();
    }
    $('#targetWord').html(obfuscateWord());
}

function cleanGuesses() {
    var uniqueGuesses = [];
    $.each(guesses, function(index, element) {
        if (element.length > 0 && $.inArray(element, uniqueGuesses) == -1) {
            uniqueGuesses.push(element);
        }
    });
    guesses = uniqueGuesses;
}

// Get all the guesses from the guess input
function getGuesses() {
    if(/^[a-zA-Z]*$/.test($('#guess').val()) && typeof $('#guess').val() !== undefined) {
        guesses.push($('#guess').val().toLowerCase());
    }
}

function backgroundColor(){
    $('body').css('background', colors[Math.floor(Math.random()*colors.length)]);
}

function drawGuesses() {
    guesses.sort();
    $('#previousGuesses').html(guesses.join(', '));
}

function hasWon() {
    if(obfuscateWord() == targetWord) {
        endGameDialog(true);
    }
}

function endGameDialog(isWinner) {
    if(isWinner) {
        $('#endGameDialog').text('You won! You guessed ' + targetWord.toUpperCase() + ' in ' + guesses.length + ' guesses.');
    } else {
        $('#endGameDialog').html('You lose! The word was ' + targetWord.toUpperCase() + '<br/><a href="javascript:resetGame();">Reset</a>');
    }
}

// Check if guess letter and targetWord letter match
function obfuscateWord() {
    var obfuscatedWord = '';
    for(var i = 0; i < targetWord.length; i++) {
        if(guesses.indexOf(targetWord[i].toLowerCase(), 0) == -1) {
            obfuscatedWord += '_';
        } else {
            obfuscatedWord += targetWord[i];
        }
    }
    return obfuscatedWord;
}

// Decrease lives and check if lives <= 0
function livesLeft() {
    var livesRemaining = maxLives,
        string = targetWord.toLowerCase();
    $('#lives').text(livesRemaining);
    for (var i = 0; i < guesses.length; i++) {
        if (string.indexOf(guesses[i], 0) == -1) {
            livesRemaining--;
            $('#lives').text(livesRemaining);
        }
    }
    if (livesRemaining <= 0) {
        $('#lives').text('0');
        endGameDialog(false);
        return;
    }
}

function resetGame() {
    targetWord = '';
    wordMeanings = [];
    guesses = [];
    drawWord();
}

// Update stuff after player losses or wins
function updateGuesses() {
    getGuesses();
    cleanGuesses();
    drawWord();
    drawGuesses();
    livesLeft();
    hasWon();
}

$(function() {
    backgroundColor();
    drawWord();
    drawGuesses();
    $('#guess').keypress(function(event) {
        if(event.which == 13) {
            updateGuesses();
            $('#guess').val('');
        }
    });
});