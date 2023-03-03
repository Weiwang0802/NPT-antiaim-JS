function RADTODEG(radians){
    return radians * 180 / Math.PI
}
function calcAngle(source,entityPos){
    var delta = []
    delta[0] = source[0] - entityPos[0]
    delta[1] = source[1] - entityPos[1]
    delta[2] = source[2] - entityPos[2]
    var angles = []
    var viewangles = Local.GetViewAngles()
    angles[0] = RADTODEG(Math.atan(delta[2] / Math.hypot(delta[0], delta[1]))) - viewangles[0]
    angles[1] = RADTODEG(Math.atan(delta[1] / delta[0])) - viewangles[1]
    angles[2] = 0
    if(delta[0] >= 0)
        angles[1] += 180

    return angles
}
UI.AddSliderInt("Max Brute FOV", 0, 35)
UI.AddCheckbox("Anti-Enable")
var shots = 0
function onBulletImpact(){
    var ent = Entity.GetEntityFromUserID(Event.GetInt("userid"))
    if(ent == Entity.GetLocalPlayer() || Entity.IsTeammate(ent))
        return
    var pos = [Event.GetFloat("x"), Event.GetFloat("y"), Event.GetFloat("z")]
    var ang = calcAngle(Entity.GetEyePosition(ent), pos)
    var angToLocal = calcAngle(Entity.GetEyePosition(ent), Entity.GetHitboxPosition(Entity.GetLocalPlayer(), 0))
    var delta = [angToLocal[0]-ang[0],angToLocal[1]-ang[1],0]
    var FOV = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1])
    if(FOV < UI.GetValue("Max Brute FOV"))
        UI.ToggleHotkey("Anti-Aim", "Fake angles", "Inverter")
    if(UI.GetValue("Anti-Enable")){
        shots++
        if(!(shots % 4)) UI.ToggleHotkey("Anti-Aim", "Fake angles", "Inverter")
    }
}
function playerhurt(){
    if(Entity.GetEntityFromUserID(Event.GetInt("userid")) == Entity.GetLocalPlayer())
        UI.ToggleHotkey("Anti-Aim", "Fake angles", "Inverter")
}
Cheat.RegisterCallback("player_hurt", "playerhurt")
Cheat.RegisterCallback("bullet_impact", "onBulletImpact")


var LOFI_MODES = [
    "Static",
    "Switch",
    "Sway"
]

var LOFI_YAW_MODE = UI.AddDropdown( "Yaw Mode", LOFI_MODES );
var LOFI_YAW_BASE = UI.AddSliderInt( "Yaw Base Value", -180, 180 );
var LOFI_YAW_FROM = UI.AddSliderInt( "Yaw From Value", -180, 180 );
var LOFI_YAW_TO = UI.AddSliderInt( "Yaw To Value", -180, 180 );
var LOFI_YAW_INT = UI.AddSliderInt( "Yaw Tick Interval", 2, 64 );

var LOFI_ROT_MODE = UI.AddDropdown( "Rotation Mode", LOFI_MODES ); 
var LOFI_ROT_BASE = UI.AddSliderInt( "Rotation Base Value", -180, 180 ); 
var LOFI_ROT_FROM = UI.AddSliderInt( "Rotation From Value", -180, 180 ); 
var LOFI_ROT_TO = UI.AddSliderInt( "Rotation To Value", -180, 180 ); 
var LOFI_ROT_INT = UI.AddSliderInt( "Rotation Tick Interval", 2, 64 ); 

var LOFI_LBY_MODE = UI.AddDropdown( "LBY Mode", LOFI_MODES ); 
var LOFI_LBY_BASE = UI.AddSliderInt( "LBY Base Value", -180, 180 );
var LOFI_LBY_FROM = UI.AddSliderInt( "LBY From Value", -180, 180 );
var LOFI_LBY_TO = UI.AddSliderInt( "LBY To Value", -180, 180 );
var LOFI_LBY_INT = UI.AddSliderInt( "LBY Tick Interval", 2, 64 );

var LOFI_SWITCH = function(START, END, FROM, TO) {
    var INTERVAL_LENGTH = END-START;
    var LENGTH_PROGRESS = (Global.Tickcount() - START) / INTERVAL_LENGTH;
    if (LENGTH_PROGRESS < 0.5) {
        return FROM
    } else {
        return TO
    }
}

var LOFI_SWAY = function(START, END, FROM, TO) {
    var INTERVAL_LENGTH = END-START;
    var LENGTH_PROGRESS = (Global.Tickcount() - START) / INTERVAL_LENGTH
    if (LENGTH_PROGRESS < 0.5) {
        return FROM + (TO-FROM) * (LENGTH_PROGRESS * 2)
    } else {
        return FROM + (TO-FROM) * 2 - (TO-FROM) * (LENGTH_PROGRESS * 2)
    }
}

