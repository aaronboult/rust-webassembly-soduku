let focusedCellID, livesEnabled, highlightingEnabled, allowMultipleSolutions, startTime;

let puzzle = {
    "grid": null,
    "solutions": null
};

$(function(){

    if (!("WebAssembly" in window)) {

        document.body.innerHTML = "Your browser does not support webasssembly.";
    
    }
    else{    

        GenerateGrid();

        $(window).click(function(e){
            
            if (focusedCellID){

                ClearSelectedCell();

                if (highlightingEnabled){

                    ClearHighlight();

                }

            }

        });

    }

});

/**
 * Clear any grid and generated a new 9x9 grid of cells
 */
function GenerateGrid(){

    $("#SodukuGrid").html("");

    for (let block = 0 ; block < 9 ; block++){

        $("#SodukuGrid").append(`<div style="grid-area: Block${block};" class="SodukuBlock" id="Block${block}"></div>`);

        for (let cell = 0 ; cell < 9 ; cell++){

            let yCoordinate = (Math.floor(block / 3) * 3) + (Math.floor(cell / 3));

            let xCoordinate = (block % 3) * 3 + (cell % 3);

            $(`#Block${block}`).append(`<div style="grid-area: Cell${cell};" id="Cell-${yCoordinate}-${xCoordinate}" enteredValue='-1' tempValue='-1'></div>`);

        }

    }

}

/**
 * Handles the initial generation of the puzzle and the assigning of event listeners
 */
function BeginSoduku(){

    $("html, body, .Cell").css("cursor", "progress");

    $("#BeginButton").css("grid-area", "");
    
    $("#BeginButton").css("display", "none");

    $("#Spinner").css("display", "block");

    $("#Spinner").css("grid-area", "Begin");

    setTimeout(() => {

        startTime = Date.now();

        livesEnabled = $("#InvalidAnswers").is(":checked") && !$("#InvalidAnswers").prop("disabled");

        if (livesEnabled){

            puzzle["lives"] = 5;

        }

        highlightingEnabled = $("#NumberHighlight").is(":checked");

        allowMultipleSolutions = !$("#ForceUnique").is(":checked") && !$("#ForceUnique").prop("disabled");

        let compressedData = generate_grid(parseInt($("#Difficulty").val()), !allowMultipleSolutions);

        puzzle["grid"] = [];

        puzzle["solutions"] = [];
        
        let currentCell = 0;
        
        for (let row = 0 ; row < 9 ; row++){
        
            puzzle["grid"].push([]);
        
            for (let col = 0 ; col < 9 ; col++){
        
                puzzle["grid"][row].push(compressedData[currentCell]);
        
                if (compressedData[currentCell] !== 0){
        
                    $(`#Cell-${row}-${col}`).attr("enteredValue", compressedData[currentCell]);
        
                    $(`#Cell-${row}-${col}`).html(compressedData[currentCell]);
        
                    $(`#Cell-${row}-${col}`).attr("lockedCell", "true");
        
                }
        
                currentCell++;
        
            }
        
        }
        
        for (let sol = 0 ; sol < Math.round(compressedData.length / 81) - 1 ; sol++){
        
            puzzle["solutions"].push([]);
        
            for (let row = 0 ; row < 9 ; row++){
        
                puzzle["solutions"][sol].push([]);
        
                for (let col = 0 ; col < 9 ; col++){
        
                    puzzle["solutions"][sol][row].push(compressedData[currentCell]);
        
                    currentCell++;
        
                }
        
            }
        
        }

        $(".BeginPanel").css("display", "none");

        $("html, body, .Cell").css("cursor", "default");

        console.log(`Generation took -> ${GetTimeTaken()}`);

        $(".SodukuBlock div").each(function(){

            $(this).addClass("SodukuCell")

            $(this).on("click", OnCellClick);

        });

        $(window).on("keydown", OnKeydown);

        startTime = Date.now();

    }, 100);

}

/**
 * Handles selected and deselecting of cells
 * @param {event} e The click event fired when a cell is clicked
 */
function OnCellClick(e){
    
    if ($(this).attr("lockedCell") !== "true"){

        if (this.id === focusedCellID){
            
            ClearSelectedCell();
            
        }
        else{

            if (focusedCellID){
                
                ClearSelectedCell();

            }

            $(this).addClass("SelectedCell");

            $("#Numberpad").css("display", "grid");

            focusedCellID = this.id;

            if (highlightingEnabled){

                ClearHighlight();

                HighlightAssociatedCells();

            }

        }

    }

    e.stopPropagation();

}

