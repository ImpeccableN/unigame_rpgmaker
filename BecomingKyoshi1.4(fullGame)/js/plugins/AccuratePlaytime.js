

/*:
* @plugindesc Counts total playtime accurately regardless of framerate
* @help This plugin is plug-n-play and requires no parameters to set.
* To reset the play time, type ResetPlaytime in a plugin command window
* Version 1.3: Pause and ResumePlaytime commands added, also addressed a bug with doubling playtime
* Version 1.2: ResetPlaytime command
* Version 1.1: Addresses bug fix to saves not storing time correctly after multiple saves
*/

(function()
{
   
    var startTime = 0;
    var pausedTime = 0;
    var paused = false;
    var currentTime = 0;
    
    var _DataManager_setupNewGame = DataManager.setupNewGame;
    var _GameSystem_initialize = Game_System.prototype.initialize;
    var _GameSystem_onBeforeSave = Game_System.prototype.onBeforeSave;
    var _GameSystem_onAfterLoad = Game_System.prototype.onAfterLoad;  
    var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) 
    {
        _GameInterpreter_pluginCommand.call(this, command, args);
        if (command === 'ResetPlaytime') 
        {
            startTime = Date.now();
            $gameSystem._playtime = 0;
        }
        if (command === 'PausePlaytime')
        {
            if (paused) return;
            paused = true;
            pausedTime = Date.now() - startTime;
	    $gameSystem._playtime = pausedTime
        }
        if (command === 'ResumePlaytime')
        {
            if (!paused) return;
            paused = false;
            startTime = Date.now() - pausedTime;
	}
	if (command === 'TakePlaytime') 
        {
            currentTime = Date.now() - startTime;
            $gameSystem._playtime = currentTime;
        }
    };
    DataManager.setupNewGame = function() 
    {
        _DataManager_setupNewGame.call(this);
        startTime = Date.now();
    };
    
    Game_System.prototype.initialize = function() 
    {
        _GameSystem_initialize.call(this);
        this._playtime = null;
    };
    Game_System.prototype.onBeforeSave = function() 
    {
        _GameSystem_onBeforeSave.call(this);
        var saveTime = Date.now() - startTime;
        this._playtime = paused ? this._playtime + pausedTime : this._playtime + saveTime;
        startTime = Date.now();
        pausedTime = 0;
    };
    Game_System.prototype.onAfterLoad = function()
    {
        _GameSystem_onAfterLoad.call(this);
        if (!this._playtime){
            var t1 = new Date(1970, 0, 1);
            var t2 = new Date(1970, 0, 1, Math.floor(Math.floor($gameSystem._framesOnSave / 60) / 60 / 60).padZero(2), Math.floor(Math.floor($gameSystem._framesOnSave / 60) / 60 % 60).padZero(2), Math.floor(($gameSystem._framesOnSave / 60)  % 60).padZero(2));
            this._playtime = t2 - t1;
        }
        startTime = Date.now();
    };
    Game_System.prototype.playtime = function() 
    {
        return Math.floor((paused ? (this._playtime + pausedTime) : (Date.now() - startTime + this._playtime)) / 1000);
    };

})();