var LOFI_DRAW = function() {
    var YAW, ROT, LBY;
    var YAW_MODE = LOFI_MODES[UI.GetValue("Yaw Mode")];
    var ROT_MODE = LOFI_MODES[UI.GetValue("Rotation Mode")]
    var LBY_MODE = LOFI_MODES[UI.GetValue("LBY Mode")]

    var START_TICK = Math.floor( Global.Tickcount() / UI.GetValue("Yaw Tick Interval") ) * UI.GetValue("Yaw Tick Interval")
    var END_TICK = Math.floor( Global.Tickcount() / UI.GetValue("Yaw Tick Interval") + 1 ) * UI.GetValue("Yaw Tick Interval")
    if (YAW_MODE == "Static") {
        YAW = UI.GetValue("Yaw Base Value")
    } else if(YAW_MODE == "Switch") {
        YAW = LOFI_SWITCH(START_TICK, END_TICK, UI.GetValue("Yaw From Value"), UI.GetValue("Yaw To Value"))
    } else if(YAW_MODE == "Sway") {
        YAW = LOFI_SWAY(START_TICK, END_TICK, UI.GetValue("Yaw To Value"), UI.GetValue("Yaw To Value"))
    }

    var START_TICK = Math.floor( Global.Tickcount() / UI.GetValue("Rotation Tick Interval") ) * UI.GetValue("Rotation Tick Interval")
    var END_TICK = Math.floor( Global.Tickcount() / UI.GetValue("Rotation Tick Interval") + 1 ) * UI.GetValue("Rotation Tick Interval")
    if (ROT_MODE == "Static") {
        ROT = UI.GetValue("Rotation Base Value")
    } else if(ROT_MODE == "Switch") {
        ROT = LOFI_SWITCH(START_TICK, END_TICK, UI.GetValue("Rotation From Value"), UI.GetValue("Rotation To Value"))
    } else if(ROT_MODE == "Sway") {
        ROT = LOFI_SWAY(START_TICK, END_TICK, UI.GetValue("Rotation From Value"), UI.GetValue("Rotation To Value"))
    }

    var START_TICK = Math.floor( Global.Tickcount() / UI.GetValue("LBY Tick Interval") ) * UI.GetValue("LBY Tick Interval")
    var END_TICK = Math.floor( Global.Tickcount() / UI.GetValue("LBY Tick Interval") + 1 ) * UI.GetValue("LBY Tick Interval")
    if (LBY_MODE == "Static") {
        LBY = UI.GetValue("Yaw Base Value")
    } else if(LBY_MODE == "Switch") {
        LBY = LOFI_SWITCH(START_TICK, END_TICK, UI.GetValue("LBY From Value"), UI.GetValue("LBY To Value"))
    } else if(LBY_MODE == "Sway") {
        LBY = LOFI_SWAY(START_TICK, END_TICK, UI.GetValue("LBY From Value"), UI.GetValue("LBY To Value"))
    }

    AntiAim.SetOverride(1);
    AntiAim.SetRealOffset( YAW );
    AntiAim.SetFakeOffset( ROT );
    AntiAim.SetLBYOffset( LBY );
}

function Unload() {
    AntiAim.SetOverride(0);
}

