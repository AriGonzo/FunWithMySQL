var mysql 			= require('mysql');
var inquirer 		= require('inquirer');
var colors 			= require('colors');


//Create connection to mysql database

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: process.argv[2],
	database: 'bawplaylist'
});

//Connect to database instance

connection.connect(function(err){
    if(err) throw err;
  });  

//main menu functionality

function mainMenu(){
	var questions = [{
		type: 'rawlist',
		name: 'mainMenuChoice',
		message: 'What do you want to do?',
		choices: [
		'Check Songs on Playlist',
		'Add Songs to Playlist',
		'Remove Songs from Playlist',
		'Quit'
		]
	}]

	inquirer.prompt(questions).then(function(answers){
		if(answers.mainMenuChoice == "Add Songs to Playlist") {
			addNewArtist();
		} else if (answers.mainMenuChoice == "Check Songs on Playlist") {
			checkPlaylist();
		} else if (answers.mainMenuChoice == "Remove Songs from Playlist") {
			deleteFromPlaylist();
		} else {
			console.log("Goodbye!")
			process.exit();
		}
	});
}	

//checking playlist contents functionality

function checkPlaylist(){
	connection.query('SELECT * FROM music ', function(err, res){
		console.log("\n")
		var messages = []
		res.forEach(function(artistObj){
			console.log(artistObj.artist.underline.bold + " - " + artistObj.title);
		});
		console.log("\n")
		mainMenu()
	});
}

//add new artist functionality

function addNewArtist(){
	var questions = [{
		type: 'input',
		name: 'firstAnswer',
		message: 'What artist do you want to add?' 	
	},
	{
		type: 'input',
		name: 'secondAnswer',
		message: 'What song do you want to add?' 	
	},
	{
		type: 'input',
		name: 'thirdAnswer',
		message: 'What genre is this band?' 	
	}]

	inquirer.prompt(questions).then(function(data){
		var newArtist = {
			artist: data.firstAnswer,
			title: data.secondAnswer,
			genre: data.thirdAnswer
		}
		connection.query('INSERT INTO music SET ?', newArtist);

		mainMenu()
	});
}

//remove selection from playlist functionality

function deleteFromPlaylist(){
	connection.query('SELECT * FROM music ', function(err, res){
		var choices = [];
		res.forEach(function(selection){
			var selectionObj = {
				name: selection.artist.underline.bold + " - " + selection.title,
				value: selection.id,
				short: "\n" + selection.title + " removed!"
			}
			choices.push(selectionObj);
		});

		var seperator = new inquirer.Separator();
		var goBackChoice = {
			name: "<- Go Back".underline.bold,
			value: 'cancel',
			short: 'cancel'
		};

		choices.push(seperator);
		choices.push(goBackChoice);

		var questions = [{
			type: 'list',
			name: "deleteChoice",
			message: 'Which song do you want to remove?',
			choices: choices
		}]

		inquirer.prompt(questions).then(function(userSelection){
			if (userSelection.deleteChoice == "cancel") {
				mainMenu();
			} else {
				connection.query('DELETE FROM music WHERE ?', {id: userSelection.deleteChoice})
				mainMenu();
			}
		});
	})
}

mainMenu();
