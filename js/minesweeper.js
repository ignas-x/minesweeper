//
// TO DO(+bugs):
//
// First move - does not open clicked cell
//
// Add jQuery animation effects 
//
// Add running seconds ?
//
// change unexploded bombs icons ????
//

// GLOBAL VARIABLES
tableID = '#maintable';
var xSize = 15;
var ySize = 15;
var bombs = 30;
var firstClick = true;
var emptyCellsIndex = [[]];
var playername = "";

function newGameInit(){
	
	deleteMineField();
	createMineField();
	firstClick = true;
	$('#bombcounter').html(bombs);		

	$('#xray').bootstrapSwitch('state', false);
	if (playername != "") $('#playersname').html(playername + ",");
	if (playername != "Anonymous") $('#nameInput').val(playername);
}

function newGameStart(bombs, button){
	addBombs(bombs, button);
	firstClick = false;

	addNumbers();
	groupEmptyCells();

	var d = new Date();
	var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
	console.log("New game started at " + time);		
}



function createMineField(){
	
	$(tableID).removeClass("gamecompleted");
	$(tableID).removeClass("gameover");

	var row, cell, button, cell_id9;
	$(tableID).data('cols', xSize);
	$(tableID).data('rows', ySize);
	for (var row_id = 1; row_id <= ySize; row_id++){
		row = $('<tr></tr>',{
			id: "row_" + row_id
		});
		for (var col_id = 1; col_id <= xSize; col_id++) {
			cell = $('<td></td>',{
				id: "cell_" + row_id + "_" + col_id,
				html: '<span></span>'
			});
			cell.data('row', row_id);
			cell.data('col', col_id);
			button = $('<button></button>',{
				type:"button",
				class:"btn-xs btn-sweep-base",
				html: "&nbsp"
    			}// button attributes
			);
			button.mousedown(function(event) {
				if (firstClick) {
					newGameStart(bombs, this);
					$(this).css('opacity', 0);
				}
				else{
				switch (event.which) {
        			case 1: // Left Mouse button pressed.
  						if ($(this).css('opacity') != 0) {
							// if flagged or marked "?"
							if ($(this).parent().data("flagged")  || ($(this).parent().data('marked'))) {
								// do nothing
							}   		

							// if bomb and no flag				
							else if ($(this).parent().data('bomb')) {
								gameOver(this);
							}
							
							// if empty 
							else if (($(this).parent().data("group") != null) && (isNaN($(this).parent().data("bombs")))) {
								// uncover empty cells
								uncoverEmptyCells(this);
							}     			
							else $(this).css('opacity', 0);
						}	
						break;

			        case 2: // Middle Mouse button pressed

			            // If its a flagged cell
			            if ($(this).parent().data("flagged") || ($(this).parent().data('marked')) ){
								// do nothing on flagged cell
						}
						
						// if its an empty cell & not with number(which can also have empty cell group)
						else if (($(this).parent().data("group") != null) && (isNaN($(this).parent().data("bombs")))) {
						 	uncoverEmptyCells(this);
						}
						
						// If its an unflagged(first if eliminates them) cell with a number 
			            else if (!(isNaN($(this).parent().data("bombs"))) ) {
			            	// count correct flags around
			            	var flags = 0;
			            	var correct_flags = 0;
			            	var q_marks = 0;
							for (var r = -1; r <= 1; r++) {
							for (var c = -1; c <= 1; c++) {
								row9 = $(this).parent().data('row') + r; 
								col9 = $(this).parent().data('col') + c;
								if ((r != 0) || (c != 0)){
								if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){
									cell_id9 = "#cell_" + row9 + "_" + col9;
									if ($(cell_id9).data('flagged')) flags++;
									if ($(cell_id9).data('marked')) q_marks++;
									if ($(cell_id9).data('flagged') && $(cell_id9).data('bomb')) correct_flags++;
								}}// if
							}}// for
							
							// if correct flags around - uncover 3x3
							if (($(this).parent().data("bombs") == correct_flags) && (flags == correct_flags)) {
								// uncover surroundings
								for (var r = -1; r <= 1; r++) {
								for (var c = -1; c <= 1; c++) {
									row9 = $(this).parent().data('row') + r; 
									col9 = $(this).parent().data('col') + c;
									if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){
										cell_id9 = "#cell_" + row9 + "_" + col9;
										if (!($(cell_id9).data('bomb'))){
											$(cell_id9).children().eq(1).css('opacity', 0); // hide buttons
											// uncover more cells if empty cell around uncovered
											if (isCellEmpty(cell_id9)) uncoverEmptyCells($(cell_id9).children().eq(1));
										}
									}
								}}// for								
							}
							// if no flags or less flags then bombs act as simple left click on number - uncover it
							else if ((flags == 0) || (flags <= correct_flags)){ 
								$(this).css('opacity', 0);
								//uncoverEmptyCells(this);
								// if empty ucover surroundings
								//if ($(this).parent().data("group") != null) uncoverEmptyCells(this);
							}
							else { // (flags are placed uncorectly) - GAME OVER
								//find and mark unflagged bombs
								for (var r = -1; r <= 1; r++) {
								for (var c = -1; c <= 1; c++) {
									row9 = $(this).parent().data('row') + r; 
									col9 = $(this).parent().data('col') + c;
									if ((r != 0) || (c != 0)){
									if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){
										cell_id9 = "#cell_" + row9 + "_" + col9;
										if ($(cell_id9).data('bomb') && !($(cell_id9).data('flagged'))) {
											$(cell_id9).addClass("red");
											gameOver(this);
										}
									}}// if
								}}// for
							}// game over
			            }// middle + unflagged + number
			            
			            else{  // If its not a number (empty or bomb) and middle button pressed
				            // if bomb + middle
				            if ( $(this).parent().data('bomb') && !($(this).parent().data("flagged"))) {
								
								gameOver(this);
					
							}
							// open empty cell
							else $(this).css('opacity', 0);
						}


			            break;
			            
			        case 3:  // Right Mouse button pressed
						if ($(this).css('opacity') != 0) {
				            // if already flagged add "?"
				            if ($(this).parent().data("flagged")){
	   							$(this).removeClass("glyphicon glyphicon-flag red");
	   							$(this).html('<span class="question">?</span>');
								$(this).parent().data("flagged", false);
								$(this).parent().data("marked", true);
							}
							// if already marked remove all
				            else if ($(this).parent().data("marked")){
	   							//$(this).removeClass("glyphicon glyphicon-flag red");
								$(this).html("");   							
								$(this).parent().data("flagged", false);
								$(this).parent().data("marked", false);
							}
							else{ // flag it
								$(this).addClass("glyphicon glyphicon-flag red");
								$(this).parent().data("flagged", true);
								$(this).parent().data("marked", false);
							}
							// 
							if (gameCompleteCheck()) {
								$('.btn-sweep-base').css('opacity', '0');
								$(tableID).addClass("gamecompleted");
								console.log("Congratulations!!!");
								$('#GameCompletedModal').modal();
							}
						}
			            break;
			        default:
			            alert('You have a strange Mouse!');
			    }//switch
			}//else (not first click)
			});
			cell.append(button);
			row.append(cell);
		}
		$(tableID).append(row);
	}

	// disable right click menu
	$(tableID).bind('contextmenu', function(e) {return false;}); 

	// disable scroll on middle mouse
	document.body.onmousedown = function(e) { if (e.button === 1) return false; }

	console.log("Field created ");
}