Cheat.RegisterCallback("Draw", "LOFI_DRAW");
Cheat.RegisterCallback("Unload", "Unload")
UI.AddSliderInt("", 0, 0);
UI.AddLabel("           KillSound        ");
var iKills = 0, iSize = 0, iFrame = 0, iAlpha = 0, iTotalKills = 0, iExp = 0, iScore = 0, getExp = 0, yOffset = 0, iMedal = 0;
function EVENT_MATCH_END()
{
    RESET();
    iTotalKills = 0, iExp = 0, iScore = 0, getExp = 0, iMedal = 0;
}   
function EVENT_PLAYER_SPAWN()
{
    PlayerIndex = Event.GetInt("userid"); iPlayerIndex = Entity.GetEntityFromUserID(PlayerIndex);
    if(Entity.GetLocalPlayer() == iPlayerIndex)    RESET();
}
function EVENT_ROUND_START()
{
    RESET();
}
function HUD_REDRAW()
{   
    if (!Entity.IsAlive(Entity.GetLocalPlayer()) || iKills < 1) return;   
    iFrame--;
    iAlpha--;
    if(iFrame < 255 && iFrame > 0)
    {   
        
           
            if(iKills == 1)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-35, 1," First Blood !",    [ 255,255,255,iAlpha ], 4);
            if(iKills == 2)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-30, 1," Double Kill !",   [ 255,255,255,iAlpha ], 4);
            if(iKills == 3)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-25, 1," Killing Spree ! ", [ 255,255,255,iAlpha ], 4);   
            if(iKills == 4)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Dominating ! ",    [	255,255,255,iAlpha ],4);
            if(iKills == 5)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Mega Kill ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 6)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Unstoppable ! ",   [	255,255,255,iAlpha ], 4);
            if(iKills == 7)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Wicked Sick ! ",   [	255,255,255,iAlpha ], 4);
            if(iKills == 8)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Monster Kill ! ",  [	255,255,255,iAlpha ], 4);
            if(iKills == 9)   Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," God Like ! ",      [	255,255,255,iAlpha ], 4);
            if(iKills == 10)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 11)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 12)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 13)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 14)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
            if(iKills == 15)  Render.String(Global.GetScreenSize()[0]/2,Global.GetScreenSize()[1]/3-10, 1," Holy Shit ! ",     [	255,255,255,iAlpha ], 4);
        
        
        if(iKills == 1)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "1 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 2)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "2 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 3)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "3 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 4)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "4 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 5)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "5 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 6)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "6 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 7)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "7 streak ", [255,0,255,iAlpha ], 4);
        } 
        if(iKills == 8)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "8 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 9)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "9 streak ", [ 255,0,255,iAlpha ], 4);
        } 
        if(iKills == 10)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "10 streak ", [ 255,0,255,iAlpha ], 4);
        }    
        if(iKills == 11)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "11 streak ", [ 255,0,255,iAlpha ], 4);
        }  
        if(iKills == 12)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "12 streak ", [ 255,0,255,iAlpha ], 4);
        }  
        if(iKills == 13)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "13 streak ", [ 255,0,255,iAlpha ], 4);
        }  
        if(iKills == 14)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "14 streak ", [ 255,0,255,iAlpha ], 4);
        }  
        if(iKills == 15)
        {
            Render.String(Global.GetScreenSize()[0]/2, Global.GetScreenSize()[1]/3+30, 1, "15 streak ", [ 255,0,255,iAlpha ], 4);
        }  
    }
}
function EVENT_DEATH()
{
    iVictim = Event.GetInt("userid"); iVictim_index = Entity.GetEntityFromUserID(iVictim);
    iAttacker = Event.GetInt("attacker"); iAttacker_index = Entity.GetEntityFromUserID(iAttacker);
    if(Entity.GetLocalPlayer() == iVictim_index && Entity.GetLocalPlayer() !== iAttacker_index)    return; 
    if(Entity.GetLocalPlayer() == iAttacker_index)
    {
        iExp = getExp;
        iScore = iExp + iScore;
        yOffset = 0;
        if(iKills > 14)    iKills = 0;       
        iKills++;
        iTotalKills++;
        if(iKills >= 3)    iMedal += 1;
        playerName = Entity.GetName(iVictim_index);
        iSize = 48;
        iFrame = 255;
        iAlpha = 255;
        if (getCustomValue('Enable Kill Sound'))
        {   
            if(iKills == 1)    Global.PlaySound("ot/1.wav");
            if(iKills == 2)    Global.PlaySound("ot/2.wav");
            if(iKills == 3)    Global.PlaySound("ot/3.wav");
            if(iKills == 4)    Global.PlaySound("ot/4.wav");
            if(iKills == 5)    Global.PlaySound("ot/5.wav");
            if(iKills == 6)    Global.PlaySound("ot/6.wav");
            if(iKills == 7)    Global.PlaySound("ot/7.wav");
            if(iKills == 8)    Global.PlaySound("ot/8.wav");
            if(iKills == 9)    Global.PlaySound("ot/9.wav");
            if(iKills == 10)    Global.PlaySound("ot/10.wav");
            if(iKills == 11)    Global.PlaySound("ot/10.wav");
            if(iKills == 12)    Global.PlaySound("ot/10.wav");
            if(iKills == 13)    Global.PlaySound("ot/10.wav");
            if(iKills == 14)    Global.PlaySound("ot/10.wav");
            if(iKills == 15)    Global.PlaySound("ot/10.wav");
        }       
    }
}
function RESET()
{
    iKills = 0, iSize = 0, iFrame = 0, iAlpha = 0, yOffset = 0;
}
function getCustomValue(name)
{
    var value = UI.GetValue("MISC", "JAVASCRIPT", "Script items", name);
    return value;
}   
function Main()
{
    UI.AddCheckbox('Enable Kill Sound');   
    Global.RegisterCallback("Draw", "HUD_REDRAW");
    Global.RegisterCallback("player_death", "EVENT_DEATH");
    Global.RegisterCallback("round_start", "EVENT_ROUND_START");
    Global.RegisterCallback("player_spawned", "EVENT_PLAYER_SPAWN");
    Global.RegisterCallback("cs_intermission", "EVENT_MATCH_END");
    Global.RegisterCallback("cs_win_panel_match", "EVENT_MATCH_END");
} 

Main();