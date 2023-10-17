const cardObjectDef = [
    {id: 1, imagePath: "./images/card-KingHearts.png"},
    {id: 2, imagePath: "./images/card-JackClubs.png"},
    {id: 3, imagePath: "./images/card-QueenDiamonds.png"},
    {id: 4, imagePath: "./images/card-AceSpades.png"}
]

const imgBackSrcPath = "./images/card-back-Blue.png"
const cardContElem = document.querySelector('.card-container')
let cards = []

const playGameButtonElem = document.querySelector('#playGame')

const collapsGridTapmlateArea = '"a a" "a a"'
const cardCollectionCellClass = '.card-pos-a'
const aceId = 4

let cardPositions = []

let gameInProgress = false 
let shufflingInProgress = false
let cardsReaveled = false

const currentGameStatusElem = document.querySelector('.current-status')
const scoreContainerElem = document.querySelector('.header-score-container')
const scoreElem = document.querySelector('.score')
const roundContainerElem = document.querySelector('.header-round-container')
const roundElem = document.querySelector('.round')

const winColor = "green"
const loseColor = "red"
const primaryColor = "black"

let roundNum = 0
const maxRounds = 4
let score = 0

let gameObj = {}

const localStorageGameKey = "HTA"
{/* <div class="card">
	<div class="card-inner">
		<div class="card-front">
			<img src="./images/card-JackClubs.png" alt="" class="card-img">
		</div>
		<div class="card-back">
			<img src="./images/card-back-Blue.png" alt="" class="card-img">
		</div>
	</div>
</div> */}

loadGame()

function gameOver(){

    updateStatusElem(scoreContainerElem, "none")
    updateStatusElem(roundContainerElem, "none")

    const gameOverMessage = `Game Over! - final score - <span class='badge'>${score}</span>
                            Click "Play Game" button to play again`

    updateStatusElem(currentGameStatusElem, "block", primaryColor, gameOverMessage)

    gameInProgress = false
    playGameButtonElem.disabled = false
}
function endRound(){

    setTimeout(() => {

        if (roundNum === maxRounds) {
        
            gameOver()
            return
        } else {
            startRound()
        }

    }, 3000);
}

function caclulateScoreToAdd(roundNum){
    if (roundNum == 1) {
        return 100
    } else if(roundNum == 2) {
        return 50
    }else if(roundNum == 3){
        return 25
    }else{
        return 10
    }
}

function caclulateScore(){
    const scoreToAdd = caclulateScoreToAdd(roundNum)
    score = score + scoreToAdd
}
function updateScore(){
    caclulateScore()
    updateStatusElem(scoreContainerElem, "block", primaryColor, `Score <span class="badge">${score}</span>`)
}

function chooseCard(card){

    if (canChooseCard()) {

        evaluateCardChoice(card)
        saveGameObjectToLocalStorage(score, roundNum)
        flipCard(card, false)

        setTimeout(() => {
            flipCards(false)
            updateStatusElem(currentGameStatusElem, "block", primaryColor, "Card position revealed")

            endRound()

        }, 3000)
        cardsReaveled = true
    }
}

function updateStatusElem(elem, display, color, innerHTML){

    elem.style.display = display

    if (arguments.length > 2) {
        elem.style.color = color
        elem.innerHTML = innerHTML
    }
}

function outputChoiceFeedback(hit){
    if(hit){
        updateStatusElem(currentGameStatusElem, "block", winColor, "Hit - Welldone!! :)")
    }else{
        updateStatusElem(currentGameStatusElem, "block", loseColor, "Missed!! :(")
    }
}

function evaluateCardChoice(card){
    if(card.id == aceId){
        updateScore()
        outputChoiceFeedback(true)
    }else{
        outputChoiceFeedback(false)
    }
}

function canChooseCard(){
    return gameInProgress == true && !shufflingInProgress && !cardsReaveled
}