function addBombs(bombs_nr, button){
	var col, row, cell_id;
	var bombs_counter = 0;
	while (bombs_counter < bombs_nr) {
		col = Math.floor((Math.random() * xSize) + 1);
		row = Math.floor((Math.random() * ySize) + 1);
		cell_id = "#cell_" + row + "_" + col;
		if (($(button).parent().data('row') != row) || ($(button).parent().data('col') != col)) { // don't place any bomb on first clicked cell
			if (!$(cell_id).data('bomb')) { // don't dublicate bombs
				$(cell_id).children().eq(0).addClass("glyphicon glyphicon-fire");//add bomb icon to span
				$(cell_id).data('bomb', true); // mark cell as bomb 
				bombs_counter++;
			}
		}
	}
	console.log(bombs_counter + " bombs successfully placed");
}

function addNumbers(){
	var col, row, cell_id;
	var cell_nr = 1;
	for (var x = 1; x <= xSize; x++) {
		for (var y = 1; y <= ySize; y++) {
			
			cell_id = '#cell_' + y + '_' + x;
			$(cell_id).data('cell_nr', cell_nr); cell_nr++; // add nr to cell
			
			if ($(cell_id).data('bomb')){
				// find 9 cells around each bomb
				var row9, col9, cell_id9 
				for (var r = -1; r <= 1; r++) {
				for (var c = -1; c <= 1; c++) {
					row9 = y + r; 
					col9 = x + c;
					if ((r != 0) || (c != 0)){
					if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){
						// count bombs in 9 cells around each of 9 cell around bomb 
						// (9*9 = 81 checks around each bomb)
						bombs = 0;
						var row81, col81, bombs;
						for (var rr = -1; rr <= 1; rr++) {
						for (var cc = -1; cc <= 1; cc++) {
							row81 = row9 + rr;
							col81 = col9 + cc;
							if ((rr != 0) || (cc != 0)){
							if ((row81 >= 1) && (col81 >= 1) && (row81 <= ySize) && (col81 <= xSize)){
								if ($("#cell_" + row81 + "_" + col81).data('bomb')) bombs++;
							}}
						}} // for 81 (rr & cc)
						cell_id9 = "#cell_" + row9 + "_" + col9;
						if (!($(cell_id9).data('bomb'))) {
							$(cell_id9).children().eq(0).html(bombs);
							$(cell_id9).data('bomb', false);
							$(cell_id9).data('bombs', bombs);
							var colors = ['', 'blue', 'green', 'red', 'darkblue', 'purple'];
							$(cell_id9).children().eq(0).addClass(colors[bombs]);
						}
					}}//if 9
				}}// for 9 (r & c)
			}// if bomb
		}//y
	}//x
}

