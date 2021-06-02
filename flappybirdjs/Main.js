// Canvas
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var canvas_ratio_x = canvas.scrollWidth/canvas.width;
var canvas_ratio_y = canvas.scrollHeight/canvas.height;
// Game settings
var scroll_speed = -4;
var gravity_speed = 0.5;
var gravity = 8;
var jump_height = 10;
var pipe_frequency = 1500;
var pipe_gap = 90;
var less_difficult = 10;
// Game FPS
var fps = 0;
var show_fps = false;
var LAST_FRAME_TIME = 0;
function showFPS(){
    ctx.fillStyle = "White";
    ctx.font      = "normal 16pt Arial";

    ctx.fillText(fps + " fps", 10, 26);
}
// Game sounds
var theme_sound = new Audio('Sounds/themesong.mp3');
theme_sound.loop = true;
var flap_sound = new Audio('Sounds/sfx_wing.wav');
var hit_sound = new Audio('Sounds/sfx_hit.wav');
var score_sound = new Audio('Sounds/sfx_point.wav');
// Event logging
var log_key = null;
document.addEventListener("keydown", function(event){log_key = event.code;});
var log_mouse_pos = [0,0];
var log_mouse = null;
document.addEventListener("mousedown", function(event){log_mouse = event.button; log_mouse_pos=[event.offsetX,event.offsetY];})
// Support function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
}  
// Scene object
function Scene(x, y, width, height, texture)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.texture = new Image();
    this.texture.src = texture;
    
    this.draw = function()
    {
        ctx.drawImage(this.texture,this.x,this.y,this.width,this.height);
    }
    
    this.scrolling = function()
    {
        if (Math.abs(this.x) > 107) // Nếu abs(x) > 107 , reset vị trí
            this.x += 107; // Reset vị trí x
        else
            this.x +=scroll_speed; // Di chuyển x;
    }
}

function Bird(x, y, width, height, textures)
{
    // Bird properties
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // Bird texture, animation
    this.texture = new Image();
    this.index = 0;
    this.texture.src = textures[this.index];
    this.counter = 0;
    // Bird movement var
    this.angle = 0;
    this.jump = false;
    this.is_jumping = false;
    this.velocity = 0;

    this.draw = function()
    {
        ctx.save();
        ctx.translate(this.x+(this.width/2),this.y+(this.height/2));
        ctx.rotate(this.angle);
        ctx.translate(-this.x-(this.width/2),-this.y-(this.height/2));
        ctx.drawImage(this.texture,this.x,this.y,this.width,this.height);
        ctx.restore();
    }

    this.move = function(y)
    {
        this.y -= y;
    }
    
    this.move_handling = function(flying, game_over, is_running)
    {
        // Gravity
        if (flying && is_running)
        {
            if (log_key == 'Space' || log_mouse == 0) // Detect space press or mouse down
            {
                this.jump = true;
                log_key=null;
                log_mouse=null;
            }
            else this.jump = false;
            this.velocity -= gravity_speed; 
            if (this.velocity < -gravity)
                this.velocity = -gravity;
            if (this.y + this.height < 620) // Bird bottom Y < The ground Y
                this.move(this.velocity); // Apply gravity while bird is above ground Y
            this.angle = this.velocity * -0.04; // Bird rotate with velocity
        }
        // Jumping Control
        if (!game_over)
        {
            if (this.jump)
            {
                this.is_jumping = true;
                this.velocity = jump_height; // Set velocity to jump (to counteract the gravity pulling the bird down) and and jump with its amount
                this.move(this.velocity);
                flap_sound.load();
                flap_sound.play();
            }
            // Animation Handling
            this.counter+=1;
            if(this.counter > 5) // The number here indicates animation speed.
            {
                this.counter = 0;
                this.index += 1
                this.texture.src = textures[this.index];
                if (this.index >= textures.length)
                    this.index = 0;
                this.texture.src = textures[this.index];
            }
        }
    }
}