/**
 * Handles whether or not to pass the input to the Numberpad
 * @param {event} e The KeyboardEvent that is fired when a key is pressed down
 */
function OnKeydown(e){
    
    if (focusedCellID){

        let key = parseInt(e.key);

        if (!isNaN(key)){

            if (key > 0){

                Numberpad(e, key);

            }

        }
        else{

            switch(e.keyCode){

                case 8:

                    $("#NumpadClear").click();

                    break;
                
                case 13:

                    $("#NumpadEnter").click();

                    break;

            }

        }

    }

}

/**
 * Generate the Soduku grid as well as all possible solutions according to the users setup choices
 * @param {number} difficulty The value corresponding to the number of cells to be given as hints
 * @returns {*[]} Returns an array containing the generated grid and all solutions
 */
function GenerateSoduku(difficulty){
    
    let grid, solutions, result;

    do{

        grid = [];

        solutions = [];

        let template = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);

        for (let block = 0 ; block < 3 ; block++){

            for (let row = 0 ; row < 3 ; row++){

                grid.push(template);
                
                if (row !== 3){

                    let lastBlock = template.slice(6, 9);

                    template = template.slice(0, 6);

                    lastBlock.reverse();

                    for (let cell = 0 ; cell < 3 ; cell++){

                        template.unshift(lastBlock[cell]);

                    }

                }

            }

            let lastCell = template[8];

            template = template.slice(0, 8);

            template.unshift(lastCell);

        }

        let coordinates = {};

        let xCoordinate, yCoordinate;

        for (let i = 0 ; i < difficulty ; i++){

            do{

                yCoordinate = Math.round(Math.random() * 8);

                if (!coordinates.hasOwnProperty(yCoordinate)){

                    coordinates[yCoordinate] = [];

                }

            } while (coordinates[yCoordinate].length === 9);

            do{

                xCoordinate = Math.round(Math.random() * 8);
                
            } while (coordinates[yCoordinate].indexOf(xCoordinate) !== -1);

            coordinates[yCoordinate].push(xCoordinate);

        }

        for (let y = 0 ; y < 9 ; y++){

            for (let x = 0 ; x < 9 ; x++){

                if (coordinates.hasOwnProperty(y)){

                    if (coordinates[y].indexOf(x) !== -1){

                        continue;

                    }

                }
                
                grid[y][x] = 0;

            }

        }
        
        result = SolveGrid(JSON.parse(JSON.stringify(grid)), solutions);
        
    } while(result === -1 || solutions.length === 0);

    for (let y = 0 ; y < 9 ; y++){

        for (let x = 0 ; x < 9 ; x++){
            
            if (grid[y][x] !== 0){

                $(`#Cell-${y}-${x}`).attr("enteredValue", grid[y][x]);
    
                $(`#Cell-${y}-${x}`).html(grid[y][x]);
    
                $(`#Cell-${y}-${x}`).attr("lockedCell", "true");

            }

        }

    }

    return [grid, solutions];

}

/**
 * Solves a given grid, writing the solutions to a given array
 * @param {number[][]} grid An array containing the grid to try and solve
 * @param {number[][][]} solutions An array containing the solved grids of all found solutions
 * @returns {number} A value of undefined, -1 or -2 is returned; -1 -> grid is invalid for the chosen setup, -2 -> no more solutions were found
 */
function SolveGrid(grid, solutions){

    if (solutions.length > 1 && !allowMultipleSolutions){

        return -1;

    }

    for (let y = 0 ; y < 9 ; y++){

        for (let x = 0 ; x < 9 ; x++){

            if (grid[y][x] === 0){
            
                for (let currentNumber = 1 ; currentNumber < 10 ; currentNumber++){

                    if (CheckAxis(y, x, currentNumber, grid) && CheckSquare(y, x, currentNumber, grid)){

                        grid[y][x] = currentNumber;

                        let result = SolveGrid(grid, solutions);

                        if (result){
                            
                            return result;

                        }

                        grid[y][x] = 0;

                    }

                }
                
                return

            }

        }

    }
    
    if (!SolutionPresent(grid, solutions)){

        solutions.push(JSON.parse(JSON.stringify(grid)));

    }
    else{
        
        return -2;

    }

}