function groupEmptyCells(){
	var cell_id;
	var cell_nr = 0;
	var group = 0;
	for (var x = 1; x <= xSize; x++) {
		for (var y = 1; y <= ySize; y++) {
			cell_id = "#cell_" + y + "_" + x;
			cell_nr = $(cell_id).data("cell_nr");		
			if ( isCellEmpty(cell_id) ) { 
				if (emptyCellsIndex[0].length == 0) {// add first ever empty cell as first (0) group
					emptyCellsIndex[0].push(cell_nr);
					$(cell_id).data("group", group);
					group++;
				}
				else{ // for all non first, empty cells
						var row9, col9, cell_id9;
						var any_group = false;
						loop9:
						for (var r = -1; r <= 1; r++) {
						for (var c = -1; c <= 1; c++) {
							row9 = y + r; 
							col9 = x + c;
							if ((r != 0) || (c != 0)){ // exclude itself
							if ( r==0 || c==0 ){	   // cross only (no diagonal neighbour cells)
							if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){ // not out of grid limits
								var cell_id9 = "#cell_" + row9 + "_" + col9;
								var cell_nr9 = $(cell_id9).data("cell_nr");
								if (isCellEmpty(cell_id9)) {
									if ($(cell_id).data("group") == null){ // if center cell has NO group									
										if ($(cell_id9).data("group") != null){
											$(cell_id).data("group", $(cell_id9).data("group"));
											any_group = true;
											break loop9;
										}
									}//

									// if center cell already has some group
									else if ($(cell_id9).data("group") != null) any_group = true;										
								}// if neighbour is empty
							}}}// if good 9
						}}// for loop 9
						if (!any_group) {
							$(cell_id).data("group", group);
							group++;
						}
				}// non first
			}// is empty
	}}//for

	// MERGE DISTANT GROUPS
	for (var x = 1; x <= xSize; x++) {
	for (var y = 1; y <= ySize; y++) {
		cell_id = "#cell_" + y + "_" + x;
		//cell_nr = $(cell_id).data("cell_nr");	
		if ( isCellEmpty(cell_id) ){
			var row9, col9, cell_id9;
			for (var r = -1; r <= 1; r++) {
			for (var c = -1; c <= 1; c++) {
				row9 = y + r; 
				col9 = x + c;
				if ((r != 0) || (c != 0)){ // exclude itself
				if ( r==0 || c==0 ){	   // cross only (no diagonal neighbour cells)
				if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){ // not out of grid limits
					var cell_id9 = "#cell_" + row9 + "_" + col9;
					//var cell_nr9 = $(cell_id9).data("cell_nr");
					if (isCellEmpty(cell_id9)) {
						if ($(cell_id).data("group") != $(cell_id9).data("group")){ // if neighbours but not the same code
							for (var xx = 1; xx <= xSize; xx++) {
							for (var yy = 1; yy <= ySize; yy++) {
								cell_id_x = "#cell_" + yy + "_" + xx;
								if ($(cell_id_x).data("group") == $(cell_id9).data("group")) $(cell_id_x).data("group", $(cell_id).data("group"));
							}}
						}
					}
				}}}
			}} //for 9
			
		} 
	}}// MERGE

	// EXPAND BY 1 CELL FOR numbers around empty cells
	for (var x = 1; x <= xSize; x++) {
	for (var y = 1; y <= ySize; y++) {
		cell_id = "#cell_" + y + "_" + x;
		//cell_nr = $(cell_id).data("cell_nr");	
		if ( isCellEmpty(cell_id) ){
			var row9, col9, cell_id9;
			for (var r = -1; r <= 1; r++) {
			for (var c = -1; c <= 1; c++) {
				row9 = y + r; 
				col9 = x + c;
				if ((r != 0) || (c != 0)){ // exclude itself
				//if ( r==0 || c==0 ){	   // cross only (no diagonal neighbour cells)
				if ((row9 >= 1) && (col9 >= 1) && (row9 <= ySize) && (col9 <= xSize)){ // not out of grid limits
					var cell_id9 = "#cell_" + row9 + "_" + col9;
					//var cell_nr9 = $(cell_id9).data("cell_nr");
					if ($(cell_id9).data("bombs")) {
						$(cell_id9).data("group", $(cell_id).data("group"));
					}
				}}//}
			}} //for 9
			//$(cell_id).children().eq(1).html($(cell_id).data("group")); // show group numbers on buttons
		} 
	}}// EXPAND

}