function loadGame(){

    createCards()

    cards = document.querySelectorAll('.card')
    cardFlyInEffect()
    playGameButtonElem.addEventListener('click', () => startGame())

    updateStatusElem(scoreContainerElem, "none")
    updateStatusElem(roundContainerElem, "none")


}
function checkForIncompleteGame(){
    const serializedGameObj = getLocalStorageItemValue(localStorageGameKey)
    if (serializedGameObj) {
        gameObj = getObjectFromJSON(serializedGameObj)

        if (gameObj.round >= maxRounds) {
            removeLocalStorageItem(localStorageGameKey)
        }else{
            if(confirm('Would you like to continue your last game?')){
                score = gameObj.score
                round = gameObj.round
            }
        }
    }
}
function startGame(){
    initilizeAnewGame()
    startRound()
}
function initilizeAnewGame(){
    score = 0
    roundNum = 0

    checkForIncompleteGame()

    shufflingInProgress = false

    updateStatusElem(scoreContainerElem, "flex")
    updateStatusElem(roundContainerElem, "flex")

    updateStatusElem(scoreElem, "block", primaryColor, `Score <span class="badge">${score}</span>`)
    updateStatusElem(roundElem, "block", primaryColor, `Round <span class="badge">${roundNum}</span>`)
}
function startRound(){
    initilizeAnewRound()
    collectCards()
    flipCards(true)
    shuffelCards()
}
function initilizeAnewRound(){
    
    roundNum++

    playGameButtonElem.disabled = true

    gameInProgress = true
    shufflingInProgress = true
    cardsReaveled = false

    updateStatusElem(currentGameStatusElem, "block", primaryColor, "shuffling...")

    updateStatusElem(roundElem, "block", primaryColor, `Round <span class="badge">${roundNum}</span>`)
}
function collectCards(){
    transofrmGridArea(collapsGridTapmlateArea)
    addCardsToGridAreaCell(cardCollectionCellClass)
}
function transofrmGridArea(areas){
    cardContElem.style.gridTemplateAreas = areas
}
function addCardsToGridAreaCell(cellPositionClassName){
    const cellPositionElem = document.querySelector(cellPositionClassName)

    cards.forEach((card, index)=>{
        addChildElement(cellPositionElem, card)
    })
}

function flipCard(card, flipToBack){
    const innerCardElem = card.firstChild
    if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.add('flip-it')
    } else if (innerCardElem.classList.contains('flip-it')){
        innerCardElem.classList.remove('flip-it')
    }
}

function flipCards(flipToBack){
    cards.forEach((card, index)=>{
        setTimeout(() =>{
            flipCard(card, flipToBack)
        }, index * 100)
    } )
}

function cardFlyInEffect(){
    const id = setInterval(flyIn, 5)
    let cardCount = 0

    let count = 0

    function flyIn(){
        count++
        if (cardCount == cards.length) {
            clearInterval(id)
            playGameButtonElem.style.display = "inline-block"
        }
        if (count == 1 || count == 250 || count == 500 || count == 750) {
            cardCount++
            let card = document.getElementById(cardCount)
            card.classList.remove("fly-in")
        }
    }
}

function removeShuffleClasses(){
    cards.forEach((card)=>{
        card.classList.remove("shuffle-left")
        card.classList.remove("shuffle-right")
    })
}
function animatedShuffle(shuffleCount){

    const rand1 = Math.floor(Math.random() * cards.length) + 1
    const rand2 = Math.floor(Math.random() * cards.length) + 1

    let card1 = document.getElementById(rand1)
    let card2 = document.getElementById(rand2)

    if (shuffleCount % 4 == 0) {
        card1.classList.toggle("shuffle-left")
        card1.style.zIndex = 100
    }
    if (shuffelCards % 10 == 0) {
        card2.classList.toggle("shuffle-right")
        card2.style.zIndex = 200
    }
}

function shuffelCards(){
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0

    function shuffle(){

        randomizeCardPosition()

        animatedShuffle(shuffleCount)

        if(shuffleCount == 500){

            clearInterval(id)
            shufflingInProgress = false
            removeShuffleClasses()
            dealCards()
            updateStatusElem(currentGameStatusElem, "block", primaryColor, "Please click the card you think its Ace of Spades..")

        }else{
            shuffleCount++;
        }     
        
    }
}

function randomizeCardPosition(){
    
    const rand1 = Math.floor(Math.random() * cards.length) + 1 
    const rand2 = Math.floor(Math.random() * cards.length) + 1

    const temp = cardPositions[rand1 - 1]
    cardPositions[rand1 - 1] = cardPositions[rand2 - 1]
    cardPositions[rand2 - 1] = temp
}

function dealCards(){
    addCardToAppropriateCell()
    const tamplateAreas = returnGridAreaMapToCardPos()
    transofrmGridArea(tamplateAreas)
}