function Pipe(x, y, width, height, is_upside_down)
{
    // Pipe properties
    this.x = x;
    if(is_upside_down)
        this.y = y - height - pipe_gap;
    else
        this.y = y + pipe_gap;
    this.width = width;
    this.height = height;
    // Pipe texture
    this.texture = new Image();
    this.texture.src = 'Textures/pipe.png';
    // Check if pipe is bottom or top
    this.is_upside_down = is_upside_down;

    this.draw = function()
    {
        if (this.is_upside_down)
        {
            ctx.save();
            ctx.translate(this.x+(this.width/2),this.y+(this.height/2));
            ctx.rotate(Math.PI);
            ctx.translate(-this.x-(this.width/2),-this.y-(this.height/2));
            ctx.drawImage(this.texture,this.x,this.y,this.width,this.height);
            ctx.restore();
        }
        else ctx.drawImage(this.texture,this.x,this.y,this.width,this.height);
    }

    this.scrolling = function()
    {
        this.x += scroll_speed;
    }
}

function Button(x, y, width, height, texture)
{
    // Button properties
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // Button texture
    this.texture = new Image();
    this.texture.src = texture;
    // Check if button should be shown or not
    this.is_active = true;
    
    this.draw = function()
    {
        if(this.is_active)
            ctx.drawImage(this.texture,this.x,this.y,this.width,this.height);
    }
    // Mouse click collision
    this.click = function()
    {
        if (this.is_active)
        {
            if ((log_mouse_pos[0]>=this.x*canvas_ratio_x)&&(log_mouse_pos[0]<=(this.x+this.width)*canvas_ratio_x))
                var collision_x = true;
            else var collision_x = false;
            if ((log_mouse_pos[1]>=this.y*canvas_ratio_y)&&(log_mouse_pos[1]<=(this.y+this.height)*canvas_ratio_y))
                var collision_y = true;
            else var collision_y = false;
        }
        log_mouse_pos = [0,0];
        return(collision_x&&collision_y);
    }
}
// Bird and pipe collision check
function collisionCheck(bird, pipe)
{
    var bird_right = bird.x + bird.width;
    var bird_left = bird.x;
    var bird_top = bird.y;
    var bird_bottom = bird.y + bird.height;
    var pipe_left = pipe.x + less_difficult;
    var pipe_right = pipe.x + pipe.width - less_difficult;
    var pipe_bottom = pipe.y + pipe.height - less_difficult;
    var pipe_top = pipe.y + less_difficult;
    if((bird_right >= pipe_left)&&(bird_left <= pipe_right))
        var collision_x = true;
    else var collision_x = false;
    if ((bird_bottom >= pipe_top)&&(bird_top <= pipe_bottom))
        var collision_y = true;
    else var collision_y = false;
    return (collision_x && collision_y);
}
// Get game ticks
var d = new Date();
var last_pipe = d.getTime() - pipe_frequency;
// Game assets
var background = new Scene(0,-70,770,788,'Textures/bg.png');
var ground = new Scene(0,620,932,168,'Textures/ground.png');
var game_name = new Button(195,100,267,72,'Textures/flappybird.png');
var get_ready = new Button(230,280,200,54,'Textures/getready.png');
var start_button = new Button (280,350,100,56,'Textures/button_start.png');
var end_text = new Button(230,280,200,44,'Textures/gameover.png');
var ok_button = new Button (270,360,120,42,'Textures/button_ok.png');
var bird = new Bird(100,350,51,36,['Textures/bird1.png','Textures/bird2.png','Textures/bird3.png']);
// Turn off the game over assets
end_text.is_active = false;
ok_button.is_active = false;
// Game variables
var pipe_group = []; // Storing pipes
var hit_played = false; // Flag for playing hit sound (if we don't have this the hit sound will play constantly)
theme_sound.play(); // MUSIC
var restart = false; // Flag when player click replay button to restart the game to base state
var flying = false;  // Flag set to true when game starts and bird fly
var is_running = false; // Flag set to true when player press space or mouse click
var game_over = false; // Game over true if player loses, false if game start or replay
var pass_pipe = false; // Flag to check if player passed the pipes to add score
var score = 0; // Storing player score
function startGame(TIME)
{
    var game_start = false; // Flag to check if player clicked the start button or press space during the mainmenu
    if (game_over) // If game's over, show the game over buttons and check for mouse click on the ok button
    {
        end_text.is_active=true;
        ok_button.is_active=true;
        restart = ok_button.click();
    }
    if (restart == true) // If restart button is clicked, resets the game to base state
    {
        restart = false;
        flying = false;
        game_over = false;
        game_start = false;
        is_running = false;
        game_name.is_active=true;
        get_ready.is_active=true;
        start_button.is_active=true;
        end_text.is_active=false;
        ok_button.is_active=false;
        hit_played=false;
        pipe_group = [];
        score = 0;
        scroll_speed = -4;
        pipe_frequency = 1500;
        bird = new Bird(100,350,51,36,['Textures/bird1.png','Textures/bird2.png','Textures/bird3.png']);

    }
    if (log_key == 'Space' || log_mouse == 0) is_running = true;
    game_start = game_start | is_running;
    game_start = game_start & (start_button.click() || log_key=='Space');
    if (game_over == false && flying == false && game_start == true)
    {
        flying = true;
        game_name.is_active=false;
        start_button.is_active=false;
        get_ready.is_active=false;
    }

    // Check for collisions
    // Pipe collisions
    for (var i = 0; i < pipe_group.length; i++)
    {
        if (collisionCheck(bird,pipe_group[i]))
            game_over = true;
    }
    // Top and bottom boundary collisions
    if (bird.y + bird.height >= 620) game_over = true; // Bottom
    if (bird.y <= 0) game_over = true; // Top
    
    // Scoring
    if (pipe_group.length > 0)
    {
        if((bird.x + bird.width >= pipe_group[0].x)&&(pipe_group[0].x + pipe_group[0].width >= bird.x))
            var collision_x = true;
        else var collision_x = false;

        if (collision_x && pass_pipe == false) pass_pipe = true;
        if (pass_pipe)
        {
            if((pipe_group[0].x+pipe_group[0].width) < bird.x)
            {
                score+=1;
                if(score % 15 == 0)
                {
                    scroll_speed-=0.50;
                    pipe_frequency-=100;
                }
                score_sound.play();
                pass_pipe=false;
            }
        }
    }
    // Hit sound 
    if (game_over)
        if (!hit_played)
            {
                hit_sound.play();
                hit_played = true;
            }
    // Srolling the ground
    if(!game_over)
        ground.scrolling();
    // Controls
    bird.move_handling(flying, game_over, is_running);
    // Pipes creation handling
    if ((flying && !game_over) && is_running)
    {
        var newTime = new Date();
        var time_now = newTime.getTime();
        if(time_now - last_pipe > pipe_frequency)
        {
            var pipe_height = getRandomInt(150,500);
            var btm_pipe = new Pipe(650, pipe_height,78,568,false);
            var top_pipe = new Pipe(650, pipe_height,78,568,true);
            pipe_group.push(btm_pipe);
            pipe_group.push(top_pipe);
            last_pipe = time_now;
        }
        if (pipe_group.length > 0)
            if (pipe_group[0].x < -100)
                pipe_group.shift();
        for (var i = 0; i < pipe_group.length; i++)
            pipe_group[i].scrolling();
    }
    // Update
    background.draw();
    for (var i = 0; i < pipe_group.length; i++)
        pipe_group[i].draw();
    // Draw Score
    if (flying) // Only draw when playing
    {
        var numbers = Array.from(String(score),Number);
        var length_numbers = numbers.length;
        for (var i=0;i<length_numbers;i++)
        {
            path_button_score = "Textures/" + numbers[i] + ".png"
            score_text = new Scene((length_numbers - 1) * -15 + i * 25 + 315, 50, 24, 36,path_button_score)
            score_text.draw()
        }
    }
    bird.draw();
    ground.draw();
    // UI
    game_name.draw();
    start_button.draw();
    get_ready.draw();
    end_text.draw();
    ok_button.draw();
    // Render FPS
    if (show_fps) showFPS();
    fps = Math.round(1 / ((performance.now() - LAST_FRAME_TIME) / 1000));
    LAST_FRAME_TIME = TIME;
    requestAnimationFrame(startGame);
}
startGame();