function gameCompleteCheck(){
	var cell_id;
	var good_flags = 0;
	var flags = 0;
	for (var x = 1; x <= xSize; x++) {
		for (var y = 1; y <= ySize; y++) {
			cell_id = '#cell_' + y + '_' + x;
			if ($(cell_id).data('flagged') && $(cell_id).data('bomb')) good_flags++;
			if ($(cell_id).data('flagged')) flags++;
	}}
	$('#flagcounter').html(flags);
	if ((good_flags == bombs) && (flags == good_flags)) return true;
	else return false;
}

function isCellEmpty(cell_id){
	if ((isNaN($(cell_id).data("bombs"))) && !($(cell_id).data("bomb"))) return true;
	else return false;
}

function uncoverEmptyCells(button){
	var col, row, cell_id;
	for (var x = 1; x <= xSize; x++) {
	for (var y = 1; y <= ySize; y++) {
		cell_id = "#cell_" + y + "_" + x;
		if (($(cell_id).data("group") == $(button).parent().data("group"))) $(cell_id).children().eq(1).css('opacity', 0);
	}}
}

function uncoverBombs(){
	var col, row, cell_id;
	for (var x = 1; x <= xSize; x++) {
	for (var y = 1; y <= ySize; y++) {
		cell_id = "#cell_" + y + "_" + x;
		if (($(cell_id).data("bomb")) && !($(cell_id).data("flagged"))) $(cell_id).children().eq(1).css('opacity', 0);
	}}
}

function gameOver(button){
	uncoverBombs();
	//$('.btn-sweep-base').css('opacity', '0');
	$(button).parent().addClass("red");
	$(tableID).addClass("gameover");
	console.log("R.I.P.");
	$('#GameOverModal').modal();
}


// UI Functions

function deleteMineField(){
	$('#maintable').children().remove();
}

function setMineFieldSize(){
	switch ($('#size').val()) {
		case "1x1":
			size = 1;
		break;
		case "5x5":
			size = 5;
		break;
		case "10x10":
			size = 10;
		break;
		case "15x15":
			size = 15;
		break;
		case "20x20":
			size = 20;
		break;
		case "25x25":
			size = 25;
		break;
		case "30x30":
			size = 30;
		break;
		default:
			size = 15;
	}
	xSize = size;
	ySize = size;

	b = $('#bombs').val();
	if (!isNaN(b) && b>0){
		if (b <= (xSize*ySize-1)) bombs = b;
		else bombs = xSize*ySize-1;
	}
	if ($('#nameInput').val() != "") playername = $('#nameInput').val();
	else playername = "";
	console.log("Hello " + playername);
	
	$('#NewGameModal').modal('hide');

}

console.log("---------------------------------");
console.log("MineSweeper (C) Ignas Gramba 2016");
console.log("---------------------------------");