/**
 * Checks whether the passed grid is present in solutions
 * @param {number[][]} grid An array containing the grid to try and solve
 * @param {numberp[][][]} solutions An array containing the solved grids of all found solutions
 * @returns {boolean} Whether or not the given grid is present in solutions
 */
function SolutionPresent(grid, solutions){
    
    for (let y = 0 ; y < grid.length ; y++){

        for (let x = 0 ; x < grid[0].length ; x++){

            if (grid[y][x] === 0){
                
                return true;

            }

        }

    }

    let match = true;

    for (let solutionIndex = 0 ; solutionIndex < solutions.length ; solutionIndex++){

        for (let y = 0 ; y < solutions[solutionIndex].length ; y++){
    
            for (let x = 0 ; x < solutions[solutionIndex][0].length ; x++){
    
                if (solutions[solutionIndex][y][x] !== grid[y][x]){
    
                    match = false;
    
                }
    
            }
    
        }

    }
    
    return match && solutions.length !== 0;

}

/**
 * Checks whether or not value is valid when placed in grid[rowIndex][columnIndex] following standard Soduku rules
 * @param {number} rowIndex The index of the row to test
 * @param {number} columnIndex The index of the column to test
 * @param {number} value The value that is being tested
 * @param {number[][]} grid An array containing the grid to try and solve
 * @returns {boolean} Whether or not the move is valid
 */
function CheckAxis(rowIndex, columnIndex, value, grid){

    if (grid[rowIndex].indexOf(value) !== -1){

        return false;

    }

    for (let row = 0 ; row < 9 ; row++){

        if (grid[row][columnIndex] === value){

            return false;

        }

    }

    return true;

}

/**
 * Checks whether the given value is present within the respective block (3x3 group of cells)
 * @param {number} rowIndex The index of the row to test
 * @param {number} columnIndex The index of the column to test
 * @param {number} value The value that is being tested
 * @param {number[][]} grid An array containing the grid to try and solve
 * @returns {boolean} Whether or not the move is valid
 */
function CheckSquare(rowIndex, columnIndex, value, grid){

    let squareStartRow = 3 * Math.floor(rowIndex / 3);
    
    let squareStartColumn = 3 * Math.floor(columnIndex / 3);
    
    for (let row = 0 ; row < 3 ; row++){

        for (let column = 0 ; column < 3 ; column++){

            if (grid[squareStartRow + row][squareStartColumn + column] === value){

                return false;

            }

        }

    }

    return true;

}

/**
 * Handles inputting of values into selected cells
 * @param {event} e The event fired either from a keypress or a click
 * @param {number} value The number to input into the cell, or -1 for clearing a cell or -2 for entering a value
 */
function Numberpad(e, value){

    if (value > 0){

        $(`#${focusedCellID}`).attr("tempValue", value);

        $(`#${focusedCellID}`).html(value);

        if (highlightingEnabled){

            ClearHighlight();

            HighlightAssociatedCells();

        }

        e.stopPropagation();

    }
    else{

        switch(value){

            case -1:

                $(`#${focusedCellID}`).attr("tempValue", "-1");

                $(`#${focusedCellID}`).attr("enteredValue", "-1");

                $(`#${focusedCellID}`).html("");

                break;
            
            case -2:
                
                if ($(`#${focusedCellID}`).attr("tempValue") !== "-1"){
                
                    $(`#${focusedCellID}`).attr("enteredValue", $(`#${focusedCellID}`).attr("tempValue"));

                    $(`#${focusedCellID}`).html($(`#${focusedCellID}`).attr("tempValue"));
                
                    $(`#${focusedCellID}`).attr("tempValue", "-1");

                    $(`#${focusedCellID}`).removeClass("Incorrect");

                    if (livesEnabled){

                        CheckAnswerValidity();

                    }

                    CheckCompletion();
                
                }
                
                break;

        }

    }

}

/**
 * Highlights all cells with the same entered value as the selected cell
 */
function HighlightAssociatedCells(){

    let cellValue = $(`#${focusedCellID}`).html();

    for (let y = 0 ; y < 9 ; y++){

        for (let x = 0 ; x < 9 ; x++){

            if (`Cell-${y}-${x}` !== focusedCellID){

                if ($(`#Cell-${y}-${x}`).attr("enteredValue") === cellValue){

                    $(`#Cell-${y}-${x}`).addClass("Highlighted");

                }

            }

        }

    }

}