function returnGridAreaMapToCardPos(){

    let firstPart = ""
    let secondPart = ""
    let areas = ""

    cards.forEach((card, index) =>{

        if (cardPositions[index] == 1) {
            areas = areas + "a "
        } else if(cardPositions[index] == 2) {
            areas = areas + "b "
        } else if(cardPositions[index] == 3){
            areas = areas + "c "
        }else if(cardPositions[index] == 4){
            areas = areas + "d "
        }
        if(index == 1){
            firstPart = areas.substring(0, areas.length - 1)
            areas = ""
        }else if(index == 3){
            secondPart = areas.substring(0, areas.length - 1)
        }
    })

    return `"${firstPart}" "${secondPart}"`
}
function addCardToAppropriateCell(){
    cards.forEach((card)=>{
        addCardToGridCell(card)
    })
}
function createCards(){
    cardObjectDef.forEach((card) =>{
        createCard(card)
    })
}


function createCard(cardItem){

    //create divs as card 
    const cardElem = document.createElement('div')
    const cardInnerElem = document.createElement('div')
    const cardFrontElem = document.createElement('div')
    const cardBackElem = document.createElement('div')

    //front and back img elements for a card
    const cardFrontImg = document.createElement('img')
    const cardBackImg = document.createElement('img')


    //add class and id to card element
    addClassToElement(cardElem, 'card')
    addClassToElement(cardElem, "fly-in")
    addIdToElement(cardElem, cardItem.id)

    //add class to innerElement
    addClassToElement(cardInnerElem, 'card-inner')

    //add class to cardFrontElem
    addClassToElement(cardFrontElem, 'card-front')

    //add class to cardBackElement
    addClassToElement(cardBackElem, 'card-back')

    //assing src to img backElement
    addSrcToImgElem(cardBackImg, imgBackSrcPath)

    //assign src to imgFrontElement
    addSrcToImgElem(cardFrontImg, cardItem.imagePath)

    //add classes to imgFront/BackElements
    addClassToElement(cardFrontImg, 'card-img')
    addClassToElement(cardBackImg, 'card-img')

    //add back image element as child to front card element
    addChildElement(cardFrontElem, cardFrontImg)

    //add back image element as child to back card element
    addChildElement(cardBackElem, cardBackImg)

    //add cardFront/backElement to cardInnerElement

    addChildElement(cardInnerElem, cardFrontElem)
    addChildElement(cardInnerElem, cardBackElem)

    //add cardInnerElem to cardElement
    addChildElement(cardElem, cardInnerElem)

    //add card element as child element to appripriate grid cell
    addCardToGridCell(cardElem)


    initilizeCardPostions(cardElem)

    attachEventListnerToCard(cardElem)
}

function attachEventListnerToCard(card){
    card.addEventListener('click', ()=>chooseCard(card))
}

function initilizeCardPostions(card){
    cardPositions.push(card.id)
}

function createElement(elemType){
    return document.createElement(elemType)
}

//add a class to an html element
function addClassToElement(elem, className){
    elem.classList.add(className)
}

//add id to an element
function addIdToElement(elem, id){
    elem.id = id
}

function addSrcToImgElem(imgElem, src){
    imgElem.src = src
}
function addChildElement(parentElemet, childElement){
    parentElemet.appendChild(childElement)
}

function addCardToGridCell(card){
    const cardElemClassName = mapCardIdToGridCell(card)
    const cardPosElem = document.querySelector(cardElemClassName)

    addChildElement(cardPosElem, card)
}
function mapCardIdToGridCell(card){
    if(card.id == 1)
    {
        return '.card-pos-a'
    }
    else if(card.id == 2)
    {
        return '.card-pos-b'
    }
    else if(card.id == 3)
    {
        return '.card-pos-c'
    }
    else if(card.id == 4)
    {
        return '.card-pos-d'
    }
}

//local storage
function getSerializedObjectAsJSON(obj){
    return JSON.stringify(obj)
}
function getObjectFromJSON(json){
    return JSON.parse(json)
}
function updateLocalStorageItem(key, value){
    localStorage.setItem(key, value)
}
function removeLocalStorageItem(key){
    localStorage.removeItem(key)
}
function getLocalStorageItemValue(key){
    return localStorage.getItem(key)
}
function updateGameObject(score, round){
    gameObj.score = score
    gameObj.round = round
}
function saveGameObjectToLocalStorage(score, round){
    updateGameObject(score, round)
    updateLocalStorageItem(localStorageGameKey, getSerializedObjectAsJSON(gameObj))
}