/**
 * Removes the highlight from all cells
 */
function ClearHighlight(){

    $(".Highlighted").each(function(){

        $(this).removeClass("Highlighted");

    });

}

/**
 * Clears the currently selected cell, as well as it's highlight and ID reference
 */
function ClearSelectedCell(){

    if ($(`#${focusedCellID}`).attr("enteredValue") !== "-1" && $(`#${focusedCellID}`).attr("enteredValue")){

        $(`#${focusedCellID}`).html($(`#${focusedCellID}`).attr("enteredValue"));

    }
    else{
        
        $(`#${focusedCellID}`).html("");

    }

    $(`#${focusedCellID}`).attr("tempValue", "-1");

    $(`#${focusedCellID}`).removeClass("SelectedCell");

    $("#Numberpad").css("display", "none");

    focusedCellID = null;

}

/**
 * Checks whether the Soduku grid is filled, and if so, is the grid correct
 */
function CheckCompletion(){

    let grid = [];

    for (let y = 0 ; y < 9 ; y++){

        grid.push([]);

        for (let x = 0 ; x < 9 ; x++){

            if ($(`#Cell-${y}-${x}`).attr("enteredValue") === "-1"){
                
                return false;

            }
            else{

                grid[y].push(parseInt($(`#Cell-${y}-${x}`).attr("enteredValue")));

            }

        }

    }

    if (SolutionPresent(grid, puzzle["solutions"])){

        DisplayEndScreen(true);

    }

}

/**
 * If lives were enabled on setup, this checks whether the inputted answer is correct
 */
function CheckAnswerValidity(){

    let cellIndex = focusedCellID.split("Cell-")[1].split("-");
    
    cellIndex.map((value, index, arr) => arr[index] = parseInt(value) );

    let enteredAnswer = parseInt($(`#${focusedCellID}`).attr("enteredValue"));

    let validAnswer = false;

    for (let solution = 0 ; solution < puzzle["solutions"].length ; solution++){

        if (puzzle["solutions"][solution][cellIndex[0]][cellIndex[1]] === enteredAnswer){

            validAnswer = true;

        }

    }
    
    if (!validAnswer){
        
        puzzle["lives"]--;

        if (puzzle["lives"] <= 0){

            DisplayEndScreen(false);

        }

        $(`#${focusedCellID}`).addClass("Incorrect");

    }

}

/**
 * Disable all event listeners and hover events on the soduku grid
 */
function DisabledGrid(){

    $(".SodukuBlock div").each(function(){

        $(this).removeClass("SodukuCell")

        $(this).unbind("click");

    });

    ClearHighlight();
    
    ClearSelectedCell();

}

/**
 * Calculate the time in minutes and seconds between a given date object and now
 * @returns {string} A string containing the minutes and seconds passed
 */
function GetTimeTaken (){

    let seconds = Math.floor((Date.now() - startTime) / 1000);

    let minutes = Math.floor(seconds / 60);

    seconds = seconds - (minutes * 60);

    return `${minutes} minutes ${seconds} seconds`;

}

/**
 * Displays the end screen and formats it as necessary
 * @param {boolean} success Whether or not the user completed the soduku successfully
 */
function DisplayEndScreen(success){

    DisabledGrid();

    $("#EndScreen").css("display", "grid");

    $("#EndTime").html(`Solving For: ${GetTimeTaken()}`);

    if (livesEnabled && puzzle["lives"] !== 0){

        $("#EndLives").html(`Lives Remaining: ${puzzle["lives"]}`);

    }
    else{

        $("#EndLives").css("display", "none");

    }

    if (success){

        $("#Heading").html("Congratulations, you solved it!");

    }
    else{

        $("#Heading").html("Sometimes things just don't go our way, but that doesn't mean we should give up!");

    }

}

/**
 * Regenerates the grid and displays the stup panel again
 */
function Reset(){

    $("#EndScreen").css("display", "none");

    $("#BeginPanel").css("display", "grid");

    $("#BeginButton").css("grid-area", "Begin");
    
    $("#BeginButton").css("display", "block");

    $("#Spinner").css("display", "none");

    $("#Spinner").css("grid-area", "");

    GenerateGrid();

}